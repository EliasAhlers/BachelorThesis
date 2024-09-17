import { readdirSync, readFileSync } from 'fs';
import type { BenchmarkSingleResult } from './interfaces/benchmark.ts';

export const renderRun = (req: Request): Response => {
    const run = req.url.split('/')[4];
    const fileContent = JSON.parse(readFileSync(`runs/${run}`, 'utf-8'));
    let returnContent = '';
    returnContent = `<table><tr>
            <th>file</th>
            <th>model</th>
            <th>number of runs</th>
            <th>sample size</th>
            <th>temperature</th>
            <th>accuracy</th>
            <th>group accuracy</th>
        </tr>`;
    if (!fileContent.runs) return new Response('Run has incomplete data', { status: 400 });
    if (fileContent.aborted) {
        returnContent += `<tr>
            <td>${run}</td>
            <td>${fileContent.model}</td>
            <td></td>
            <td></td>
            <td>${fileContent.temperature}</td>
            <td></td>
            <td></td>
            </tr>`;
        returnContent += `</table></br></br>`;
        returnContent += `<table><tr><th>System prompt</th></tr><tr><td><textarea style="width:99.5%" >${fileContent.systemPrompt}</textarea></td></tr></table></br></br>`;
        returnContent += `<table><tr><td><span style="color: red; font-weight: bold;">Automatically aborted</span></td></tr><tr><td>${fileContent.abortReason}</td></tr></table>`;
        return new Response(readFileSync('views/template.html', 'utf-8').replace('{{template}}', returnContent), { headers: { 'Content-Type': 'text/html' } });
    }
    const accuracy = (fileContent.completeEvaluation?.accuracy ?? fileContent.evaluation?.accuracy).toFixed(4);
    const groupAccuracy = (fileContent.completeEvaluation?.groupAccuracy ?? 0).toFixed(4);
    const numberOfRuns = (fileContent.runAccuracies ?? []).length;
    const sampleSize = fileContent.runs[0].results.length / 6;
    returnContent += `<tr>
        <td>${run}</td>
        <td>${fileContent.model}</td>
        <td>${numberOfRuns}</td>
        <td>${sampleSize}</td>
        <td>${fileContent.temperature}</td>
        <td>${accuracy}</td>
        <td>${groupAccuracy}</td>
        </tr>`;
    returnContent += `</table></br></br>`;
    returnContent += `<table><tr><th>System prompt</th></tr><tr><td><textarea style="width:99.5%" >${fileContent.systemPrompt}</textarea></td></tr></table>`;
    returnContent += `</br></br><table>`;
    const results: BenchmarkSingleResult[] = [];
    fileContent.runs.forEach((run: any, index: number) => {
        results.push(...run.results);
    });

    // Create html confusion matrix table from results
    const confusionMatrix = Array.from({ length: 6 }, () => Array.from({ length: 6 }, () => 0));
    let max = 0;
    results.forEach(result => {
        const actualIndex = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].indexOf(result.cefrLevel);
        const predictedIndex = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].indexOf(result.predictedLevel);
        confusionMatrix[actualIndex][predictedIndex]++;
        max = Math.max(max, confusionMatrix[actualIndex][predictedIndex]);
    });
    console.log(JSON.stringify(confusionMatrix));
    returnContent += '</tr><tr><th></th><th>A1</th><th>A2</th><th>B1</th><th>B2</th><th>C1</th><th>C2</th></tr>';
    for (let i = 0; i < 6; i++) {
        returnContent += `<tr><td>${['A1', 'A2', 'B1', 'B2', 'C1', 'C2'][i]}</td>`;
        for (let j = 0; j < 6; j++) {
            const color = i === j ? 'orange' : 'black';
            returnContent += `<td style="color:${color}; font-weight: bold; background-color: ${generateColor(confusionMatrix[i][j], max)}">${confusionMatrix[i][j]}</td>`;
        }
        returnContent += '</tr>';
    }
    returnContent += '</table></br></br><table>';

    // Calculate precision, recall, and F1 score
    const precision: string[] = [];
    const recall: string[] = [];
    const f1Score: string[] = [];
    for (let i = 0; i < 6; i++) {
        const tp = confusionMatrix[i][i];
        const fp = confusionMatrix.reduce((sum, row) => sum + row[i], 0) - tp;
        const fn = confusionMatrix[i].reduce((sum, val) => sum + val, 0) - tp;
        const precisionValue = tp / (tp + fp) || 0;
        const recallValue = tp / (tp + fn) || 0;
        const f1Value = tp > 0 ? 2 * (precisionValue * recallValue) / (precisionValue + recallValue) : 0;

        precision.push(precisionValue.toFixed(4));
        recall.push(recallValue.toFixed(4));
        f1Score.push(f1Value.toFixed(4));
    }
    returnContent += '<tr><th>Class</th><th>Precision</th><th>Recall</th><th>F1 Score</th></tr>';
    for (let i = 0; i < 6; i++) {
        const precisionColor = Number(precision[i]) < 0.5 ? 'red' : 'black';
        const recallColor = Number(recall[i]) < 0.5 ? 'red' : 'black';
        const f1ScoreColor = Number(f1Score[i]) < 0.5 ? 'red' : 'black';
        returnContent += `<tr><td>${['A1', 'A2', 'B1', 'B2', 'C1', 'C2'][i]}</td><td style="color:${precisionColor}">${precision[i]}</td><td style="color:${recallColor}">${recall[i]}</td><td style="color:${f1ScoreColor}">${f1Score[i]}</td></tr>`;
    }
    returnContent += '</table>';

    return new Response(readFileSync('views/template.html', 'utf-8').replace('{{template}}', returnContent), { headers: { 'Content-Type': 'text/html' } });
};

function generateColor(value: number, maxValue: number): string {
    const clampedValue = Math.max(0, Math.min(value, maxValue));
    const factor = clampedValue / maxValue;
    const maxGreen = 180;
    const r = 255 * (1 - factor);
    const g = 255 - (255 - maxGreen) * factor;
    const b = 255 * (1 - factor);
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}