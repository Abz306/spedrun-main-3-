const { emojis } = require('../config.json');

function getProgressBar(totalCorrect, total) {
    const progress = Number(totalCorrect);
    const maximum = Number(total);
    const ratio = Number.isFinite(progress) && Number.isFinite(maximum) && maximum > 0
        ? Math.max(0, Math.min(1, progress / maximum))
        : 0;
    const greenBarsNum = Math.round(ratio * 10);
    const segments = {
        leftFull: emojis.left_full || '▰',
        leftEmpty: emojis.left_empty || '▱',
        middleFull: emojis.mid_full || '▰',
        middleEmpty: emojis.mid_empty || '▱',
        rightFull: emojis.right_full || '▰',
        rightEmpty: emojis.right_empty || '▱',
    };

    let progressBar = "";

    for (let i = 0; i < 10; i++) {
        if (i === 0) {
            // left edge
            progressBar += (greenBarsNum > 0) ? segments.leftFull : segments.leftEmpty;
        } else if (i === 9) {
            // right edge
            progressBar += (greenBarsNum > 9) ? segments.rightFull : segments.rightEmpty;
        } else {
            // middle
            progressBar += (i < greenBarsNum) ? segments.middleFull : segments.middleEmpty;
        }
    }

    return progressBar;
}

module.exports = getProgressBar;