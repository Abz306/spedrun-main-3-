const fs = require('node:fs');
const path = require('node:path');
const {
    ActionRowBuilder,
    ComponentType,
    ContainerBuilder,
    MessageFlags,
    StringSelectMenuBuilder,
    TextDisplayBuilder,
} = require('discord.js');
const config = require('../config.json');
const startEmbedCollector = require('./startEmbedCollector');

function getSessionPlatforms() {
    const root = path.join(__dirname, '..', 'autocompleters');
    const platforms = [];

    for (const [configKey, channelId] of Object.entries(config.channels)) {
        if (!channelId) continue;

        const [folderName, ...childParts] = configKey.split('_');
        const embedPath = childParts.length
            ? path.join(root, folderName, 'children', childParts.join('_'), 'startEmbed.js')
            : path.join(root, folderName, 'startEmbed.js');

        if (!fs.existsSync(embedPath)) continue;

        platforms.push({
            configKey,
            folderName,
            platformKey: childParts.length ? `${folderName}(${childParts.join('_')})` : folderName,
            label: configKey
                .split('_')
                .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                .join(' '),
            emoji: config.emojis[configKey] || null,
            embed: require(embedPath),
        });
    }

    return platforms;
}

async function startSession(interaction) {
    const platforms = getSessionPlatforms();
    if (!platforms.length) {
        await interaction.reply({
            content: 'No session platforms are configured. Please contact an administrator.',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const platformSelect = new StringSelectMenuBuilder()
        .setCustomId('relay_platform_select')
        .setPlaceholder('Select a platform to continue')
        .addOptions(platforms.map(platform => ({
            label: platform.label,
            value: platform.configKey,
            ...(platform.emoji ? { emoji: platform.emoji } : {}),
        })));

    const picker = new ContainerBuilder()
        .setAccentColor(0x5865F2)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent('## Start a Session\nChoose the platform you want to use.')
        )
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(platformSelect)
        );

    await interaction.reply({
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        components: [picker],
    });
    const message = await interaction.fetchReply();

    const collector = message.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 600_000,
        filter: component => component.user.id === interaction.user.id,
    });

    collector.on('collect', async (component) => {
        const selected = platforms.find(platform => platform.configKey === component.values[0]);
        if (!selected) {
            await component.reply({
                content: 'That platform is no longer available. Please try again.',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        collector.stop('selected');
        try {
            await component.update({
                components: [startEmbedCollector.createLoginOptionsContainer(selected.platformKey)]
            });
            await startEmbedCollector.startLoginOptionsCollector(
                component.message,
                selected.folderName,
                selected.platformKey
            );
        } catch (error) {
            console.error('Failed to open the selected session platform:', error);
            await component.followUp({
                content: 'Could not open that platform. Please try again or contact an administrator.',
                flags: MessageFlags.Ephemeral,
            });
        }
    });
}

module.exports = startSession;
