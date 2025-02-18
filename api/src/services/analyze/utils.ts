/**
 * Utility functions to analyze and combine datasets
 */
import type { WorkerResult, CombinedResults } from "@types/utils";

const splitIntoChunks = <T>(array: T[], numChunks = 2): T[][] => {
  const chunks: T[][] = [];
  const chunkSize = Math.ceil(array.length / numChunks);

  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }

  return chunks;
};

const combineResults = (results: WorkerResult[]): CombinedResults => {
  return {
    overallStats: {
      avgInflation:
        results.reduce((sum, r) => sum + r.avgInflation, 0) / results.length,
      maxInflation: Math.max(...results.map((r) => r.maxInflation)),
      minInflation: Math.min(...results.map((r) => r.minInflation)),
      totalProcessedRecords: results.reduce(
        (sum, r) => sum + r.processedRecords,
        0
      ),
    },
    workerResults: results,
  };
};

const calculateFibonacci = (n: number) => {
  if(n <= 1) return n
  return calculateFibonacci(n - 1) + calculateFibonacci(n - 2)
}

export default { splitIntoChunks, combineResults, calculateFibonacci };
