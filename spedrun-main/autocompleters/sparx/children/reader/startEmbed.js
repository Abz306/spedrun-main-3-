const { ButtonStyle } = require('discord.js');
const { emojis, colours } = require('../../../../config.json');
const createPlatformStartPanel = require('../../../../generic/platformStartPanel');

module.exports = createPlatformStartPanel({
    name: 'Sparx Reader',
    color: colours.sparx_reader,
    buttons: [
        { customId: 'sparx(reader)_login', label: 'Login', emoji: emojis.login },
        { customId: 'check_queue_sparx(reader)', label: 'Check Queue', style: ButtonStyle.Primary, emoji: emojis.queue },
    ],
});
