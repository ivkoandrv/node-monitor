/**
 * Orchestrate analyzer
 */
import {AnalyzerBodyRequest, AnalyzerCategory, AnalyzerMode} from "@types/utils";
import asyncAwait from "@/services/analyze/gdp/asyncAwait";
import workerThreads from "@/services/analyze/gdp/workerThreads";
import childProcess from "@/services/analyze/gdp/childProcess";
import fibonacci from "@/services/analyze/fibonacci";
import fiboChild from "@/services/analyze/fibonacci/fiboChild";
import fiboWorker from "@/services/analyze/fibonacci/fiboWorker";
import fiboAsync from "@/services/analyze/fibonacci/fiboAsync";

const runAnalyze = async ({mode, numCalc, cores}: AnalyzerBodyRequest) => {

    const dataSets = await import('@/data/sets/inflation_data_gdp.json')

    return await switchModes(dataSets.default, mode, cores, numCalc)

}

const switchModes = async (data: unknown[], mode: AnalyzerMode, numCores: number = 0, numCalc : number = 0) : Promise<unknown> => {

    switch(mode) {
        case "async": {
            const response = await asyncAwait.analyzeWithAsyncAwait(data)
            return response
        }
        case "child" : {
            const response = await childProcess.analyzeWithChildProcess(data)
            return response
        }
        case "worker" : {
            const response = await workerThreads.analyzeWithWorkers(data)
            return response
        }
        case "fibo_async_bad" : {
            const response = await fiboAsync.blocking(numCalc, numCores)
            return response
        }
        case "fibo_async_good" : {
            const response = await fiboAsync.nonBlocking(numCalc, numCores)
            return response
        }
        case "fibo_child" : {
            const response = await fiboChild.analyze(numCalc, numCores)
            return response
        }
        case "fibo_worker" : {
            const response = await fiboWorker.analyze(numCalc, numCores)
            return response
        }
        case "fibo_compare" : {
            const response = await fibonacci.fiboAsync.compare(numCalc, numCores)
            return response
        }

        default : {
            return 'no_mode_specified'
        }
    }

}

export default {
    runAnalyze,
}