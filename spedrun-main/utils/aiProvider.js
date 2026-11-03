const providers = {
    mistral: 'https://api.mistral.ai/v1/chat/completions',
    qwen: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
    openrouter: 'https://openrouter.ai/api/v1/chat/completions'
};

function parseModel(model) {
    const separator = model.indexOf(':');
    if (separator !== -1) {
        const provider = model.slice(0, separator).toLowerCase();
        const modelId = model.slice(separator + 1);
        if (provider === 'gemini' || providers[provider]) {
            return { provider, modelId };
        }
    }

    return {
        provider: 'gemini',
        modelId: model.startsWith('gemini-') ? model : `gemini-${model}`
    };
}

function getProviderApiKeys(apiKeys, model) {
    const { provider } = parseModel(model);
    const environmentApiKey = process.env[`${provider.toUpperCase()}_API_KEY`]?.trim();
    const matchingApiKeys = apiKeys.filter(key => {
        const separator = key.indexOf(':');
        const keyProvider = separator === -1 ? 'gemini' : key.slice(0, separator).toLowerCase();
        return keyProvider === provider;
    });

    return [
        ...(environmentApiKey ? [`${provider}:${environmentApiKey}`] : []),
        ...matchingApiKeys
    ];
}

function convertSchema(schema) {
    if (Array.isArray(schema)) return schema.map(convertSchema);
    if (!schema || typeof schema !== 'object') return schema;

    const converted = {};
    for (const [key, value] of Object.entries(schema)) {
        if (key === 'propertyOrdering') continue;
        converted[key] = key === 'type' && typeof value === 'string'
            ? value.toLowerCase()
            : convertSchema(value);
    }
    return converted;
}

function getOpenAIContents(contents) {
    const parts = [];
    for (const item of contents) {
        if (item.text) parts.push({ type: 'text', text: item.text });
        if (item.inlineData) {
            if (item.inlineData.altText) {
                parts.push({ type: 'text', text: item.inlineData.altText });
            }
            parts.push({
                type: 'image_url',
                image_url: {
                    url: `data:${item.inlineData.mimeType};base64,${item.inlineData.data}`
                }
            });
        }
    }
    return parts;
}

async function generateAIJson(apiKey, model, contents, properties, systemInstruction) {
    const { provider, modelId } = parseModel(model);
    const schema = {
        type: 'OBJECT',
        properties,
        required: Object.keys(properties),
        propertyOrdering: Object.keys(properties)
    };

    try {
        if (provider === 'gemini') {
            const { GoogleGenAI } = require('@google/genai');
            const key = apiKey.includes(':') ? apiKey.slice(apiKey.indexOf(':') + 1) : apiKey;
            const ai = new GoogleGenAI({ apiKey: key });
            const response = await ai.models.generateContent({
                model: modelId,
                contents,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: schema,
                    systemInstruction
                }
            });
            return response.candidates[0].content.parts[0].text;
        }

        const endpoint = providers[provider];
        if (!endpoint) throw new Error(`Unsupported AI provider: ${provider}`);
        const apiKeySeparator = apiKey.indexOf(':');
        const key = apiKeySeparator === -1 ? apiKey : apiKey.slice(apiKeySeparator + 1);
        const schemaInstruction = `Return a JSON object matching this schema: ${JSON.stringify(convertSchema(schema))}`;
        const messages = [];
        if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
        messages.push({
            role: 'user',
            content: [
                { type: 'text', text: schemaInstruction },
                ...getOpenAIContents(contents)
            ]
        });

        const response = await fetch(providers[provider], {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${key}`,
                'Content-Type': 'application/json'
            },
            signal: AbortSignal.timeout(60000),
            body: JSON.stringify({
            model: modelId,
            messages,
            response_format: { type: 'json_object' }
            })
        });
        if (!response.ok) {
            const error = new Error(`AI provider returned HTTP ${response.status}`);
            error.status = response.status;
            throw error;
        }
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        const status = error.status;
        if (status === 429) return 429;
        if (status === 400) return 400;
        if (status === 503 || status === 502 || status === 504) return 503;
        throw error;
    }
}

module.exports = { generateAIJson, getProviderApiKeys, parseModel };