import { Database } from "bun:sqlite";
import { writeFileSync } from 'fs';

const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const examplesPerLevel = 5;

export const exportSamples = async () => {
  const db = new Database("../main.db");

  let samples = [];

  cefrLevels.forEach(level => {
    const texts = db.prepare(`SELECT * FROM texts WHERE cefrLevel = ? ORDER BY RANDOM() LIMIT ${examplesPerLevel}`).all(level);
    samples.push(...texts.map(text => ({
      cefrLevel: text.cefrLevel,
      text: text.content.replace(/\n/g, ' ').trim() //
    })));
  });


  const samplesContent = samples.map(sample => JSON.stringify(sample)).join('\n');
  writeFileSync('../german_cefr_samples.json', samplesContent);

  console.log('Created JSON file with CEFR samples');

  console.log('\nCEFR level distribution:');
  cefrLevels.forEach(level => {
    const count = samples.filter(sample => sample.cefrLevel === level).length;
    console.log(`${level}: ${count} samples`);
  });
}