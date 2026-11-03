const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('View the bot config values in Discord'),

    async execute(interaction) {
        const summary = {
            down_channel: config.down_channel || 'not set',
            image_solver: config.image_solver || 'not set',
            status_channel_id: config.status_channel_id || 'not set',
            base_role: config.base_role || 'not set',
            channels: config.channels || {},
            slots: config.slots || {},
            queue_ranks: config.queue_ranks || {}
        };

        const text = `\`\`\`json\n${JSON.stringify(summary, null, 2)}\n\`\`\``;

        await interaction.reply({
            content: text,
            flags: MessageFlags.Ephemeral
        });
    }
};
