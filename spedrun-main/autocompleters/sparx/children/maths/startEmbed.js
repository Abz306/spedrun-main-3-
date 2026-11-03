const { ButtonStyle } = require('discord.js');
const { emojis, colours } = require('../../../../config.json');
const createPlatformStartPanel = require('../../../../generic/platformStartPanel');

module.exports = createPlatformStartPanel({
    name: 'Sparx Maths',
    color: colours.sparx_maths,
    buttons: [
        { customId: 'sparx(maths)_login', label: 'Login', emoji: emojis.login },
        { customId: 'check_queue_sparx(maths)', label: 'Check Queue', style: ButtonStyle.Primary, emoji: emojis.queue },
    ],
});
