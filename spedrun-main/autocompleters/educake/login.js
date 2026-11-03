const { educakeLogin } = require('../../archive/educake/puppeteer.js');

async function login({ username, password, type } = {}) {
    const cookieString = await educakeLogin(username, password, type || 'Normal');
    if (!cookieString) {
        return { status: 'error', message: 'Login failed' };
    }
    return { authToken: cookieString, cookies: cookieString };
}

module.exports = login;
