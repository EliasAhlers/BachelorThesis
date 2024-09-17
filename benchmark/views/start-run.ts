import { readFileSync, writeFileSync } from 'fs';
import type { Model } from '../src/models';
import { runBenchmark } from '../src/benchmark';
import { currentStatus } from '../src';

export const startRun = (req: Request): Response => {
    const promptFile = readFileSync('./prompt.txt', 'utf-8');
    const prompt = promptFile == '' ? 'Bewerte die Sprachkenntnisse des bereitgestellten deutschen Textes gemäß dem Gemeinsamen Europäischen Referenzrahmen für Sprachen (GER/CEFR). Antworte NUR mit der entsprechenden Stufe: A1, A2, B1, B2, C1 oder C2, NICHT MEHR. Gebe auch *keine* Begründung!' : promptFile;

    // http://localhost:81/start-run/?model=QuantFactory/Meta-Llama-3-8B-Instruct-GGUF&temperature=0&numberOfRuns=1&sampleSize=30&systemPrompt=ABC
    const model = req.url.split('model=')[1].split('&')[0];
    const temperature = parseFloat(req.url.split('temperature=')[1].split('&')[0]);
    const systemPrompt = req.url.split('systemPrompt=')[1];
    const numberOfRuns = parseInt(req.url.split('numberOfRuns=')[1].split('&')[0]);
    const sampleSize = parseInt(req.url.split('sampleSize=')[1].split('&')[0]);

    setTimeout(async () => {
        try {
            const benchmarkReport = await runBenchmark(model as Model, systemPrompt == '' ? prompt : systemPrompt, temperature, sampleSize, numberOfRuns);
            console.log(`[I] Benchmark completed with accuracy ${benchmarkReport.completeEvaluation.accuracy} and group accuracy: ${benchmarkReport.completeEvaluation.groupAccuracy}`);
        } catch (e) {
            console.error(e);
            currentStatus.running = false;
        }
    }, 1);
    let template = `Starting run with model ${model}, temperature ${temperature}, number of runs ${numberOfRuns}, sample size ${sampleSize} and system prompt ${systemPrompt}`;
    template += `<br><br><a href="http://localhost:81/">Back to main</a>`;
    return new Response(readFileSync('views/template.html', 'utf-8').replace('{{template}}', template),
        { headers: { 'Content-Type': 'text/html' } });
};