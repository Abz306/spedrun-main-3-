const { emojis, colours } = require('../../config.json');
const createPlatformStartPanel = require('../../generic/platformStartPanel');

module.exports = createPlatformStartPanel({
    name: 'Purple Mash',
    color: colours.purplemash,
    buttons: [
        { customId: 'purplemash_login', label: 'Login', emoji: emojis.login },
    ],
});
