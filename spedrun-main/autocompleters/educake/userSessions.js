const { checkAccount } = require('../../database/accounts.js');
const EducakeRequesticator = require('../../archive/educake/requesticator.js');

function getLoginDetails(autocompleter) {
    const details = autocompleter?.loginDetails || {};
    return {
        app: 'educake',
        username: details.email ?? details.username,
        password: details.password,
        type: details.loginType ?? details.type
    };
}

function get(userId) {
    const { userMenus } = require('../../archive/educake/main.js');
    const autocompleter = userMenus[userId];
    if (!autocompleter) return undefined;
    return { autocompleter, loginDetails: getLoginDetails(autocompleter) };
}

async function createNewSession(interaction, loginDetails, authToken, cookies) {
    const { educakeMainMenu, userMenus, userSessions } = require('../../archive/educake/main.js');
    const account = await checkAccount(interaction.user.id);
    const settings = account?.educake_settings ?? { min: 5, max: 10 };

    const autocompleter = new educakeMainMenu(interaction, settings);
    // Use cookies if provided, otherwise fall back to authToken (for backwards compatibility)
    const cookieString = cookies || authToken;
    const session = new EducakeRequesticator(cookieString, {
        email: loginDetails.username,
        password: loginDetails.password,
        loginType: loginDetails.type,
        app: 'educake'
    });

    const tokenResponse = await session.sendRequest('https://my.educake.co.uk/session-token');
    session.sessionToken = tokenResponse.accessToken;

    userSessions[interaction.user.id] = session;
    userMenus[interaction.user.id] = autocompleter;
    return get(interaction.user.id);
}

module.exports = { get, createNewSession };
