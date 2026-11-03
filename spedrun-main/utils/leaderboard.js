require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function getHomeworkLeaderboard(limit = 10) {
    const supabase = createClient(process.env.SUPABASEURL, process.env.SUPABASEKEY);
    const { data, error } = await supabase
        .from('accounts')
        .select('discord_id, total_usage');
    if (error) throw error;

    return (data || [])
        .map(account => {
            const usage = account.total_usage || {};
            const solved = Object.values(usage).reduce(
                (sum, platform) => sum + Number(platform?.total_uses || 0),
                0
            );
            return { discordId: String(account.discord_id), solved };
        })
        .filter(account => account.solved > 0)
        .sort((a, b) => b.solved - a.solved)
        .slice(0, limit);
}

module.exports = getHomeworkLeaderboard;
