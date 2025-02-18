import utils from "@/services/analyze/utils";
import fiboWorker from "@/services/analyze/fibonacci/fiboWorker";
import fiboChild from "@/services/analyze/fibonacci/fiboChild";

const blocking = async (numCalc: number, numCores: number) => {
    console.log('RUN BLOCKING FIBO ASYNC: ', [numCalc, numCores]);
    const startTime = performance.now();
    const chunkSize = Math.ceil(numCalc / numCores);
    const results = [];

    for (let i = 0; i < numCores; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, numCalc);
        let sum = 0;

        for (let j = start; j < end; j++) {
            sum += utils.calculateFibonacci(j);
        }
        results.push(sum);
    }

    const sum = results.reduce((acc, curr) => acc + curr, 0);
    const endTime = performance.now();

    return {
        result: sum,
        timeMs: endTime - startTime
    };
}

const compare = async (numCalc: number, numCores: number) => {
    try{
        const workersResult = await fiboWorker.analyze(numCalc, numCores);

        const childProcessResult = await fiboChild.analyze(numCalc, numCores);

        const asyncResult = await nonBlocking(numCalc, numCores);

        return {
            workersResult,
            childProcessResult,
            asyncResult
        }
    }
    catch(err){
        throw new Error(err)
    }
}

const nonBlocking = async (numCalc: number, numCores: number) => {
    const startTime = performance.now();
    const chunkSize = Math.ceil(numCalc / numCores);
    const promises = [];

    const calculateChunk = async (start: number, end: number): Promise<number> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                let sum = 0;
                for (let j = start; j < end; j++) {
                    sum += utils.calculateFibonacci(j);
                }
                resolve(sum);
            }, 0);
        });
    };

    for (let i = 0; i < numCores; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, numCalc);

        console.log('FIBO GOOD:', start, end)
        promises.push(calculateChunk(start, end));
    }

    const results = await Promise.all(promises);
    const sum = results.reduce((acc, curr) => acc + curr, 0);
    const endTime = performance.now();

    return {
        result: sum,
        timeMs: endTime - startTime
    };
}

export default {blocking, nonBlocking, compare}