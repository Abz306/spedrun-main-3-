const { educake_model_executor } = require('../../archive/educake/main.js');

async function modelExecutor(interaction) {
    // Handle modal submissions for educake
    // This delegates to the main educake model executor in the archive
    await educake_model_executor(interaction);
}

module.exports = modelExecutor;
