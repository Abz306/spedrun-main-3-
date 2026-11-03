require('dotenv').config();
const fs = require('node:fs');
const util = require('util');

if (!fs.existsSync('crash.log')) {
    fs.writeFileSync('crash.log', ''); 
}
if (!fs.existsSync('logs.txt')) {
    fs.writeFileSync('logs.txt', ''); 
}
const logFile = fs.createWriteStream('logs.txt', { flags: 'w' });

const originalLog = console.log;
console.log = function (...args) {
    logFile.write(util.format(...args) + '\n');
    originalLog.apply(console, args);
};

const originalError = console.error; 
console.error = function (...args) { 
    const msg = '[ERROR] ' + util.format(...args) + '\n'; 
    
    // Streams (like logFile) are already non-blocking/async-driven
    if (logFile.writable) {
        logFile.write(msg);
    }
    
    // Asynchronous fire-and-forget append. 
    // We attach a .catch() to silently fail instead of using a try/catch block.
    fs.promises.appendFile('crash.log', msg).catch(() => {
        // Silently fail if we can't write to the file, to avoid a fatal crash loop
    });

    originalError.apply(console, args); 
};

process.on('unhandledRejection', async (reason) => {
    const errorMsg = `[Unhandled Rejection] ${reason ? reason.stack || reason : 'Unknown reason'}\n`;
    console.error(errorMsg);

    try {
        const { logError } = require('./utils/errorLogger.js');
        
        // Ensure logError finishes, and if it fails, write to the log asynchronously
        await logError(reason, null, 'Global Unhandled Rejection').catch(async (e) => {
            await fs.promises.appendFile('crash.log', `[Meta-Error] Webhook failed: ${e.message}\n`).catch(() => {});
        });
    } catch (e) {
        // Await the file write here since this block is already inside an async function
        await fs.promises.appendFile('crash.log', `[Meta-Error] logError function failed: ${e}\n`).catch(() => {});
    }
});

process.on('exit', (code) => {
    const msg = `PROCESS EXITED WITH CODE: ${code}\n`;
    console.log(msg);
    fs.appendFileSync('crash.log', msg);
});

const { settingsDisplayer } = require('./generic/settingsDisplayer.js');
const miscordChat = require('./handlers/miscordChat.js');
const { handleQueueInput } = require('./handlers/queueChangeHandler.js');
const token = process.env.DISCORD_TOKEN;
const fspromise = require('fs').promises;
const path = require('node:path');
const {
    Client, GatewayIntentBits, Collection, MessageFlags,
    ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder,
    SeparatorBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder,
    TextDisplayBuilder
} = require('discord.js');
const { executeViewAccounts, saveAccount } = require('./handlers/savedAccountsHandler.js');
const { createAccount } = require('./handlers/accountHandler.js');
const mainAccountLogin = require('./handlers/mainAccountLogin.js');
const { viewSavedAccounts, changeMasterPassword, updateAccountInteraction, changeSlots } = require('./handlers/accountManager.js');
const config = require('./config.json');
const imageSolverHandler = require('./imageSolver.js');
const processSettings = require('./generic/processSettings.js');
const seperateParentChild = require('./utils/seperateParentChild.js');
const processLogin = require('./generic/processLogin.js');
const axios = require('axios');
const FormData = require('form-data');
const { emojis, colours, admin_roles, down_channel, base_role, channels, image_solver } = require('./config.json');
const sendStartedMessage = require('./utils/sendStartedMessage.js');
const sendPersistentEmbeds = require('./generic/sendPersistentEmbeds.js');
const getHomeworkLeaderboard = require('./utils/leaderboard.js');
const loginHandler = require('./generic/loginHandler.js');
const getFunctionParams = require('./utils/getFunctionParams.js');
const getFile = require('./utils/getFile.js');

