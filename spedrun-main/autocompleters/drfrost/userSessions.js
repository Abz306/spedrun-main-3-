const { drfrostAutocompleter, userMenus } = require('../../archive/drfrost/main.js');
const { checkAccount } = require('../../database/accounts.js');

function getLoginDetails(autocompleter) {
    const details = autocompleter.loginDetails;
    return {
        app: 'drfrost',
        username: details.email ?? details.username,
        password: details.password,
        type: details.loginType ?? details.type
    };
}

function get(userId) {
    const autocompleter = userMenus[userId];
    if (!autocompleter) return undefined;
    return { autocompleter, loginDetails: getLoginDetails(autocompleter) };
}

async function createNewSession(interaction, loginDetails, authToken) {
    const account = await checkAccount(interaction.user.id);
    const settings = account?.drfrost_settings ?? { min: 100, max: 140 };
    const autocompleter = new drfrostAutocompleter(
        interaction,
        authToken,
        {
            email: loginDetails.username,
            password: loginDetails.password,
            loginType: loginDetails.type,
            app: 'drfrost'
        },
        settings
    );
    userMenus[interaction.user.id] = autocompleter;
    return get(interaction.user.id);
}

module.exports = { get, createNewSession };