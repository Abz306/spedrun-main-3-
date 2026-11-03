const fs = require('node:fs');
const path = require('node:path');
const config = require('../config.json');
const processLogin = require('./processLogin');

const platformKeys = Object.keys(config.channels || {}).map((configKey) => {
    const [parent, ...childParts] = configKey.split('_');
    return childParts.length ? `${parent}(${childParts.join('_')})` : parent;
});

async function dispatchLoginModal(interaction) {
    const match = interaction.customId.match(/^autocompleterModule_(.+)_(login|loginCookie)$/);
    if (!match) {
        throw new Error(`Unsupported login modal: ${interaction.customId}`);
    }

    const [, platformKey] = match;
    if (!platformKeys.includes(platformKey)) {
        throw new Error(`Login modal references an unconfigured platform: ${platformKey}`);
    }

    const openParenthesis = platformKey.indexOf('(');
    const parent = openParenthesis === -1
        ? platformKey
        : platformKey.slice(0, openParenthesis);
    const child = openParenthesis === -1
        ? null
        : platformKey.slice(openParenthesis + 1, platformKey.lastIndexOf(')'));

    const platformDirectory = path.join(__dirname, '..', 'autocompleters', parent);
    const sessionDirectory = child
        ? path.join(platformDirectory, 'children', child)
        : platformDirectory;
    const modulePaths = {
        login: path.join(platformDirectory, 'login.js'),
        getTokenRequest: path.join(platformDirectory, 'getTokenRequest.js'),
        userSessions: path.join(sessionDirectory, 'userSessions.js'),
        menu: path.join(platformDirectory, 'menu.js'),
    };

    for (const [moduleName, modulePath] of Object.entries(modulePaths)) {
        if (!fs.existsSync(modulePath)) {
            throw new Error(`Missing ${moduleName} module for ${platformKey}: ${modulePath}`);
        }
    }

    await processLogin(
        interaction,
        parent,
        require(modulePaths.login),
        require(modulePaths.getTokenRequest),
        require(modulePaths.userSessions),
        require(modulePaths.menu)
    );
}

module.exports = dispatchLoginModal;
