const { spawn } = require('node:child_process');
const path = require('node:path');

const projectRoot = path.join(__dirname, 'spedrun-main');
const child = spawn(
    process.execPath,
    [path.join(projectRoot, 'deployment.js')],
    { cwd: projectRoot, stdio: 'inherit', env: process.env }
);

for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => child.kill(signal));
}

child.on('error', (error) => {
    console.error(`Could not start command deployment: ${error.message}`);
    process.exitCode = 1;
});

child.on('exit', (code, signal) => {
    process.exitCode = code ?? (signal ? 1 : 0);
});
