const EducakeRequesticator = require('../../archive/educake/requesticator.js');

class Requesticator extends EducakeRequesticator {
    constructor(token, loginInfo = {}) {
        super(token, loginInfo);
        this.authToken = token;
    }

    async getAccountId() {
        const tokenResponse = await this.sendRequest('https://my.educake.co.uk/session-token');
        this.sessionToken = tokenResponse.accessToken;
        const userInfo = await this.sendRequest('https://my.educake.co.uk/api/me');
        return String(userInfo.id);
    }
}

module.exports = Requesticator;