async function showAutocompChannels(client) {
    if (down_channel) {
        try {
            const downChannel = await client.channels.fetch(down_channel);
            await downChannel.permissionOverwrites.edit(base_role, {
                ViewChannel: false,
            });
        } catch (error) {
            console.warn(`Could not update down channel (${down_channel}):`, error.message);
        }
    }

    if (image_solver) {
        try {
            const imageSolverChannel = await client.channels.fetch(image_solver);
            await imageSolverChannel.permissionOverwrites.edit(base_role, {
                ViewChannel: true,
            });
        } catch (error) {
            console.warn(`Could not update image solver channel (${image_solver}):`, error.message);
        }
    }

    for (const channel of Object.values(channels)) {
        if (!channel) continue;
        try {
            const tchannel = await client.channels.fetch(channel);
            await tchannel.permissionOverwrites.edit(base_role, {
                ViewChannel: true,
            });
        } catch (error) {
            console.warn(`Could not update platform channel (${channel}):`, error.message);
        }
    }
}

const sendLog = require('./utils/sendLogsWebhook.js');
async function cleanAllLogs(dir = './sessionLogs') {
    const files = fs.readdirSync(dir);

    for (const name of files) {
        if (name === ".gitkeep") continue;
        const filePath = path.join(dir, name);
        const stats = fs.statSync(filePath);

        const embed = {
            title: 'Session Logs (Cleanup)',
            description: `Logs uploaded at **${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}**`,
            color: colours.onyx,
            fields: [
                { name: 'File Path', value: filePath },
            ]
        };

        await sendLog(filePath, name, embed);
    }
}

// Call the function starting at the root 'autocompleters' folder
cleanAllLogs('./sessionLogs')
    .then(() => console.log('Log cleanup complete!'))
    .catch(console.error);

// legalDisclamer: `\n> **LEGAL DISCLAMER**: ${name} employs the use of human tutors to complete the tasks given to them by customers of ${name}. No LLM (AI) is used throughout this process. No content or material from the homework platform is used for anything other than its permitted purpose. ${name} is in compliance with all regulations and abides by all Terms of Service of this homework platform.`,
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ],
});

client.on('error', (error) => {
    console.error('Discord Client Error:', error);
});

