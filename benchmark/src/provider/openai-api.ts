import { OpenAI } from 'openai';
import { CEFRLevel } from '..';

const endpoints: { [key: string]: OpenAI } = {
    // 'http://localhost:1234/v1': new OpenAI({
    //     apiKey: '',
    //     baseURL: 'http://localhost:1234/v1',
    // }),
    'https://api.deepinfra.com/v1/openai': new OpenAI({
        apiKey: 'INSERT_KEY_HERE',
        baseURL: 'https://api.deepinfra.com/v1/openai',
    }),
    // 'https://api.openai.com/v1': new OpenAI({
    //     apiKey: '',
    //     baseURL: 'https://api.openai.com/v1',
    // }),
    // 'http://localhost:11434/v1': new OpenAI({
    //     apiKey: 'ollama',
    //     baseURL: 'http://localhost:11434/v1',
    // }),
    // 'https://openrouter.ai/api/v1': new OpenAI({
    //     apiKey: '',
    //     baseURL: 'https://openrouter.ai/api/v1',
    // }),
}

const defaultEndpoint = 'https://api.openai.com/v1';

const possibleLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export interface PredictionSettings {
    model: string;
    systemPrompt: string;
    text: string;
    temperature?: number;
    endpoint?: string;
}

export const generatePrediction = async (predictionSettings: PredictionSettings) => {
    const result = await endpoints[predictionSettings.endpoint ?? defaultEndpoint].chat.completions.create({
        model: predictionSettings.model,
        temperature: predictionSettings.temperature,
        max_tokens: 2, // A1-C2 can be expressed in max 2 tokens
        messages: [
            {
                role: 'system',
                // content: 'Du bist ein assistent um vom Nutzer gegebene Texte innerhalb des CEFR (Common European Framework of Reference for Languages) zu klassifizieren. Antworte dem Nutzer immer NUR das CEFR-Level des gegebenen Textes.'
                // content: 'Classify the language level of a given text according to the Common European Framework of Reference for Languages (CEFR). Respond with only the corresponding CEFR level (A1, A2, B1, B2, C1, or C2).'
                content: predictionSettings.systemPrompt
            },
            {
                role: 'user',
                content: predictionSettings.text
            }
        ],
    });
    try {
        const prediction = result.choices[0].message.content?.trim() as CEFRLevel;
        if (possibleLevels.includes(prediction)) {
            return prediction;
        } else {
            console.error(`[W] Invalid prediction: "${prediction}"`);
            return CEFRLevel.Error;
        }
    } catch (error) {
        console.error(`[E] Error during prediction: ${error}`);
        return CEFRLevel.Error;
    }
}