const {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SectionBuilder,
    ThumbnailBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const header = new SectionBuilder()
    .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('## Hielke AI\nPress **Start Session** to choose a platform and account.')
    )
    .setThumbnailAccessory(
        new ThumbnailBuilder({ media: { url: 'attachment://relay-ai-logo.png' } })
    );

const panel = new ContainerBuilder()
    .setAccentColor(0x5865F2)
    .addSectionComponents(header)
    .addSeparatorComponents(new SeparatorBuilder())
    .addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('relay_start_session')
                .setLabel('Start Session')
                .setEmoji({ name: '🚀' })
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('relay_saved_accounts')
                .setLabel('Saved accounts')
                .setEmoji({ name: '👤' })
                .setStyle(ButtonStyle.Secondary)
        )
    )
    .addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('relay_leaderboard')
                .setLabel('Leaderboards')
                .setEmoji({ name: '🏆' })
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('relay_settings')
                .setLabel('Settings')
                .setEmoji({ name: '⚙️' })
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('relay_help')
                .setLabel('Help')
                .setEmoji({ name: '❓' })
                .setStyle(ButtonStyle.Secondary)
        )
    );

module.exports = panel;
