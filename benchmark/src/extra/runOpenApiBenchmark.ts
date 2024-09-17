import fs from 'fs';
import { OpenAI } from 'openai';

// Enums and Interfaces
enum CEFRLevel {
    A1 = 'A1',
    A2 = 'A2',
    B1 = 'B1',
    B2 = 'B2',
    C1 = 'C1',
    C2 = 'C2',
    Error = 'Error',
}

interface BenchmarkResult {
    id: number;
    content: string;
    predictedLevel: CEFRLevel;
}

interface BenchmarkReport {
    model: string;
    systemPrompt: string;
    temperature: number;
    results: BenchmarkResult[];
    evaluation: {
        correct: number;
        incorrect: number;
        accuracy: number;
        groupCorrect: number;
        groupIncorrect: number;
        groupAccuracy: number;
    };
}

// Configuration
const MODEL = 'ft:gpt-4o-mini-2024-07-18:personal:german-cefr-tuned-1:9xbPMg8I';
const TEMPERATURE = 0;
const INPUT_FILE = '../data/openai_german_cefr_test.jsonl';
const OUTPUT_FILE = 'benchmark_report.json';


const openai = new OpenAI({
    apiKey: 'API key',
    baseURL: 'https://api.openai.com/v1',
});

const isLevelInSameGroup = (level: CEFRLevel, target: CEFRLevel): boolean => {
    const levelOrder = Object.values(CEFRLevel);
    const levelIndex = levelOrder.indexOf(level);
    const targetIndex = levelOrder.indexOf(target);
    return Math.abs(levelIndex - targetIndex) <= 1;
};

async function generatePrediction(systemPrompt: string, content: string): Promise<CEFRLevel> {
    try {
        const response = await openai.chat.completions.create({
            model: MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: content }
            ],
            temperature: TEMPERATURE,
        });

        const prediction = response.choices[0]?.message?.content?.trim();
        return prediction as CEFRLevel || CEFRLevel.Error;
    } catch (error) {
        console.error('Error generating prediction:', error);
        process.exit(1);
        return CEFRLevel.Error;
    }
}

async function runBenchmark(): Promise<void> {

    const content = fs.readFileSync(INPUT_FILE, 'utf-8').split('\n');

    const report: BenchmarkReport = {
        model: MODEL,
        systemPrompt: '',
        temperature: TEMPERATURE,
        results: [],
        evaluation: {
            correct: 0,
            incorrect: 0,
            accuracy: 0,
            groupCorrect: 0,
            groupIncorrect: 0,
            groupAccuracy: 0,
        },
    };

    let id = 0;
    for (const line of content) {
        const jsonData = JSON.parse(line);
        const systemPrompt = jsonData.messages[0].content;
        const message = jsonData.messages[1].content;
        const expectedLevel = jsonData.messages[2].content as CEFRLevel;

        if (!report.systemPrompt) {
            report.systemPrompt = systemPrompt;
        }

        console.log(`Running benchmark for message: ${message.slice(0, 30)}`);
        const predictedLevel = await generatePrediction(systemPrompt, message);
        console.log(`Predicted level: ${predictedLevel} - Expected level: ${expectedLevel}`);
        
        report.results.push({
            id: id++,
            content: message,
            predictedLevel,
        });

        if (predictedLevel === expectedLevel) {
            report.evaluation.correct++;
        } else {
            report.evaluation.incorrect++;
        }

        if (isLevelInSameGroup(predictedLevel, expectedLevel)) {
            report.evaluation.groupCorrect++;
        } else {
            report.evaluation.groupIncorrect++;
        }

    }

    const total = report.evaluation.correct + report.evaluation.incorrect;
    report.evaluation.accuracy = total > 0 ? report.evaluation.correct / total : 0;
    const totalGroup = report.evaluation.groupCorrect + report.evaluation.groupIncorrect;
    report.evaluation.groupAccuracy = totalGroup > 0 ? report.evaluation.groupCorrect / totalGroup : 0;

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));
    console.log(`Benchmark completed. Results written to ${OUTPUT_FILE}`);
}

runBenchmark().catch(console.error);