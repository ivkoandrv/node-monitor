import { parentPort, workerData } from "worker_threads";

if (!parentPort) {
  throw new Error("This file should be run as a worker thread");
}

const { chunk, workerId } = workerData;

// Process the data chunk
const processChunk = (data: any[]) => {
  const inflationValues = data.map((record) => record.Inflation);

  return {
    workerId,
    avgInflation:
      inflationValues.reduce((sum, val) => sum + val, 0) / data.length,
    maxInflation: Math.max(...inflationValues),
    minInflation: Math.min(...inflationValues),
    processedRecords: data.length,
  };
};

// Send results back to main thread
parentPort.postMessage(processChunk(chunk));
