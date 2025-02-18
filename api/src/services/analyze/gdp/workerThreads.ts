/**
 * Case: Worker Threads
 */

import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import path from "path";
import utils from "../utils";
import {WorkerResult} from "@types/utils";

// Main thread code
const analyzeWithWorkers = async (data: any[]) => {
  if (!isMainThread) {
    throw new Error("This function should only be called from the main thread");
  }

  const numWorkers = Math.min(10, data.length);
  const chunks = utils.splitIntoChunks(data, numWorkers);

  const workers = chunks.map((chunk, index) => {
    return new Promise<WorkerResult>((resolve, reject) => {
      const worker = new Worker(path.resolve(__dirname, "worker.ts"), {
        workerData: { chunk, workerId: index },
      });

      worker.on("message", (result: WorkerResult) => {
        worker.terminate(); // Clean up worker after completion
        resolve(result);
      });

      worker.on("error", reject);
      worker.on("exit", (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  });

  const results = await Promise.all(workers);
  return utils.combineResults(results);
};

export default { analyzeWithWorkers };
