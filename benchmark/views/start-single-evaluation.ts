import { generatePrediction } from "../src/provider/openai-api";

export const startSingleEvaluation = async (req: Request): Promise<Response> => {
    const text = req.url.split('?text=')[1];
    // generate prediction
    const result = await generatePrediction({ ...predictionSettings, text: data.content.replaceAll('\n', ' ') });

    return new Response('Single evaluation started');
}