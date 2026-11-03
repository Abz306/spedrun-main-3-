const { ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');
const { updateDB, getFromDB } = require('../database/general');
const removeDuplicates = require('../utils/removeDuplicates');
const { colours } = require('../config.json');
const { updateSettingsEmbed } = require('../generic/updateSettingsEmbeds.js');

async function handleApiKeyRequest(interaction) {
    if (interaction.customId === 'changeSettings_general_add_apikey') {
        const existingApiKeys = (await getFromDB('accounts', 'discord_id', interaction.user.id, 'apikeys')).apikeys;
        const apikey = interaction.fields.getTextInputValue('apikey').trim();
        const separator = apikey.indexOf(':');
        const provider = separator === -1 ? 'gemini' : apikey.slice(0, separator).toLowerCase();
        const key = separator === -1 ? apikey : apikey.slice(separator + 1);
        const validProvider = ['gemini', 'mistral', 'qwen', 'openrouter'].includes(provider);
        const validKey = provider === 'gemini'
            ? (key.startsWith('AIzaSy') && key.length === 39) || /^AQ\.[A-Za-z0-9._-]{10,}$/.test(key)
            : key.length > 0;
        if (!validProvider || !validKey) {
            const container = new ContainerBuilder()
                .setAccentColor(colours.light_red)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`## API Key Invalid\nUse a valid Gemini key, or add another provider's key as provider:API_KEY (for example, mistral:your-key).`)
                );

            await interaction.followUp({
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                components: [container]
            });
            return;
        }

        const newKeys = removeDuplicates([...existingApiKeys, apikey]);
        await updateDB('accounts', {apikeys: newKeys}, 'discord_id', interaction.user.id);

        const container = new ContainerBuilder()
            .setAccentColor(colours.light_green)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`## API Key Added Successfully\nYour API Key has been successfully added!`)
            );

        await interaction.followUp({
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            components: [container]
        });

        await updateSettingsEmbed(interaction, 'general');
    }
}

module.exports = { handleApiKeyRequest };