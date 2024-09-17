import { renderMain } from '../views/main';
import { renderRun } from '../views/run';
import { startRun } from '../views/start-run';
import { startSingleEvaluation } from "../views/start-single-evaluation";
import { Model } from './models';

export enum CEFRLevel {
    A1 = 'A1',
    A2 = 'A2',
    B1 = 'B1',
    B2 = 'B2',
    C1 = 'C1',
    C2 = 'C2',
    Error = 'Error',
};

export interface CurrentStatus {
    running: boolean;
    model: Model;
    numberOfRun: number;
    totalNumberOfRuns: number;
    levelOfRun: CEFRLevel;
}

export const currentStatus: CurrentStatus = {
    running: false,
    model: Model.DeepInfra_Llama3_8B,
    numberOfRun: 1,
    totalNumberOfRuns: 1,
    levelOfRun: CEFRLevel.A1,
};

export const debugLogs = process.argv.includes('--debug');

//@ts-ignore
const server = Bun.serve({
    port: 81,
    development: true,
    async fetch(req: Request) {
        if (req.url === 'http://localhost:81/') {
            return renderMain(req);
        } else if (req.url.startsWith('http://localhost:81/run/')) {
            return renderRun(req);
        } else if (req.url.startsWith('http://localhost:81/start-run/')) {
            return startRun(req);
        } else if (req.url.startsWith('http://localhost:81/start-single-evaluation/')) {
            return startSingleEvaluation(req);
        }
    },
});

// const ids = [6, 31, 8, 354, 3, 178, 15, 1, 34, 29];
// const results: string[] = [];
// const db = new Database("../data/main.db");
// for (let id of ids) {
//     db.query(`SELECT * FROM texts WHERE id IS ${id}`).values().map((data: any) => { return { id: data[0], content: data[1], cefrLevel: data[2] } }).forEach(async (element: any) => {
//         results.push(element.cefrLevel + ': ' + element.content.replaceAll('\n', ' '));
//     });
// }
// writeFileSync('./examples.txt', results.join('\n'));


console.log(`run-explorer running on http://localhost:${server.port}`);