client.on('warn', (info) => {
    console.warn('Discord Client Warning:', info);
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    showAutocompChannels(client);
    sendStartedMessage(client);
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    if (folder === '.DS_Store') continue;
    const commandsPath = path.join(foldersPath, folder);
    const stats = fs.statSync(commandsPath);
    if (!stats.isDirectory()) continue;
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}



async function DeleteVideos() {
    try {
        const files = await fspromise.readdir('videos');
        if (files.length > 1) {
            console.log("Deleting files...");
            for (const file of files) {
                if (file == '.gitkeep') continue;
                const filePath = path.join('videos', file);
                await fspromise.unlink(filePath);
                console.log(`Deleted ${file}`);
            }
            console.log("All files deleted.");
        } else {
            console.log("No files to delete.");
        }
    } catch (err) {
        console.error("Error deleting files:", err);
    }
}

client.once("ready", async () => {
    console.log("Bot has connected to discord");
    await sendPersistentEmbeds(client);
    await DeleteVideos();
});

client.on('disconnect', () => console.log('Bot disconnected!'));

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu() || interaction.customId !== 'relay_platform_select') return;

    const platform = interaction.values[0];
    const parent = platform.includes('(') ? platform.split('(')[0] : platform;
    const child = platform.includes('(') ? platform.slice(platform.indexOf('(')) : '';
    const platformName = {
        'sparx(maths)': 'Sparx Maths',
        'sparx(reader)': 'Sparx Reader',
        'sparx(science)': 'Sparx Science',
        seneca: 'Seneca',
        drfrost: 'Dr Frost Maths',
        educake: 'Educake'
    }[platform] || platform;
    const platformKey = `${parent}${child}`;
    const loginPath = await getFile(parent, 'login.js');
    const loginParameters = getFunctionParams(require(loginPath));

    const container = new ContainerBuilder()
        .setAccentColor(colours[parent] || colours.blurple)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ${platformName}\nChoose how you want to sign in.`)
        )
        .addSeparatorComponents(new SeparatorBuilder())
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('login')
                    .setLabel('Username & Password')
                    .setEmoji(emojis.login)
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('login_cookies')
                    .setLabel(parent === 'sparx' ? 'Cookie Login' : 'Cookie / Session')
                    .setEmoji(emojis.cookies)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`${platformKey}_savedAccounts_view`)
                    .setLabel('Saved Accounts')
                    .setEmoji(emojis.accounts)
                    .setStyle(ButtonStyle.Primary)
            )
        );

    await loginHandler(
        interaction,
        container,
        platformKey,
        loginParameters.includes('school'),
        loginParameters.includes('type')
    );
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'relay_leaderboard') {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            const leaderboard = await getHomeworkLeaderboard();
            const lines = leaderboard.length
                ? leaderboard.map((entry, index) => `${index + 1}. <@${entry.discordId}> — **${entry.solved.toLocaleString()}** homework solved`)
                : ['No completed homework has been recorded yet.'];
            await interaction.editReply({
                content: `## Hielke AI homework leaderboard\n${lines.join('\n')}`
            });
        } catch (error) {
            console.error('Hielke AI leaderboard error:', error);
            if (interaction.deferred) {
                await interaction.editReply({ content: 'The leaderboard is unavailable right now.' });
            }
        }
        return;
    }
    if (interaction.customId === 'relay_start_session') {
        if (interaction.channelId !== config.status_channel_id) {
            await interaction.reply({
                content: `Start a session from the Hielke AI panel in <#${config.status_channel_id}>.`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }
        const select = new StringSelectMenuBuilder()
            .setCustomId('relay_platform_select')
            .setPlaceholder('Choose a homework platform...')
            .addOptions(
                new StringSelectMenuOptionBuilder().setLabel('Sparx Maths').setValue('sparx(maths)').setEmoji({ id: emojis.sparx_maths, name: 'sparx_maths' }),
                new StringSelectMenuOptionBuilder().setLabel('Sparx Reader').setValue('sparx(reader)').setEmoji({ id: emojis.sparx_reader, name: 'sparx_reader' }),
                new StringSelectMenuOptionBuilder().setLabel('Sparx Science').setValue('sparx(science)').setEmoji({ id: emojis.sparx_science, name: 'sparx_science' }),
                new StringSelectMenuOptionBuilder().setLabel('Seneca').setValue('seneca').setEmoji({ id: emojis.seneca, name: 'seneca' }),
                new StringSelectMenuOptionBuilder().setLabel('Dr Frost Maths').setValue('drfrost').setEmoji({ id: emojis.drfrost, name: 'drfrost' }),
                new StringSelectMenuOptionBuilder().setLabel('Educake').setValue('educake').setEmoji({ id: emojis.educake, name: 'educake' })
            );
        const chooser = new ContainerBuilder()
            .setAccentColor(colours.blurple)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('# Start a Session\nChoose a platform below. Your login choices stay private.')
            )
            .addSeparatorComponents(new SeparatorBuilder())
            .addActionRowComponents(new ActionRowBuilder().addComponents(select));
        await interaction.reply({
            components: [chooser],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
        });
        return;
    }
    if (interaction.customId === 'relay_saved_accounts' || interaction.customId === 'relay_settings') {
        await interaction.reply({
            content: 'Use `/account` to manage saved accounts, settings and your Hielke AI license.',
            flags: MessageFlags.Ephemeral
        });
        return;
    }
    if (interaction.customId === 'relay_help') {
        await interaction.reply({
            content: 'Choose a platform channel, press **Login**, complete the account form, then select a homework. Use `/account` for account management.',
            flags: MessageFlags.Ephemeral
        });
        return;
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    // Prevent crash in DMs
    if (!interaction.guild) {
        return interaction.reply({
            content: 'This command can only be used in a server.',
            flags: MessageFlags.Ephemeral
        });
    }

    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (
        !admin_roles.some(roleId => member.roles.cache.has(roleId)) &&
        !command.public
    ) {
        return interaction.reply({
            content: 'Only admins can run that command, sowwy.',
            flags: MessageFlags.Ephemeral
        });
    }

    if (!command) {
        await interaction.reply(`No command matching ${interaction.commandName} was found.`);
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    await command.execute(interaction, client);
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return;

    try {

        if (interaction.customId.startsWith('changeSettings')) {
            await processSettings(interaction);
            return;
        }

        if (interaction.customId.startsWith('queues_')) {
            await handleQueueInput(interaction);
            return;
        }

        if (interaction.customId.startsWith('drfrost_')) {
            const { drfrost_model_executor } = require('./archive/drfrost/main.js');
            await drfrost_model_executor(interaction);
            return;
        }

        if (interaction.customId === 'educake_set_time' || interaction.customId.startsWith('educake_')) {
            const { modelExecutor } = require('./autocompleters/educake/modalExecutor.js');
            await modalExecutor(interaction);
            return;
        }

        if (interaction.customId === 'educake_set_time') {
            const modalExecutor = require('./autocompleters/educake/modalExecutor.js');
            await modalExecutor(interaction);
            return;
        }

        if (interaction.customId.startsWith('autocompleterModule_')) {
            const interactionSplit = interaction.customId.split('_');
            const action = interactionSplit[2];
            if (action.startsWith('login')) {
                const parent = seperateParentChild(interactionSplit[1]);
                const login = require(`./autocompleters/${parent.parent}/login.js`);
                const getTokenRequest = require(`./autocompleters/${parent.parent}/getTokenRequest.js`);
                const menu = require(`./autocompleters/${parent.parent}/menu.js`);
                let userSessions;
                if (!parent.child) {
                    userSessions = require(`./autocompleters/${parent.parent}/userSessions.js`);
                } else {
                    userSessions = require(`./autocompleters/${parent.parent}/children/${parent.child}/userSessions.js`);
                }
                await processLogin(interaction, parent.parent, login, getTokenRequest, userSessions, menu);
                return;
            }
    
            const part = interaction.customId
                .replace('autocompleterModule_', '') // sparx(science)_login
                .split('_')[0]                      // sparx(science)
                .split('(')[0];                    // sparx

            const modalExecutor = require(`./autocompleters/${part}/modalExecutor.js`);
            await modalExecutor(interaction);
            return;
        }

        if (interaction.customId.startsWith('set_slots')) {
            await interaction.deferUpdate({ flags: MessageFlags.Ephemeral });
            await changeSlots(interaction);
            return;
        }

        if (interaction.customId === 'handleSettings') {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            await settingsDisplayer(interaction);
            return;
        }

        if (interaction.customId === 'accountManager_service') {
            await interaction.deferUpdate({ flags: MessageFlags.Ephemeral });
            await updateAccountInteraction(interaction);
            return;
        }

        if (interaction.customId === 'view_accounts') {
            await viewSavedAccounts(interaction);
            return;
        }

        if (interaction.customId === 'change_master_password') {
            await changeMasterPassword(interaction);
            return;
        }

        if (interaction.customId.startsWith('main_account')) {
            if (interaction.customId.endsWith('configure')) {
                await mainAccountLogin(interaction);
            } else if (interaction.customId.endsWith('remove')) {
                await mainAccountLogin(interaction, true);
            }
            return;
        }

        if (interaction.customId === 'create_master_password') {
            await createAccount(interaction);
            return;
        }

        if (interaction.customId.startsWith('save_account')) {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            await saveAccount(interaction);
            return;
        }

        if (interaction.customId.startsWith('view_saved_accounts')) {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            await executeViewAccounts(interaction);
            return;
        }

    } catch (error) {
        const stack = error.stack ?? "No stack trace available";

        // Keep message under Discord's 2000 char limit
        const trimmedStack = stack.length > 1500
            ? stack.slice(0, 1500) + "\n... (truncated)"
            : stack;

        const errorMessage = {
            content: `⚠️ An error occurred:\n\`\`\`\n${error.message}\n\n${trimmedStack}\n\`\`\``,
            flags: MessageFlags.Ephemeral
        };

        try {
            await interaction.followUp(errorMessage);
        } catch {

        }
    }
});

const { maybeReplyEasterEgg } = require('./utils/easterEggs');
client.on('messageCreate', async (message) => {
    try { if (await maybeReplyEasterEgg(message)) return; } catch {}
    await imageSolverHandler(message);
    await miscordChat(message);
});

client.login(token);
