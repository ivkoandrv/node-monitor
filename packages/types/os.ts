export interface CPUData {
  timestamp: number;
  currentLoad: number;
  avgLoad: number;
  cores: { load: number }[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  fill: boolean;
  tension: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface CPUChartData {
  overall: ChartData;
  cores: ChartData;
}
