const { drfrostLogin } = require('../../archive/drfrost/puppeteer.js');

async function login({ username, password, type } = {}) {
    return { authToken: await drfrostLogin(username, password, type) };
}

module.exports = login;