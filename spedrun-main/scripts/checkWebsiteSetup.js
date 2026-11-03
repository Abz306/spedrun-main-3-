require('dotenv').config();

const issues = [];

if (!process.env.SUPABASEURL) issues.push('SUPABASEURL is missing.');
if (!process.env.SUPABASEKEY) issues.push('SUPABASEKEY is missing.');
if (!process.env.SUPABASE_ANON_KEY) issues.push('SUPABASE_ANON_KEY is missing.');
if (!process.env.DISCORD_CLIENT_ID) issues.push('DISCORD_CLIENT_ID is missing.');
if (!process.env.DISCORD_CLIENT_SECRET) issues.push('DISCORD_CLIENT_SECRET is missing.');

const redirect = process.env.DISCORD_OAUTH_REDIRECT_URI || 'http://localhost:3001/api/auth/discord/callback';
if (redirect.endsWith('/')) issues.push('DISCORD_OAUTH_REDIRECT_URI must not end with a slash.');

if (issues.length) {
    console.error('Website setup is incomplete:');
    for (const issue of issues) console.error(`- ${issue}`);
    console.error(`- Expected Discord redirect: ${redirect}`);
    process.exit(1);
}

console.log('Website setup configuration is present.');
console.log(`Discord redirect: ${redirect}`);
