async function menu(userSession) {
    await userSession.autocompleter.main();
}

module.exports = menu;