/*
Exports the run accuracy and group accuracy to a CSV file.
*/

import { readdirSync, readFileSync, writeFileSync } from 'fs';

const files = readdirSync('./runs');

const evaluations: { file: string, accuracy: number, groupAccuracy: number }[] = [];

files.forEach((file) => {
    try {
        const content = readFileSync(`./runs/${file}`, 'utf-8');
        const parsed = JSON.parse(content);
        const evaluation = parsed.completeEvaluation;
        evaluations.push({accuracy: evaluation.accuracy, groupAccuracy: evaluation.groupAccuracy, file});
        console.log(`evaluation for ${file}: ${JSON.stringify(evaluation, null, 2)}`);
    } catch (error) {
        console.log(`error parsing ${file}: ${error}`);
        return;
    }
});

const evaltuationCSV = evaluations.map(({file, accuracy, groupAccuracy}) => `${file},${accuracy},${groupAccuracy}`).join('\n');
console.log(evaltuationCSV);
writeFileSync('./evaluation.csv', evaltuationCSV);