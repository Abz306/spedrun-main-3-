async function getApiKeys(apikeys = []) {
  return [...new Set(apikeys)];
}

module.exports = getApiKeys;