import { fork } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const analyze = async (numCalc: number = 200, numCores: number = 2) => {
    const startTime = performance.now();
    const chunkSize = Math.ceil(numCalc/ numCores);
    const processes = [];

    const childScript = `
        import { parentPort } from 'worker_threads';

        function calculateFib(n) {
            if (n <= 1) return n;
            return calculateFib(n - 1) + calculateFib(n - 2);
        }

        process.on('message', ({ start, end }) => {
            let sum = 0;
            for (let i = start; i < end; i++) {
                sum += calculateFib(i);
            }
            process.send(sum);
            process.exit(0);
        });
    `;

    // Create a temporary code file
    await writeFile('fib-child.mjs', childScript);

    for (let i = 0; i < numCores; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, numCalc);

        processes.push(new Promise((resolve, reject) => {
            const child = fork('fib-child.mjs', [], { type: 'module' });
            child.send({ start, end });
            child.on('message', resolve);
            child.on('error', reject);
        }));
    }

    const results = await Promise.all(processes);
    const sum = results.reduce((acc, curr) => acc + curr, 0);
    const endTime = performance.now();

    // Cleanup
    await unlink('fib-child.mjs');

    return {
        result: sum,
        timeMs: endTime - startTime
    };
}

export default {
    analyze
}