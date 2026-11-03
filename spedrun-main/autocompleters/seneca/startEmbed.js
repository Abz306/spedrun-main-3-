const { emojis, colours } = require('../../config.json');
const createPlatformStartPanel = require('../../generic/platformStartPanel');

module.exports = createPlatformStartPanel({
    name: 'Seneca',
    color: colours.seneca,
    buttons: [
        { customId: 'seneca_login', label: 'Login', emoji: emojis.login },
    ],
});
