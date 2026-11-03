const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { colours } = require('../../config.json');

module.exports = {
    public: false,
    data: new SlashCommandBuilder()
        .setName('berwick')
        .setDescription('Fun fact / secret command about Berwick-upon-Tweed'),
    async execute(interaction) {
        const egg = [
            '🏰 Berwick-upon-Tweed: England, Scotland, neither? yes.',
            '⚽ Berwick Rangers: the club that forgot which side of the border they belong to.',
            '🗺️ GPS says England. History argues in the group chat. The Discord bot refuses to pick a side.'
        ] [Math.floor(Math.random() * 3)];

        const embed = new EmbedBuilder()
            .setTitle('Berwick / Hidden Border Joke')
            .setDescription(egg)
            .setColor(colours.blue)
            .setFooter({ text: 'For your inner geography nerd.' });

        await interaction.reply({ embeds: [embed] });
    }
};
