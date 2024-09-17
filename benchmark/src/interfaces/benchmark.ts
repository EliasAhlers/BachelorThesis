import type { CEFRLevel } from "..";
import type { Model } from "../models";

export interface BenchmarkReport {
    model: Model;
    systemPrompt: string;
    temperature: number;
    runs: BenchmarkRun[];
    runAccuracies: number[];
    completeEvaluation: Evaluation;
    aborted: boolean;
    abortReason: string;
};

export interface BenchmarkRun {
    results: BenchmarkSingleResult[];
    evaluation: Evaluation;
    aborted?: boolean;
    abortReason?: string;
};

interface Evaluation {
    correct: number;
    incorrect: number;
    accuracy: number;
    groupCorrect: number;
    groupIncorrect: number;
    groupAccuracy: number;
}


export interface BenchmarkSingleResult {
    id: number;
    content: string;
    cefrLevel: CEFRLevel;
    predictedLevel: CEFRLevel;
}