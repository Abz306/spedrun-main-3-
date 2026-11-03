const triggers = [
    { needle: 'welsh', reply: '🐉 Cymru am byth! / Wales forever!' },
    { needle: 'cymry', reply: '🐉 Shwmae! Cymry option has been unlocked.' },
    { needle: 'educake', reply: 'بقاء educake working! 🎂' }
];

async function maybeReplyEasterEgg(message) {
    if (message.author?.bot) return false;
    if (!message.mentions?.has(message.client?.user)) return false;

    const content = (message.content || '').toLowerCase();
    if (!content) return false;

    for (const item of triggers) {
        if (content.includes(item.needle)) {
            try {
                await message.reply(item.reply.slice(0, 1900));
            } catch {}
            return true;
        }
    }

    const roll = Math.random();
    if (content.includes('easter') || content.includes('secret') || content.includes('egg hunt')) {
        if (roll < 0.75) {
            try {
                await message.reply('🕵️ you found a secret. It is just a biscuit 🍪');
            } catch {}
            return true;
        }
    }

    return false;
}

module.exports = { maybeReplyEasterEgg };
