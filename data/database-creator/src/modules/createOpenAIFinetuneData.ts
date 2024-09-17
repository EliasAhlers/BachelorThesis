import { Database } from "bun:sqlite";
import { writeFileSync, readFileSync } from 'fs';

const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const testAmount = 15;
const LLaMA3 = 'LLaMA3';
const Phi3 = 'Phi3';

export const createOpenAIFinetuneData = async () => {

	const db = new Database("../main.db");
	const prompt = readFileSync('../../benchmark/prompt.txt', 'utf8');

	// Get texts for each CEFR level
	const levelTexts = {};
	cefrLevels.forEach(level => {
		// levelTexts[level] = db.prepare(`SELECT * FROM texts WHERE cefrLevel = ? ORDER BY RANDOM()`).all(level);
		levelTexts[level] = db.prepare(`SELECT * FROM texts WHERE cefrLevel = ?`).all(level);
	});

	// Find the minimum count across all levels
	const minCount = Math.min(...Object.values(levelTexts).map(texts => texts.length));

	let trainingTexts = [];
	let testTexts = [];

	cefrLevels.forEach(level => {
		let texts = levelTexts[level];

		// Ensure we have at least testAmount texts
		while (texts.length < testAmount) {
			texts.push(...texts.slice(0, Math.min(texts.length, testAmount - texts.length)));
		}

		// Add testAmount texts to testTexts
		testTexts.push(...texts.slice(0, testAmount));

		// Use remaining texts for training set, up to minCount - testAmount
		let remainingTexts = texts.slice(testAmount, minCount);
		trainingTexts.push(...remainingTexts);
	});

	// Shuffle training and test sets
	trainingTexts.sort(() => Math.random() - 0.5);
	testTexts.sort(() => Math.random() - 0.5);

	const createEntry = (text) => {
        return JSON.stringify({
            messages: [
                {
                    role: 'system',
                    content: prompt
                },
                {
                    role: 'user',
                    content: text.content
                },
                {
                    role: 'assistant',
                    content: text.cefrLevel
                }
            ]
        });
	};

	const trainingContent = trainingTexts.map(text => createEntry(text)).join('\r\n');
	const testContent = testTexts.map(text => createEntry(text)).join('\r\n');

	writeFileSync('../openai_german_cefr_training.jsonl', trainingContent.trimEnd());
	writeFileSync('../openai_german_cefr_test.jsonl', testContent.trimEnd());

	console.log('Created JSON files');

	// Print statistics
	console.log('\nDataset statistics:');
	console.log(`Total samples: ${trainingTexts.length + testTexts.length}`);
	console.log(`Training samples: ${trainingTexts.length}`);
	console.log(`Test samples: ${testTexts.length}`);
	console.log('\nCEFR level distribution:');
	cefrLevels.forEach(level => {
		const trainCount = trainingTexts.filter(text => text.cefrLevel === level).length;
		const testCount = testTexts.filter(text => text.cefrLevel === level).length;
		console.log(`${level}: ${trainCount} (train), ${testCount} (test)`);
	});
}