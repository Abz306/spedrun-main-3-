class Requesticator {
    constructor(token, loginInfo = {}) {
        this.token = token;
        this.loginInfo = loginInfo;
    }
    async getAccountId() { return null; }
}
module.exports = Requesticator;
