import { origin } from "bun";
import { Database } from "bun:sqlite";
import { writeFileSync } from 'fs';

const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
type CEFRLevel = typeof cefrLevels[number];

interface Transformation {
    id: number;
    original_level: CEFRLevel;
    target_level: CEFRLevel;
    original_text: string;
    target_text: string;
    content_preserved: number;
    original_text_id: number;
}

const minSamplesPerPair = 5;
const maxSamplesPerPair = 30;
const testRatio = 0.2;

export const createTransferJSON = async () => {
    const db = new Database("../main.db");

    const transformations: Transformation[] = db.prepare(`
        SELECT * FROM transformations3
        WHERE content_preserved = 1
        AND original_level != target_level
    `).all() as Transformation[];

    // Group transformations by original text ID
    const groupedByOriginalId: Record<number, Transformation[]> = {};
    transformations.forEach(t => {
        if (!groupedByOriginalId[t.original_text_id]) groupedByOriginalId[t.original_text_id] = [];
        groupedByOriginalId[t.original_text_id].push(t);
    });

    // Create bidirectional groups
    const bidirectionalGroups: Transformation[][] = Object.values(groupedByOriginalId).map(group => {
        return group.sort((a, b) => a.original_level.localeCompare(b.original_level));
    });

    // Group by CEFR level pair
    const groupedByLevelPair: Record<string, Transformation[][]> = {};
    bidirectionalGroups.forEach(group => {
        const key = `${group[0].original_level}->${group[0].target_level}`;
        if (!groupedByLevelPair[key]) groupedByLevelPair[key] = [];
        groupedByLevelPair[key].push(group);
    });

    // Balance the dataset and ensure at least one training sample per level pair
    const balancedTraining: Transformation[] = [];
    const balancedTest: Transformation[] = [];

    Object.entries(groupedByLevelPair).forEach(([key, groups]) => {
        const sampleSize = Math.min(Math.max(groups.length, minSamplesPerPair), maxSamplesPerPair);
        const shuffled = groups.sort(() => 0.5 - Math.random()).slice(0, sampleSize);

        // Ensure at least one sample for training
        balancedTraining.push(...shuffled[0]);

        // Split the rest between training and test
        const remainingForTest = Math.floor((shuffled.length - 1) * testRatio);
        shuffled.slice(1, remainingForTest + 1).forEach(group => balancedTest.push(...group));
        shuffled.slice(remainingForTest + 1).forEach(group => balancedTraining.push(...group));
    });

    // Shuffle the balanced datasets
    balancedTraining.sort(() => 0.5 - Math.random());
    balancedTest.sort(() => 0.5 - Math.random());

    const createEntry = (transformation: Transformation) => {
        const systemPrompt = `Transformiere den gegebenen deutschen Text auf das angegebene CEFR-Niveau, während du die ursprüngliche Bedeutung beibehältst.`;
        const userPrompt = `Übersetze den folgenden deutschen Text auf das CEFR-Sprachniveau ${transformation.target_level}, während du den ursprünglichen Inhalt und die Bedeutung so weit wie möglich beibehältst:
${transformation.original_text}`;
        return JSON.stringify({
            originalLevel: transformation.original_level,
            targetLevel: transformation.target_level,
            originalText: transformation.original_text,
            targetText: transformation.target_text,
            prompt: `<|start_header_id|>system<|end_header_id|>${systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>${userPrompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>${transformation.target_text}<|eot_id|>`,
        }) + '\n';
    };

    const trainingContent = balancedTraining.map(createEntry).join('');
    const testContent = balancedTest.map(createEntry).join('');

    writeFileSync('../german_cefr_transformations_training.json', trainingContent.trimEnd());
    writeFileSync('../german_cefr_transformations_test.json', testContent.trimEnd());
    console.log('Created JSON files');

    console.log('\nDataset statistics:');
    console.log(`Total samples: ${balancedTraining.length + balancedTest.length}`);
    console.log(`Training samples: ${balancedTraining.length}`);
    console.log(`Test samples: ${balancedTest.length}`);

    console.log('\nCEFR level pair distribution:');
    const distribution: Record<string, { total: number, training: number, test: number }> = {};
    [...balancedTraining, ...balancedTest].forEach(t => {
        const key = `${t.original_level}->${t.target_level}`;
        if (!distribution[key]) distribution[key] = { total: 0, training: 0, test: 0 };
        distribution[key].total++;
    });
    balancedTraining.forEach(t => {
        const key = `${t.original_level}->${t.target_level}`;
        distribution[key].training++;
    });
    balancedTest.forEach(t => {
        const key = `${t.original_level}->${t.target_level}`;
        distribution[key].test++;
    });

    const totalSamples = balancedTraining.length + balancedTest.length;
    Object.entries(distribution)
        .sort(([, a], [, b]) => b.total - a.total)
        .forEach(([key, { total, training, test }]) => {
            const percentage = ((total / totalSamples) * 100).toFixed(2);
            console.log(`${key}: ${total} (${percentage}%) - Training: ${training}, Test: ${test}`);
        });
}