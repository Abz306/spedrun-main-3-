const { MessageFlags, LabelBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const { emojis } = require('../config.json');
const disableComponents = require('../utils/disableComponents.js');

async function handleLoginChoice(componentInteraction, platform, school = false, type = false) {
    if (componentInteraction.customId === 'login') {
        const modal = new ModalBuilder()
            .setCustomId(`autocompleterModule_${platform}_login`)
            .setTitle('Login');

        const usernameInput = new TextInputBuilder()
            .setCustomId('username')
            .setLabel('Username')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const passwordInput = new TextInputBuilder()
            .setCustomId('password')
            .setLabel('Password')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        if (school) {
            const schoolInput = new TextInputBuilder()
                .setCustomId('school')
                .setLabel('School')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(schoolInput));
        }
        modal.addComponents(
            new ActionRowBuilder().addComponents(usernameInput),
            new ActionRowBuilder().addComponents(passwordInput)
        );

        if (type) {
            const typeInput = new StringSelectMenuBuilder()
                .setCustomId('type')
                .setPlaceholder('Normal/Microsoft/Google')
                .addOptions(
                    { label: 'Normal', value: 'Normal', emoji: emojis.sparx },
                    { label: 'Microsoft', value: 'Microsoft', emoji: emojis.microsoft },
                    { label: 'Google', value: 'Google', emoji: emojis.google }
                );

            modal.addLabelComponents(new LabelBuilder({
                label: 'Login Type',
                component: typeInput
            }));
        }

        await componentInteraction.showModal(modal);
    } else if (componentInteraction.customId === `${platform}_savedAccounts_view`) {
        const { handleSavedAccounts } = require('../handlers/savedAccountsHandler.js');
        await handleSavedAccounts(componentInteraction, componentInteraction.customId.split('_')[2], platform);
    } else if (componentInteraction.customId === 'login_cookies') {
        const modal = new ModalBuilder()
            .setCustomId(`autocompleterModule_${platform}_loginCookie`)
            .setTitle('Login');

        const cookieInput = new TextInputBuilder()
            .setCustomId('cookie')
            .setLabel('Cookie')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(cookieInput));
        await componentInteraction.showModal(modal);
    }
}

async function loginHandler(interaction, container, platform, school=false, type=false) {
    await interaction.update({
        components: [container],
    });
    const message_sent = await interaction.fetchReply();

    const collector = message_sent.createMessageComponentCollector({
        time: 420_000,
        componentType: ComponentType.Button
    });

    collector.on('collect', async (componentInteraction) => {
        await handleLoginChoice(componentInteraction, platform, school, type);
    });

    collector.on('end', async () => {
        const newcontainer = disableComponents(container);
        await interaction.editReply({
            components: [newcontainer]
        });
    });

    return message_sent;
}

module.exports = loginHandler;
module.exports.handleLoginChoice = handleLoginChoice;