const { SlashCommandBuilder } = require('discord.js');
const startSession = require('../../generic/startSession');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('Start a homework session'),
    async execute(interaction) {
        await startSession(interaction);
    },
};
