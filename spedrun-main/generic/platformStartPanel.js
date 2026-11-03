const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} = require('discord.js');

function createPlatformStartPanel({ name, color, buttons }) {
    const row = new ActionRowBuilder().addComponents(
        ...buttons.map(({ customId, label, style = ButtonStyle.Success, emoji }) => {
            const button = new ButtonBuilder()
                .setCustomId(customId)
                .setLabel(label)
                .setStyle(style);

            if (emoji) button.setEmoji(emoji);
            return button;
        })
    );

    return new ContainerBuilder()
        .setAccentColor(color)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## ${name}\nSign in with your ${name} account, or choose a saved account.\nSelect **Login** to continue.`
            )
        )
        .addSeparatorComponents(
            new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small })
        )
        .addActionRowComponents(row);
}

module.exports = createPlatformStartPanel;
