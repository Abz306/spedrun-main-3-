const { execFileSync } = require('node:child_process');

let commitHash = 'unknown';
let commitMessage = 'unknown';

try {
    const options = { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] };
    commitHash = execFileSync('git', ['rev-parse', '--short', 'HEAD'], options).trim();
    commitMessage = execFileSync('git', ['log', '-1', '--pretty=%s'], options).trim();
} catch (err) {
    // Git is optional; the bot can run without repository metadata.
}

module.exports = {
    commitHash,
    commitMessage
};