const aiModels = require('../aiModelsRanking.json');

function isHigherModel(modelTest, lastModelTried) {
    const normalize = (model) => model.includes(':')
        ? model
        : model.startsWith('gemini-') ? `gemini:${model}` : `gemini:gemini-${model}`;
    
    const testIndex = aiModels.indexOf(normalize(modelTest));
    const lastIndex = aiModels.indexOf(normalize(lastModelTried));
    if (testIndex === -1 || lastIndex === -1) return false;
    return lastIndex < testIndex;
}

module.exports = isHigherModel;