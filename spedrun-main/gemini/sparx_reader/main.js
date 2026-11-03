require('dotenv').config();
const { generateAIJson } = require('../../utils/aiProvider');

async function answerQuestionAi(apiKey, extract, question, questionOptions, incorrectAnswers=[], model='gemini:gemini-3.8-flash') {

  try {
    const validQuestionOptions = Array.isArray(questionOptions)
      ? questionOptions.filter(option => option !== undefined && option !== null && String(option).trim() !== '')
      : [];
    const invalidAnswers = Array.isArray(incorrectAnswers) ? incorrectAnswers : [];

    const possibleQuestions = validQuestionOptions.filter(option => !invalidAnswers.includes(option));
    const answerChoices = possibleQuestions.length > 0 ? possibleQuestions : validQuestionOptions;

    if (!answerChoices.length) {
      throw new Error('No answer options available for this question.');
    }

    const systemInstruction = "Answer the question using the extract. Return exactly one of the provided answer options, word for word, and nothing else.";
    const response = await generateAIJson(apiKey, model, [
      { text: `Extract:\n${extract}\n\nQuestion:\n${question}` }
    ], {
      answer: { type: 'STRING', enum: answerChoices }
    }, systemInstruction);
    if (typeof response === 'number') return response;

    const rawText = String(response).trim();
    const normalizedText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim();

    if (answerChoices.includes(normalizedText)) {
      return normalizedText;
    }

    const parsed = JSON.parse(normalizedText);
    return parsed.answer;

  } catch(err) {

    const handlableErrorCodes = [503, 429, 400];
    let parsed = err;

    // If it's an Error object with JSON in .message
    if (err instanceof Error) {
        try {
            parsed = JSON.parse(err.message);
        } catch {
            parsed = err; // fallback
        }
    }

    // If it's a JSON string
    if (typeof err === "string") {
        try {
            parsed = JSON.parse(err);
        } catch {
            parsed = { error: { message: err } }; // wrap raw string
        }
    }

    const code = parsed?.error?.code;
    if (handlableErrorCodes.includes(code)) {
        return code;
    } else {
        throw err;
    }
  }
}

module.exports = { answerQuestionAi };