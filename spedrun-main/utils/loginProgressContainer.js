const { ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');
const getProgressBar = require('./getProgressBar.js');
const { colours } = require('../config.json');

function createLoginProgressContainer({
    statusText = 'Verifying credentials...',
    percent = 54,
    accent = colours.onyx
} = {}) {
    const safePercent = Math.max(0, Math.min(100, Number(percent) || 0));

    return new ContainerBuilder()
        .setAccentColor(accent)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `### ${statusText}\n**Progress** • ${safePercent}%\n${getProgressBar(safePercent, 100)}`
            )
        );
}

async function runWithLoginProgress(interaction, task, options = {}) {
    const {
        statusText = 'Verifying credentials...',
        startPercent = 12,
        stepMin = 7,
        stepMax = 18,
        intervalMs = 750,
    } = options;

    let currentPercent = startPercent;

    const updateProgress = async () => {
        if (!interaction || typeof interaction.editReply !== 'function') return;
        try {
            await interaction.editReply({
                components: [createLoginProgressContainer({
                    statusText,
                    percent: currentPercent,
                })],
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        } catch {
            // Ignore transient Discord API races during quick updates.
        }
    };

    const interval = setInterval(() => {
        currentPercent = Math.min(95, currentPercent + Math.floor(Math.random() * (stepMax - stepMin + 1)) + stepMin);
        updateProgress().catch(() => {});
    }, intervalMs);

    try {
        const result = await task();
        currentPercent = 100;
        await updateProgress();
        return result;
    } finally {
        clearInterval(interval);
    }
}

module.exports = {
    createLoginProgressContainer,
    runWithLoginProgress,
};
