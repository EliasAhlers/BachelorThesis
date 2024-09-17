//@ts-ignore
import { Database } from "bun:sqlite";
import { CEFRLevel } from ".";
import * as fs from 'fs';

const db = new Database("../data/main.db");

interface LengthStats {
  average: number;
  minimum: number;
  maximum: number;
  median: number;
  standardDeviation: number;  // Changed from variance to standardDeviation
}

const getLevelData = (level: CEFRLevel): any[] => {
  return db.query(`SELECT * FROM texts WHERE cefrLevel IS "${level}"`).values().map((data: any) => {
    return { id: data[0], content: data[1], cefrLevel: data[2] };
  });
};

const analyzeSampleLengths = (level: CEFRLevel): LengthStats => {
  const data = getLevelData(level);
  const lengths = data.map((sample: any) => sample.content.length);
  
  const average = lengths.reduce((sum: number, length: number) => sum + length, 0) / lengths.length;
  const minimum = Math.min(...lengths);
  const maximum = Math.max(...lengths);
  const median = calculateMedian(lengths);
  const standardDeviation = calculateStandardDeviation(lengths, average);  // Changed to standard deviation
  
  return { average, minimum, maximum, median, standardDeviation };
};

const calculateMedian = (numbers: number[]): number => {
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  } else {
    return sorted[middle];
  }
};

// Changed function to calculate standard deviation
const calculateStandardDeviation = (numbers: number[], mean: number): number => {
  const squaredDifferences = numbers.map(num => Math.pow(num - mean, 2));
  const averageSquaredDifference = squaredDifferences.reduce((sum, squaredDiff) => sum + squaredDiff, 0) / numbers.length;
  return Math.sqrt(averageSquaredDifference);
};

// Example usage for all levels, skipping the "Error" level
const levels = Object.values(CEFRLevel).filter(level => level !== CEFRLevel.Error);
const results: { [key: string]: LengthStats } = {};

levels.forEach(level => {
  const stats = analyzeSampleLengths(level);
  results[level] = stats;
});

fs.writeFileSync('results.json', JSON.stringify(results, null, 2));
console.log('Results written to results.json');
process.exit(0);