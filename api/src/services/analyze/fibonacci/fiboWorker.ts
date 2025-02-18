import {unlink, writeFile} from "fs/promises";
import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const analyze = async (numCalc: number = 200, numCores: number = 2) => {
    const startTime = performance.now();
    const chunkSize = Math.ceil(numCalc / numCores);
    const workers = [];

    // Worker code in separate file: worker.js
    const workerCode = `
        import { parentPort, workerData } from 'worker_threads';

        function calculateFib(n) {
            if (n <= 1) return n;
            return calculateFib(n - 1) + calculateFib(n - 2);
        }

        const { start, end } = workerData;
        let sum = 0;
        
        for (let i = start; i < end; i++) {
            sum += calculateFib(i);
        }
        
        parentPort.postMessage(sum);
    `;

    // Create a temporary code file
    await writeFile('worker.js', workerCode);

    for (let i = 0; i < numCores; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, numCalc);

        workers.push(new Promise((resolve, reject) => {
            const worker = new Worker('./worker.js', {
                workerData: { start, end },
                type: 'module'
            });

            worker.on('message', resolve);
            worker.on('error', reject);
            worker.on('exit', (code) => {
                if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
            });
        }));

        console.log('FIBO WORKERS: ', workers)
    }

    const results = await Promise.all(workers);
    const sum = results.reduce((acc, curr) => acc + curr, 0);
    const endTime = performance.now();

    // Cleanup
    await unlink('worker.js');

    return {
        result: sum,
        timeMs: endTime - startTime
    };
}

export default {
    analyze
}