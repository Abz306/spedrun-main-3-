const { SeparatorSpacingSize, SeparatorBuilder, ContainerBuilder, TextDisplayBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { emojis, colours } = require('../config.json');
const { validAccount } = require('../handlers/accountHandler.js');
const loginHandler = require('../generic/loginHandler.js');
const getFunctionParams = require('../utils/getFunctionParams.js');
const getChildrenFromId = require('../utils/getChildrenFromId.js');
const getFile = require('../utils/getFile.js');

async function collector(message_sent, platform, platformKey) {
    if (platform === 'drfrost') {
        const { drfrost_collector } = require('../archive/drfrost/main.js');
        return drfrost_collector(message_sent);
    }

    const loginPath = await getFile(platform, 'login.js');
    const login = require(loginPath);
    const loginParameters = getFunctionParams(login);

    const expectedPrefix = platformKey || platform;
    const matchesPlatform = (interaction) => {
        const customId = interaction.customId || '';
        return customId.includes(expectedPrefix);
    };

    const collector = message_sent.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: matchesPlatform,
    });

    collector.on('collect', async (interaction) => {
        if (interaction.customId.endsWith('_login')) {
            const children = getChildrenFromId(interaction.customId);
            const childLabel = children.length ? `(${children})` : '';
            if (await validAccount(interaction, `${platform}${childLabel}`)) return;

            const loginPlatform = `${platform}${childLabel}`;
            const container = createLoginOptionsContainer(loginPlatform, platform.startsWith('sparx'));

            await loginHandler(interaction, container, loginPlatform, loginParameters.includes('school'), loginParameters.includes('type'));
        } else if (interaction.customId.startsWith('check_queue')) {
            const queueCollector = require('../queues/queueCollecting.js');
            await queueCollector(interaction);
        }

    });
}

function createLoginOptionsContainer(platform, isSparx = platform.startsWith('sparx')) {
    const loginBtn = new ButtonBuilder()
        .setCustomId('login')
        .setLabel('Login')
        .setEmoji(emojis.login)
        .setStyle(ButtonStyle.Success);

    const cookieBtn = new ButtonBuilder()
        .setCustomId('login_cookies')
        .setLabel(isSparx ? 'Cookie Login' : 'Login')
        .setEmoji(emojis.cookies)
        .setStyle(ButtonStyle.Success);

    const savedBtn = new ButtonBuilder()
        .setCustomId(`${platform}_savedAccounts_view`)
        .setLabel('Saved Accounts')
        .setEmoji(emojis.accounts)
        .setStyle(ButtonStyle.Secondary);

    return new ContainerBuilder()
        .setAccentColor(colours.onyx)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent('### Login\nLogin by simply inputting your username and password or choosing a saved account!')
        )
        .addSeparatorComponents(
            new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small })
        )
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(loginBtn, cookieBtn, savedBtn)
        );
}

async function startLoginOptionsCollector(message, platformFolder, platformKey) {
    const loginPath = await getFile(platformFolder, 'login.js');
    const login = require(loginPath);
    const loginParameters = getFunctionParams(login);
    const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: interaction => [
            'login',
            'login_cookies',
            `${platformKey}_savedAccounts_view`
        ].includes(interaction.customId)
    });

    collector.on('collect', async (interaction) => {
        await loginHandler.handleLoginChoice(
            interaction,
            platformKey,
            loginParameters.includes('school'),
            loginParameters.includes('type')
        );
    });
}

module.exports = collector;
module.exports.createLoginOptionsContainer = createLoginOptionsContainer;
module.exports.startLoginOptionsCollector = startLoginOptionsCollector;