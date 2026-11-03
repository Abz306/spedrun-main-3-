const DrFrostRequesticator = require('../../archive/drfrost/requesticator.js');

class Requesticator extends DrFrostRequesticator {
    async getAccountId() {
        const userInfo = await this.sendRequest('https://www.drfrost.org/api/user/current');
        return userInfo?.user?.uid ? String(userInfo.user.uid) : null;
    }
}

module.exports = Requesticator;