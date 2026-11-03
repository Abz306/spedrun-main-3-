const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { colours } = require('../../config.json');

const EGGS = [
    '🥚 You found the hidden churro. It tastes like homework.',
    ' egg no. Intermission: have a virtual biscuit 🍪',
    'bit of an egg hunt. Here is a tiny robot 🤖 that finished your maths.',
    'Cymry shwmae! 🐑 Welcome, secret easter-egg finder!',
    'beans 🫘 were here. Also the bot works moderately well.'
];

module.exports = {
    public: true,
    data: new SlashCommandBuilder()
        .setName('easter_egg')
        .setDescription('A harmless hidden easter egg'),
    async execute(interaction) {
        const egg = EGGS[Math.floor(Math.random() * EGGS.length)];
        const embed = new EmbedBuilder()
            .setTitle('Easter Egg / Wy Pasg / 🥚')
            .setDescription(egg)
            .setColor(colours.yellow);
        await interaction.reply({ embeds: [embed] });

        const secret = Math.random();
        if (secret < 0.05) {
            await interaction.followUp({ content: 'You have unlocked the ultra secret mode: pure chaos. 🐱', flags: 64 });
        }
    }
};
