const path = require('node:path');
const { SlashCommandBuilder, AttachmentBuilder, MessageFlags } = require('discord.js');
const relayPanel = require('../../generic/relayPanel.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel')
        .setDescription('Post a new session control panel in this channel'),
    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        if (!interaction.channel?.send) {
            await interaction.editReply('I cannot post a session panel in this channel.');
            return;
        }

        try {
            await interaction.channel.send({
                flags: MessageFlags.IsComponentsV2,
                components: [relayPanel],
                files: [new AttachmentBuilder(
                    path.join(__dirname, '..', '..', 'assets', 'relay-ai-logo.png'),
                    { name: 'relay-ai-logo.png' }
                )],
            });
            await interaction.editReply('Posted a new session control panel in this channel.');
        } catch (error) {
            console.error('Failed to post a session control panel:', error);
            await interaction.editReply('Could not post the session panel. Check the bot logs and confirm it can send messages and attach files here.');
        }
    },
};
