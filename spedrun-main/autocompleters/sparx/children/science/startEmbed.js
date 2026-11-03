const { ButtonStyle } = require('discord.js');
const { emojis, colours } = require('../../../../config.json');
const createPlatformStartPanel = require('../../../../generic/platformStartPanel');

module.exports = createPlatformStartPanel({
    name: 'Sparx Science',
    color: colours.sparx_science,
    buttons: [
        { customId: 'sparx(science)_login', label: 'Login', emoji: emojis.login },
        { customId: 'check_queue_sparx(science)', label: 'Check Queue', style: ButtonStyle.Primary, emoji: emojis.queue },
    ],
});
