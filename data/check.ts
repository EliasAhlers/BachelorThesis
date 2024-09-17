import { readFileSync } from 'fs';

const trainingData = readFileSync('german_cefr_training.json', 'utf-8');
const testData = readFileSync('german_cefr_test.json', 'utf-8');

const trainingTexts: string[] = [];

trainingData.split('\n').forEach((line, index) => {
    try {
        const obj = JSON.parse(line);
        if (obj.hasOwnProperty('text') && obj.hasOwnProperty('prompt') && obj.hasOwnProperty('cefrLevel')) {
            trainingTexts.push(obj.text);
        } else {
            console.log('Error at line', index + 1, ':', obj);
        }
    } catch (e) {
        console.log('Error at line', index + 1, ':', e);
    }
});

testData.split('\n').forEach((line, index) => {
    try {
        const obj = JSON.parse(line);
        if(trainingTexts.includes(obj.text)) {
            console.error('Error at line', index + 1, ':', 'Text already exists in training data');
            process.exit(1);
        }
    } catch (e) {
        console.log('Error at line', index + 1, ':', e);
    }
});

console.log('Done checking, no errors found');