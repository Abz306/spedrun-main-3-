const { emojis, colours } = require('../../config.json');
const createPlatformStartPanel = require('../../generic/platformStartPanel');

module.exports = createPlatformStartPanel({
    name: 'Educake',
    color: colours.educake,
    buttons: [
        { customId: 'educake_login', label: 'Login', emoji: emojis.login },
    ],
});
