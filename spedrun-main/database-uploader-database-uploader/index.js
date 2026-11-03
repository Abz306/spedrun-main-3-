require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { from: copyFrom } = require('pg-copy-streams');

// We strictly need the DATABASE_URL to run schema creation and SQL files
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Missing DATABASE_URL in .env file.');
  process.exit(1);
}

const BASE_DIR = path.join(__dirname, 'Database');
const RPCS_DIR = path.join(__dirname, 'rpcs'); // Added path for RPCs

async function main() {
  console.log('Starting Database Upload Process...\n');

  if (!fs.existsSync(BASE_DIR)) {
    console.error(`❌ Base directory not found: ${BASE_DIR}`);
    return;
  }

  // Initialize a single Postgres client for the whole script
  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    await client.connect();
    console.log('✅ Connected to Postgres database.\n');
  } catch (err) {
    console.error(`❌ Failed to connect to database: ${err.message}`);
    process.exit(1);
  }

  const folders = fs.readdirSync(BASE_DIR);

  // ==========================================
  // 1. PROCESS TABLES & DATA
  // ==========================================
  for (const folder of folders) {
    const folderPath = path.join(BASE_DIR, folder);
    
    // Skip if it's not a directory
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const tableName = folder;
    const schemaFilePath = path.join(folderPath, 'schema.txt');
    const files = fs.readdirSync(folderPath);
    
    // Find .sql and .csv files
    const sqlFileName = files.find(f => f.endsWith('.sql'));
    const sqlFilePath = sqlFileName ? path.join(folderPath, sqlFileName) : null;

    const csvFileName = files.find(f => f.endsWith('.csv'));
    const csvFilePath = csvFileName ? path.join(folderPath, csvFileName) : null;

    try {
      console.log(`--- Checking table '${tableName}' ---`);

      // 1. Check if the table exists
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [tableName]);
      
      const tableExists = tableCheck.rows[0].exists;

      // 2. Create the table if it is missing
      if (!tableExists) {
        if (!fs.existsSync(schemaFilePath)) {
          console.log(`⚠️  Table '${tableName}' does not exist, and no schema.txt found. Skipping.\n`);
          continue;
        }

        console.log(`🛠️  Table '${tableName}' does not exist. Creating it...`);
        const schemaSql = fs.readFileSync(schemaFilePath, 'utf8');
        await client.query(schemaSql);
        
        await client.query(`NOTIFY pgrst, 'reload schema';`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log(`✅ Table '${tableName}' created successfully.`);
      }

      // 3. Check if table already has data
      const countCheck = await client.query(`SELECT COUNT(*) FROM "${tableName}"`);
      const rowCount = parseInt(countCheck.rows[0].count, 10);

      if (rowCount > 0) {
        console.log(`⏭️  Table '${tableName}' already has ${rowCount} rows. Skipping upload.\n`);
        continue;
      }

      // 4. Handle Data Upload Logic
      let dataUploaded = false;

      // Try SQL Upload First
      if (sqlFilePath) {
        console.log(`📄 Found '${sqlFileName}'. Executing SQL data upload...`);
        try {
          const dataSql = fs.readFileSync(sqlFilePath, 'utf8');
          await client.query(dataSql);
          console.log(`✅ Successfully uploaded data for table '${tableName}' via SQL\n`);
          dataUploaded = true;
        } catch (sqlErr) {
          console.error(`⚠️  SQL execution failed for '${tableName}': ${sqlErr.message}`);
          console.log(`🔄 Falling back to CSV if available...`);
        }
      }

      // Fallback to CSV Upload (Staging Table Strategy)
      if (!dataUploaded && csvFilePath) {
        console.log(`📄 Found '${csvFileName}'. Executing CSV data upload via staging table...`);
        try {
          // A. Read CSV headers to map them directly to DB columns
          const firstLine = fs.readFileSync(csvFilePath, 'utf8').split(/\r?\n/)[0];
          // Regex to safely extract headers, handling potential Byte Order Marks (BOM)
          const headers = firstLine.split(',').map(h => h.trim().replace(/^"|"$/g, '').replace(/^\uFEFF/, ''));
          
          // B. Get exact column types from the live DB table
          const colsRes = await client.query(`
            SELECT column_name, data_type, udt_name 
            FROM information_schema.columns 
            WHERE table_name = $1;
          `, [tableName]);
          
          const colMap = {};
          colsRes.rows.forEach(r => colMap[r.column_name] = r);

          // C. Create Temp Staging table where everything is pure 'text'
          const stagingTableName = `staging_${tableName}_${Date.now()}`;
          const stagingCols = headers.map(h => `"${h}" text`).join(', ');
          await client.query(`CREATE TEMP TABLE "${stagingTableName}" (${stagingCols})`);

          // D. Stream data into the Staging Table natively
          await new Promise((resolve, reject) => {
            const fileStream = fs.createReadStream(csvFilePath);
            const stream = client.query(copyFrom(`COPY "${stagingTableName}" (${headers.map(h => `"${h}"`).join(', ')}) FROM STDIN WITH (FORMAT csv, HEADER true)`));
            
            fileStream.on('error', reject);
            stream.on('error', reject);
            stream.on('finish', resolve);
            
            fileStream.pipe(stream);
          });

          // E. Construct the Castings mapping to properly format Arrays, JSON, and Strings
          const validHeaders = [];
          const selectExpressions = [];
          
          for (const h of headers) {
            const colInfo = colMap[h];
            if (!colInfo) continue; // Skip columns in CSV that aren't in the DB
            
            validHeaders.push(`"${h}"`);
            const colStr = `"${h}"`;
            
            if (colInfo.data_type === 'ARRAY') {
              // Automatically translates JSON brackets [...] to PG braces {...}
              const baseType = colInfo.udt_name.startsWith('_') ? colInfo.udt_name.substring(1) : 'text';
              selectExpressions.push(`NULLIF(regexp_replace(${colStr}, '^\\[(.*)\\]$', '{\\1}'), '')::${baseType}[]`);
            } else if (colInfo.data_type === 'USER-DEFINED') {
              selectExpressions.push(`NULLIF(${colStr}, '')::${colInfo.udt_name}`);
            } else {
              selectExpressions.push(`NULLIF(${colStr}, '')::${colInfo.data_type}`);
            }
          }

          // F. Push data from staging table into real table applying the casts
          const insertQuery = `
            INSERT INTO "${tableName}" (${validHeaders.join(', ')})
            SELECT ${selectExpressions.join(', ')}
            FROM "${stagingTableName}";
          `;
          
          await client.query(insertQuery);
          await client.query(`DROP TABLE "${stagingTableName}"`); // Cleanup

          console.log(`✅ Successfully uploaded data for table '${tableName}' via CSV\n`);
          dataUploaded = true;
        } catch (csvErr) {
          console.error(`❌ CSV upload failed for '${tableName}': ${csvErr.message}\n`);
        }
      }

      // 5. Final Reporting if neither worked
      if (!dataUploaded) {
        if (!sqlFilePath && !csvFilePath) {
          console.log(`ℹ️  No rows (.sql or .csv) file found in folder '${tableName}'. Moving on.\n`);
        } else {
          console.log(`❌ Failed to upload data for table '${tableName}'. Moving on.\n`);
        }
      }

    } catch (err) {
      console.error(`❌ Error processing '${tableName}': ${err.message}\n`);
    }
  }

  // ==========================================
  // 2. PROCESS RPCs (Functions)
  // ==========================================
  console.log('--- Processing RPCs ---');
  if (fs.existsSync(RPCS_DIR)) {
    const rpcFiles = fs.readdirSync(RPCS_DIR).filter(f => f.endsWith('.txt') || f.endsWith('.sql'));

    if (rpcFiles.length > 0) {
      let rpcsUpdated = false;

      for (const file of rpcFiles) {
        const rpcFilePath = path.join(RPCS_DIR, file);
        const rpcName = path.parse(file).name; // Gets filename without extension
        
        console.log(`🛠️  Creating/Updating RPC '${rpcName}'...`);
        try {
          const rpcSql = fs.readFileSync(rpcFilePath, 'utf8');
          await client.query(rpcSql);
          console.log(`✅ Successfully applied RPC: ${rpcName}`);
          rpcsUpdated = true;
        } catch (rpcErr) {
          console.error(`❌ Failed to create RPC '${rpcName}': ${rpcErr.message}`);
        }
      }

      if (rpcsUpdated) {
        await client.query(`NOTIFY pgrst, 'reload schema';`);
        console.log(`\n🔄 Notified PostgREST to reload schema to recognize new RPCs.`);
      }
      console.log(); // empty line for formatting

    } else {
      console.log(`ℹ️  No .txt or .sql files found in '${RPCS_DIR}'. Skipping.\n`);
    }
  } else {
    console.log(`ℹ️  Directory '${RPCS_DIR}' not found. Skipping RPC creation.\n`);
  }

  // Close the database connection
  await client.end();
  console.log('🎉 All done!');
}

main();