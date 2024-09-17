import { Database } from "bun:sqlite";
import { writeFileSync, readFileSync } from 'fs';
import inquirer from 'inquirer';

const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const testAmount = 15;
const LLaMA3 = 'LLaMA3';
const Phi3 = 'Phi3';

export const createJSON = async () => {
	const result = await inquirer.prompt([
		{
			type: 'list',
			name: 'model',
			message: 'Which model format do you want to use?',
			choices: [LLaMA3, Phi3],
		}
	]);

	const db = new Database("../main.db");
	const prompt = readFileSync('../../benchmark/prompt.txt', 'utf8');

	// Get texts for each CEFR level
	const levelTexts = {};
	cefrLevels.forEach(level => {
		levelTexts[level] = db.prepare(`SELECT * FROM texts WHERE cefrLevel = ? ORDER BY RANDOM()`).all(level);
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

	const createEntry = (text, modelType) => {
		switch (modelType) {
			case LLaMA3:
				return JSON.stringify({
					cefrLevel: text.cefrLevel,
					text: text.content,
					prompt: `<|start_header_id|>system<|end_header_id|>${prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>${text.content}<|eot_id|><|start_header_id|>assistant<|end_header_id|>${text.cefrLevel}<|eot_id|>`,
				}) + '\n';
			case Phi3:
				return JSON.stringify({
					cefrLevel: text.cefrLevel,
					text: text.content,
					prompt: `<|system|>
${prompt}<|end|>
<|user|>
${text.content}<|end|>
<|assistant|>${text.cefrLevel}<|end|>`,
				}) + '\n';
			default:
				console.log('Model not supported');
				process.exit(1);
		}
	};

	const trainingContent = trainingTexts.map(text => createEntry(text, result.model)).join('');
	const testContent = testTexts.map(text => createEntry(text, result.model)).join('');

	writeFileSync('../german_cefr_training.json', trainingContent.trimEnd());
	writeFileSync('../german_cefr_test.json', testContent.trimEnd());

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