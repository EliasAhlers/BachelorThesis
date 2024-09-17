import { Database } from "bun:sqlite";
import { writeFileSync, readFileSync } from 'fs';
import { EOL } from 'os';

const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const testAmount = 15;

export const createGeminiFinetuneData = async () => {
  const db = new Database("../main.db");

  // Get texts for each CEFR level
  const levelTexts = {};
  cefrLevels.forEach(level => {
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

  // Create CSV content
  const createCSVContent = (texts) => {
    let content = `input:,output:${EOL}`;
    texts.forEach(text => {
      // Remove all types of newlines and escape double quotes in the content
      const escapedContent = text.content.replace(/\r?\n|\r/g, ' ').replace(/"/g, '""');
      content += `"${escapedContent}","${text.cefrLevel}"${EOL}`;
    });
    return content;
  };

  // Write CSV files
  writeFileSync('../gemini_german_cefr_train.csv', createCSVContent(trainingTexts).trim());
  writeFileSync('../gemini_german_cefr_test.csv', createCSVContent(testTexts).trim());
  
  console.log('Created CSV files: gemini_german_cefr_train.csv and gemini_german_cefr_test.csv');

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