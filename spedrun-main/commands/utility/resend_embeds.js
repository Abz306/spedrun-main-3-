const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const sendPersistentEmbeds = require('../../generic/sendPersistentEmbeds.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resend_platform_embeds')
        .setDescription('Re-send all platform start embeds to their configured channels'),
    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            await sendPersistentEmbeds(interaction.client);
            await interaction.editReply({
                content: 'Updated the control panel and removed old platform cards.',
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error('Failed to resend platform embeds:', error);
            await interaction.editReply({
                content: 'Failed to resend platform embeds. Check the bot logs.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
