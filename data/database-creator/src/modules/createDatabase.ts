import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { Database } from "bun:sqlite";
import { readFile, utils } from 'xlsx';

const db = new Database("../main.db");

const processMerlin = async () => {
    const files = readdirSync('../datasets/merlin/merlin-text-v1.1/meta_ltext/german/').filter(file => file.endsWith('.txt'));
    files.forEach(file => {
        const fileContent = readFileSync(`../datasets/merlin/merlin-text-v1.1/meta_ltext/german/${file}`, 'utf8');
        const metaDataRaw = fileContent.split('Learner text:')[0].split('General:\r')[1];
        const metaData = metaDataRaw.split('\n').map(data => data.split(': ').map(d => d.trim())).filter(data => data.length == 2);
        const text = fileContent.split('Learner text:')[1].trim();
        const cefrLevel = metaData.find(data => data[0] === 'Overall CEFR rating')!;
        const learnerLevel = metaData.find(data => data[0] === 'CEFR level of test')!;
        db.run(
            `INSERT INTO texts (content, cefrLevel, learnerLevel) VALUES (?, ?, ?)`,
            [text, cefrLevel[1], learnerLevel[1]],
        );
    });
};

const processFalko = async () => {
    // Essay L2
    const files = readdirSync('../datasets/falko/L2').filter(file => file.endsWith('.txt'));
    const metadataFile = readFile('../datasets/falko/metadata.xlsx');
    const dataArray = utils.sheet_to_json(metadataFile.Sheets[metadataFile.SheetNames[0]]);
    dataArray.forEach((data: any) => {
        const matchingFile = files.find((file: string) => file.startsWith(data['transcriptionName']));
        const fileContent = readFileSync(`../datasets/falko/L2/${matchingFile}`, 'utf8');
        db.run(
            `INSERT INTO texts (content, cefrLevel) VALUES (?, ?)`,
            [fileContent, mapScore(data['ctest'])],
        );
    });
    // Summary L1 - only native speakers
    const files2 = readdirSync('../datasets/falko/summaryL1').filter(file => file.endsWith('.txt'));
    files2.forEach(file => {
        const fileContent = readFileSync(`../datasets/falko/summaryL1/${file}`, 'utf8');
        db.run(
            `INSERT INTO texts (content, cefrLevel, learnerLevel) VALUES (?, ?, ?)`,
            [fileContent, 'C2', 'C2'],
        );
    });
    // Summary L2 - unsure but probably C1-C2
    const files3 = readdirSync('../datasets/falko/summaryL2').filter(file => file.endsWith('.txt'));
    files3.forEach(file => {
        const fileContent = readFileSync(`../datasets/falko/summaryL2/${file}`, 'utf8');
        db.run(
            `INSERT INTO texts (content, cefrLevel, learnerLevel) VALUES (?, ?, ?)`,
            [fileContent, 'C1-C2', 'C1-C2'],
        );
    });
};

const processSynthetic = async () => {
    const files = readdirSync('../datasets/synthetic/A1/').filter(file => file.endsWith('.txt'));
    files.forEach(file => {
        const fileContent = readFileSync(`../datasets/synthetic/A1/${file}`, 'utf8');
        db.run(
            `INSERT INTO texts (content, cefrLevel) VALUES (?, ?)`,
            [fileContent, 'A1'],
        );
    });
}

const mapScore = (score: number) => {
    // 60 - 79 B2
    // 80 - 89 C1
    // 90 - 100 C2
    return (score < 79 ? 'B2' : score < 89 ? 'C1' : 'C2');
};


export const createDatabase = async () => {
    console.log('Creating database...');
    console.log('Processing Merlin dataset...');
    processMerlin();
    console.log('Processing falko dataset...');
    processFalko();
    console.log('Processing synthetic dataset...');
    processSynthetic();
};
