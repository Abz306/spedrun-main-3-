const { emojis, colours } = require('../../config.json');
const createPlatformStartPanel = require('../../generic/platformStartPanel');

module.exports = createPlatformStartPanel({
    name: 'Dr Frost',
    color: colours.orangy_brown,
    buttons: [
        { customId: 'drfrost_login', label: 'Login', emoji: emojis.login },
    ],
});
