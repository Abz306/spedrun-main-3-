require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const withRetry = require('../utils/withRetry');

const supabaseUrl = process.env.SUPABASEURL;
const supabaseKey = process.env.SUPABASEKEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function addToDbEducake(id, answer, triedAdvanced = false) {
    const { data } = await supabase
        .from('educake')
        .select('*')
        .eq('id', id)
        .maybeSingle()
        .throwOnError();

    if (!data) {
        await supabase
            .from('educake')
            .insert([{ id, answer, triedAdvanced }])
            .throwOnError();
        return;
    }

    await supabase
        .from('educake')
        .update({ answer, triedAdvanced })
        .eq('id', id)
        .throwOnError();
}

async function checkAnswer(id) {
    const { data } = await supabase
        .from('educake')
        .select('*')
        .eq('id', id)
        .maybeSingle()
        .throwOnError();

    if (!data) return null;
    if (data.answer !== null && data.answer !== undefined && data.answer !== '') {
        return data.answer;
    }
    return data.triedAdvanced ?? null;
}

module.exports = {
    addToDbEducake: withRetry(addToDbEducake),
    addToDb: withRetry(addToDbEducake),
    checkAnswer: withRetry(checkAnswer)
};
