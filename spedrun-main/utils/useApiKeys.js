async function useApiKeys(apikeys, fn, fnArguments) {
    let answer;
    for (const apikey of apikeys) {
        answer = await fn(apikey, ...fnArguments);
        if (typeof answer !== 'number') {
            break;
        }
    }
    return answer;
}

module.exports = useApiKeys;