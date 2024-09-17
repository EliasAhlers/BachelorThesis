import { writeFileSync } from 'fs';
import { EOL } from 'os';
import { CEFRLevel, currentStatus, debugLogs } from ".";
import { getLevelData } from "./databse";
import type { BenchmarkReport, BenchmarkRun } from "./interfaces/benchmark";
import type { Model } from "./models";
import { generatePrediction, type PredictionSettings } from "./provider/openai-api";

const lastThreeClassifications: CEFRLevel[] = [];

export const runBenchmark = async (model: Model, systemPrompt: string, temperature: number, sampleSize: number, numberOfRuns: number): Promise<BenchmarkReport> => {
    // for each CEFR level run benchmark and add to report
    const report: BenchmarkReport = {
        model: model,
        systemPrompt: systemPrompt,
        temperature: temperature,
        runs: [],
        runAccuracies: [],
        completeEvaluation: {
            correct: 0,
            incorrect: 0,
            accuracy: 0,
            groupCorrect: 0,
            groupIncorrect: 0,
            groupAccuracy: 0,
        },
        aborted: false,
        abortReason: '',
    };
    const predictionSettings: PredictionSettings = {
        model: model,
        systemPrompt: systemPrompt,
        text: '',
        temperature: temperature,
        endpoint: 'https://api.deepinfra.com/v1/openai',
        // endpoint: 'http://localhost:1234/v1'
        // endpoint: 'http://localhost:11434/v1'
        // endpoint: 'https://openrouter.ai/api/v1'
        // endpoint: 'https://api.openai.com/v1'
    };
    console.log(`[I] Starting benchmark for model ${model} with temperature ${temperature}`);
    currentStatus.running = true;
    currentStatus.totalNumberOfRuns = numberOfRuns;
    for (let run = 0; run < numberOfRuns; run++) {
        currentStatus.numberOfRun = run + 1;
        console.log(`[I] Starting run ${run + 1} of ${numberOfRuns}`);
        const runReport = await startRun(predictionSettings, sampleSize);
        if(runReport.aborted) {
            report.aborted = true;
            report.abortReason = runReport.abortReason ?? 'Unknown error';
            const now = new Date(Date.now());
            writeFileSync(`./runs/run_${now.toISOString()}.json`, JSON.stringify(report, null, 2));
        }
        report.runs.push(runReport);
        report.completeEvaluation.correct += runReport.evaluation.correct;
        report.completeEvaluation.incorrect += runReport.evaluation.incorrect;
        report.completeEvaluation.groupCorrect += runReport.evaluation.groupCorrect;
        report.completeEvaluation.groupIncorrect += runReport.evaluation.groupIncorrect;
        report.runAccuracies.push(runReport.evaluation.accuracy);
        console.log(`[I] Run ${run + 1} completed with accuracy: ${runReport.evaluation.accuracy} and group accuracy: ${runReport.evaluation.groupAccuracy}`);
    }
    report.completeEvaluation.accuracy = report.completeEvaluation.correct / (report.completeEvaluation.correct + report.completeEvaluation.incorrect);
    report.completeEvaluation.groupAccuracy = report.completeEvaluation.groupCorrect / (report.completeEvaluation.groupCorrect + report.completeEvaluation.groupIncorrect);
    const now = new Date(Date.now());
    writeFileSync(`./runs/run_${now.toISOString()}.json`, JSON.stringify(report, null, 2));
    currentStatus.running = false;
    return report;
};

const startRun = async (predictionSettings: PredictionSettings, sampleSize: number): Promise<BenchmarkRun> => {
    const runResult: BenchmarkRun = {
        results: [],
        evaluation: {
            correct: 0,
            incorrect: 0,
            accuracy: 0,
            groupCorrect: 0,
            groupIncorrect: 0,
            groupAccuracy: 0,
        }
    };
    for (let level of Object.values(CEFRLevel)) {
        if (level === CEFRLevel.Error) continue;
        currentStatus.levelOfRun = level;
        console.log(`[I] Running benchmark for ${level} level`);
        const levelData = getLevelData(level, sampleSize);
        for (let data of levelData) {
            if (debugLogs) console.log(`[D] Running benchmark for text: ${data.content.replaceAll(EOL, ' ')}`);
            const result = await generatePrediction({ ...predictionSettings, text: data.content.replaceAll('\n', ' ') });
            lastThreeClassifications.push(result);
            if (lastThreeClassifications.length > 3) {
                lastThreeClassifications.shift();
            }
            if (lastThreeClassifications.filter((level) => level === CEFRLevel.Error).length == 3) {
                console.error('[E] --- Continuous prediction errors. Stopping benchmark and exiting ---');
                console.log(`[I] Last reported accuracy was ${runResult.evaluation.accuracy}`);
                runResult.aborted = true;
                runResult.abortReason = 'Continuous prediction errors';
                return runResult;
            }
            runResult.results.push({
                id: data.id,
                content: data.content,
                cefrLevel: data.cefrLevel,
                predictedLevel: result,
            });
            if (result === data.cefrLevel) {
                runResult.evaluation.correct++;
            } else {
                runResult.evaluation.incorrect++;
            }
            if (isLevelInSameGroup(result, data.cefrLevel)) {
                runResult.evaluation.groupCorrect++;
            } else {
                runResult.evaluation.groupIncorrect++;
            }
        }
    }
    runResult.evaluation.accuracy = runResult.evaluation.correct / (runResult.evaluation.correct + runResult.evaluation.incorrect);
    runResult.evaluation.groupAccuracy = runResult.evaluation.groupCorrect / (runResult.evaluation.groupCorrect + runResult.evaluation.groupIncorrect);
    return runResult;
};

const isLevelInSameGroup = (level: CEFRLevel, target: CEFRLevel): boolean => {
    const levelOrder = Object.values(CEFRLevel);
    const levelIndex = levelOrder.indexOf(level);
    const targetIndex = levelOrder.indexOf(target);
    return Math.abs(levelIndex - targetIndex) <= 1;
};