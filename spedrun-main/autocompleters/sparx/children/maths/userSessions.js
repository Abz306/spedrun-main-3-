const { SeparatorSpacingSize, StringSelectMenuOptionBuilder, SeparatorBuilder, ContainerBuilder, TextDisplayBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { emojis, colours } = require('../../../../config.json');
const base = require('../../../../generic/baseUserSessions');

const saveAccountBtn = new ButtonBuilder()
    .setCustomId('save_account')
    .setLabel('Save Account')
    .setEmoji(emojis.save_account)
    .setStyle(ButtonStyle.Secondary);
const tagChangerBtn = new ButtonBuilder()
    .setCustomId('tag_changer')
    .setLabel('Tag Changer')
    .setEmoji(emojis.tag_changer)
    .setStyle(ButtonStyle.Secondary);

class userSession {
    constructor(interaction, loginDetails, requesticator) {
        this.interaction = interaction;
        this.loginDetails = loginDetails;
        this.requesticator = requesticator;
        this.platform = 'maths';
        this.homeworksEnddate = {};
        // Maths Specific Settings
        this.settings = {};

        this.selectedHomework = null;
    }

    loadFromObject(data) {
        Object.assign(this, data);
    }

    async createSelector() {
        const homeworks = await this.requesticator.getHomeworks();
        const packages = Array.isArray(homeworks?.packages) ? homeworks.packages : [];
        const getProgress = homework => {
            const totalItems = Math.max(0, Number(homework.numTaskItems) || 0);
            const completedItems = Math.max(
                0,
                Math.min(totalItems, Number(homework.numTaskItemsDone) || 0)
            );
            return {
                totalItems,
                completedItems,
                percent: totalItems > 0
                    ? Math.round((completedItems / totalItems) * 100)
                    : 0,
            };
        };

        const categoryOrder = title => {
            const normalizedTitle = String(title || '').trim().toLowerCase();
            if (normalizedTitle.startsWith('homework')) return 0;
            if (normalizedTitle.startsWith('xp boost')) return 1;
            if (normalizedTitle.startsWith('targets')) return 2;
            return 3;
        };
        const orderedList = packages
            .filter(pkg => pkg?.packageID && (pkg.title || pkg.name))
            .sort((a, b) => {
                const aProgress = getProgress(a);
                const bProgress = getProgress(b);
                const aCompleted = aProgress.totalItems > 0 && aProgress.completedItems >= aProgress.totalItems;
                const bCompleted = bProgress.totalItems > 0 && bProgress.completedItems >= bProgress.totalItems;
                if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;

                const categoryDifference = categoryOrder(a.title || a.name) - categoryOrder(b.title || b.name);
                if (categoryDifference) return categoryDifference;
                return (Number(b.endDate?.seconds) || 0) - (Number(a.endDate?.seconds) || 0);
            })
            .slice(0, 25);

        const select = new StringSelectMenuBuilder()
            .setCustomId('select_homework')
            .setPlaceholder('Choose a homework task')
            .setMinValues(0)
            .setDisabled(!orderedList.length);

        for (const homework of orderedList) {
            const title = String(homework.title || homework.name).slice(0, 100);
            const { percent } = getProgress(homework);
            this.homeworksEnddate[homework.packageID] = Number(homework.endDate?.seconds) || 0;
            select.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(title)
                    .setDescription(`${percent}% complete`)
                    .setValue(String(homework.packageID))
                    .setDefault(this.selectedHomework === homework.packageID)
            );
        }

        if (!orderedList.length) {
            select.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('No homework available')
                    .setDescription('No active homework was returned for this account')
                    .setValue('no_homework_available')
                    .setDefault(false)
            );
        }

        this.selectRow = select;
        this.hasHomeworkOptions = orderedList.length > 0;
        this.homeworkDiagnostics = {
            ...this.requesticator.homeworkDiagnostics,
            selectablePackages: orderedList.length
        };
        const packagesWithProgress = packages
            .map(getProgress)
            .filter(progress => progress.totalItems > 0);
        const totalTasks = packagesWithProgress.reduce((sum, progress) => sum + progress.totalItems, 0);
        const completedTasks = packagesWithProgress.reduce((sum, progress) => sum + progress.completedItems, 0);
        this.homeworkProgressSummary = totalTasks > 0
            ? `Overall homework progress: **${Math.round((completedTasks / totalTasks) * 100)}%** (${completedTasks}/${totalTasks} questions completed)`
            : null;
    }

    async init() {
        this.userInfo = await this.requesticator.getUserInfo();
        this.userDisplayName = await this.requesticator.getUserDisplayName();

        await this.requesticator.getClientSession();
    }

    async updateEmbed(disabled = false) {
        const welcomeMessage = `## Sparx Maths Autocompleter\nWelcome, **${this.userInfo.givenName} the ${this.userDisplayName}**!\nSelect a homework and it automatically will be completed for you!`;
        const loginSuccessSection = new TextDisplayBuilder().setContent(`${welcomeMessage}`);
        const settingsSetup = new TextDisplayBuilder().setContent(`### Settings`);
        const pdfSet = new TextDisplayBuilder().setContent(`**📜 PDF **\n**Answers**  \`\`✅\`\`\n**Questions**  ${this.settings.pdfSettings.question ? '``✅``' : '``❌``'}\n**Working Out**  ${this.settings.pdfSettings.working_out ? '``✅``' : '``❌``'}`);
        const minTime = new TextDisplayBuilder().setContent(`⏰ **Minimum Time**: ${this.settings.min} Seconds`);
        const maxTime = new TextDisplayBuilder().setContent(`⏰ **Maximum Time**: ${this.settings.max} Seconds`);

        const XpFarmingButton = new ButtonBuilder()
            .setCustomId('xp_farming')
            .setLabel('XP Farming')
            .setEmoji(emojis.x)
            .setDisabled(disabled)
            .setStyle(ButtonStyle.Primary);

        const IndependentLearningButton = new ButtonBuilder()
            .setCustomId('independent_learning')
            .setLabel('Independent Learning')
            .setEmoji(emojis.independent_learning)
            .setDisabled(disabled)
            .setStyle(ButtonStyle.Primary);

        const settingsRow = new ActionRowBuilder()
            .addComponents(IndependentLearningButton, XpFarmingButton);

        const startRow = new ActionRowBuilder();
        if (this.selectedHomework) {
            const startButton = new ButtonBuilder()
                .setCustomId('start')
                .setLabel('Start')
                .setStyle(ButtonStyle.Success)
                .setEmoji(emojis.tick)
                .setDisabled(disabled);
            startRow.addComponents(startButton);
        }

        if (this.loginDetails.username) {
            const saveAccountBtnCopy = ButtonBuilder.from(saveAccountBtn);
            saveAccountBtnCopy.setDisabled(disabled);
            startRow.addComponents(saveAccountBtnCopy);
        }

        const tagBtnCopy = ButtonBuilder.from(tagChangerBtn);
        tagBtnCopy.setDisabled(disabled);
        startRow.addComponents(tagBtnCopy);
        const settingBtn = new ButtonBuilder()
            .setCustomId('settings')
            .setLabel('Settings')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emojis.settings)
            .setDisabled(disabled);
        startRow.addComponents(settingBtn);

        const mathsEmbed = new ContainerBuilder()
            .setAccentColor(colours.sparx_maths)
            .addTextDisplayComponents(
                loginSuccessSection
            )
            .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                settingsSetup,
                pdfSet,
                minTime,
                maxTime
            );

        await this.createSelector();
        if (!this.hasHomeworkOptions) {
            const diagnostics = this.homeworkDiagnostics;
            const diagnosticText = diagnostics
                ? `Sparx returned ${diagnostics.returnedPackages} packages via ${diagnostics.packageSource}; ${diagnostics.selectablePackages} had both an ID and title (HTTP ${diagnostics.httpStatus ?? 'unknown'}, gRPC ${diagnostics.grpcStatus}).`
                : 'Sparx did not return homework details.';
            mathsEmbed.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `No selectable homework was found for this account. ${diagnosticText} Check that you logged into the right school and account.`
                )
            );
        }
        this.selectRow.setDisabled(disabled || !this.hasHomeworkOptions);
        mathsEmbed.addActionRowComponents(new ActionRowBuilder().addComponents(this.selectRow));
        if (this.homeworkProgressSummary) {
            mathsEmbed.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(this.homeworkProgressSummary)
            );
        }
        mathsEmbed.addActionRowComponents(settingsRow, startRow);
        const message_sent = await this.interaction.editReply({
            components: [mathsEmbed]
        });

        this.message_sent = message_sent;

        return message_sent;
    }
}

class userSessions extends base {
    constructor() {
        super('sparx', 'maths');
    }

    createNewSession(interaction, loginDetails, token, cookies) {
        this.sessions[interaction.user.id] = new userSession(interaction, loginDetails, new this.requesticator(token, loginDetails, cookies));
        return this.sessions[interaction.user.id];
    }

}

const UserSessions = new userSessions();

module.exports = UserSessions;