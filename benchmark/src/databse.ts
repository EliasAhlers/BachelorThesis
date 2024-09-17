//@ts-ignore
import { Database } from "bun:sqlite";
import { type CEFRLevel } from ".";

const db = new Database("../data/main.db");

export const getLevelData = (level: CEFRLevel, sampleSize: number) => {
    return db.query(`SELECT * FROM texts WHERE cefrLevel IS "${level}" LIMIT ${sampleSize}`).values().map((data: any) => { return { id: data[0], content: data[1], cefrLevel: data[2]}});
}