import { fork } from "child_process";
import utils from "@/services/analyze/utils";

const analyzeWithChildProcess = (data: unknown[]) => {
    const numProcess = 4
    const chunks = utils.splitIntoChunks(data, numProcess)

    const processes = chunks.map((chunk, index) => {
        return new Promise((resolve, reject) => {
            const child = fork('./src/services/analyze/gdp/childAnalyzer.js');

            child.send({ chunk, processId: index });
            child.on('message', resolve);
            child.on('error', reject);
        });
    });

    return Promise.all(processes);
}

export default {
    analyzeWithChildProcess,
}