const fs = require('node:fs');
const path = require('node:path');
const { AttachmentBuilder, MessageFlags } = require('discord.js');
const config = require('../config.json');
const relayPanel = require('./relayPanel.js');

function getComponentSignatures(node) {
    const signatures = [];

    const walk = (value) => {
        if (!value || typeof value !== 'object') return;

        if (typeof value.toJSON === 'function') {
            value = value.toJSON();
            if (!value || typeof value !== 'object') return;
        }

        if (typeof value.content === 'string') signatures.push(value.content);
        if (typeof value.custom_id === 'string') signatures.push(value.custom_id);
        if (typeof value.customId === 'string') signatures.push(value.customId);

        if (Array.isArray(value.components)) {
            for (const child of value.components) walk(child);
        }
    };

    walk(node);
    return signatures;
}

function getConfiguredPlatformSignatures() {
    const root = path.join(__dirname, '..', 'autocompleters');
    const signatures = new Set();

    for (const [configKey, channelId] of Object.entries(config.channels)) {
        if (!channelId) continue;

        const [folderName, ...childParts] = configKey.split('_');
        const panelPath = childParts.length
            ? path.join(root, folderName, 'children', childParts.join('_'), 'startEmbed.js')
            : path.join(root, folderName, 'startEmbed.js');

        if (!fs.existsSync(panelPath)) continue;

        for (const signature of getComponentSignatures(require(panelPath))) {
            signatures.add(signature);
        }
    }

    return signatures;
}

async function sendPersistentEmbeds(client) {
    const panelChannelID = config.status_channel_id;
    if (!panelChannelID) {
        console.warn('Control panel was not updated: status_channel_id is not configured.');
        return;
    }

    const panelChannel = await client.channels.fetch(panelChannelID);
    if (!panelChannel?.messages) {
        console.warn(`Control panel was not updated: channel ${panelChannelID} cannot contain messages.`);
        return;
    }

    const panelMessages = await panelChannel.messages.fetch({ limit: 100 });
    const panelSignatures = getComponentSignatures(relayPanel);
    const existingPanels = [...panelMessages.values()].filter(message =>
        message.author.id === client.user.id &&
        getComponentSignatures(message).includes('relay_start_session')
    );
    const panel = existingPanels[0];

    if (panel) {
        await panel.edit({
            components: [relayPanel],
            attachments: [],
            files: [new AttachmentBuilder(
                path.join(__dirname, '..', 'assets', 'relay-ai-logo.png'),
                { name: 'relay-ai-logo.png' }
            )],
        });
        console.log('Updated the existing Hielke AI control panel.');
        for (const duplicate of existingPanels.slice(1)) {
            await duplicate.delete();
            console.log('Removed a duplicate Hielke AI control panel.');
        }
    } else {
        await panelChannel.send({
            flags: MessageFlags.IsComponentsV2,
            components: [relayPanel],
            files: [new AttachmentBuilder(
                path.join(__dirname, '..', 'assets', 'relay-ai-logo.png'),
                { name: 'relay-ai-logo.png' }
            )],
        });
        console.log('Sent the Hielke AI control panel.');
    }

    const platformSignatures = getConfiguredPlatformSignatures();
    const channelIDs = new Set([
        panelChannelID,
        ...Object.values(config.channels).filter(Boolean),
    ]);

    for (const channelID of channelIDs) {
        let channel;
        try {
            channel = channelID === panelChannelID
                ? panelChannel
                : await client.channels.fetch(channelID);
            if (!channel?.messages) continue;

            const messages = channelID === panelChannelID
                ? panelMessages
                : await channel.messages.fetch({ limit: 100 });

            for (const message of messages.values()) {
                if (message.author.id !== client.user.id) continue;
                if (panelSignatures.some(signature => getComponentSignatures(message).includes(signature))) continue;

                const hasPlatformPanel = getComponentSignatures(message)
                    .some(signature => platformSignatures.has(signature));
                if (!hasPlatformPanel) continue;

                await message.delete();
                console.log(`Removed an old platform card from channel ${channelID}.`);
            }
        } catch (error) {
            console.error(`Failed to update or clean panels in channel ${channelID}:`, error);
        }
    }
}

module.exports = sendPersistentEmbeds;
