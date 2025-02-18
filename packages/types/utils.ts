export interface WorkerResult {
  workerId: number;
  avgInflation: number;
  maxInflation: number;
  minInflation: number;
  processedRecords: number;
}

export interface CombinedResults {
  overallStats: {
    avgInflation: number;
    maxInflation: number;
    minInflation: number;
    totalProcessedRecords: number;
  };
  workerResults: WorkerResult[];
}

export type AnalyzerMode = 'async' | 'worker' | 'child' | 'fibo_async_bad' | 'fibo_async_good' | 'fibo_child' | 'fibo_worker' | 'fibo_compare'
export type AnalyzerCategory = 'fibo' | 'gdp'
export interface AnalyzerBodyRequest {
  mode: AnalyzerMode
  cores?: number
  numCalc?: number
}