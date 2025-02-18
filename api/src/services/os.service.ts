import si from "systeminformation";
import Redis from "ioredis";
import { socketService } from "@/modules/socketService";
import type { CPUData, ChartData } from "@types/os";
import {CPUChartData} from "@types/os";

export class OSService {
  private static instance: OSService;
  private redis: Redis;
  private readonly CPU_DATA_KEY = "cpu:usage:";
  private readonly DATA_TTL = 24 * 60 * 60; // 24 hours in seconds
  private readonly COLORS = [
    "rgba(255, 99, 132, 0.5)",
    "rgba(54, 162, 235, 0.5)",
    "rgba(255, 206, 86, 0.5)",
    "rgba(75, 192, 192, 0.5)",
    "rgba(153, 102, 255, 0.5)",
    "rgba(255, 159, 64, 0.5)",
    "rgba(199, 199, 199, 0.5)",
    "rgba(83, 102, 255, 0.5)",
    "rgba(40, 159, 64, 0.5)",
    "rgba(210, 199, 199, 0.5)",
  ];

  private constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
    });
    this.startCPUMonitoring();
  }

  public static getInstance(): OSService {
    if (!OSService.instance) {
      OSService.instance = new OSService();
    }
    return OSService.instance;
  }

  private async startCPUMonitoring() {
    console.log("START MONITORING");

    setInterval(async () => {
      const cpuData = await this.getCurrentCPULoad();
      const timestamp = Date.now();

      await this.storeCPUData(timestamp, cpuData);
      socketService.broadcast("cpu-update", { timestamp, ...cpuData });
    }, 1000);
  }

  private async getCurrentCPULoad() {
    const load = await si.currentLoad();
    return {
      currentLoad: load.currentLoad,
      avgLoad: load.avgLoad,
      cores: load.cpus.map((cpu) => ({
        load: cpu.load,
      })),
    };
  }

  private async storeCPUData(timestamp: number, data: any) {
    const key = `${this.CPU_DATA_KEY}${timestamp}`;
    await this.redis.setex(key, this.DATA_TTL, JSON.stringify(data));
  }

  public async getHistoricalData(
    startTime?: number,
    endTime?: number,
    aggregation: "raw" | "1m" | "5m" | "1h" = "raw"
  ) {
    const keys = await this.redis.keys(`${this.CPU_DATA_KEY}*`);

    // If no time range provided, return limited recent data
    if (!startTime && !endTime) {
      // Get last hour of data by default
      startTime = Date.now() - 60 * 1000;
      endTime = Date.now();
    }

    const filteredKeys = keys
      .filter((key) => {
        const timestamp = parseInt(key.replace(this.CPU_DATA_KEY, ""));
        return (
          timestamp >= (startTime || 0) && timestamp <= (endTime || Date.now())
        );
      })
      .sort((a, b) => {
        // Ensure chronological order
        return (
          parseInt(a.replace(this.CPU_DATA_KEY, "")) -
          parseInt(b.replace(this.CPU_DATA_KEY, ""))
        );
      });

    const data = await Promise.all(
      filteredKeys.map(async (key) => {
        const value = await this.redis.get(key);
        const timestamp = parseInt(key.replace(this.CPU_DATA_KEY, ""));
        return {
          timestamp,
          ...JSON.parse(value || "{}"),
        };
      })
    );

    const aggregatedData = this.aggregateData(data, aggregation);
    return this.formatForChartJS(aggregatedData);
  }

  private aggregateData(
    data: CPUData[],
    aggregation: "raw" | "1m" | "5m" | "1h"
  ) {
    if (aggregation === "raw") return data;

    const intervalMap = {
      "1m": 60 * 1000,
      "5m": 5 * 60 * 1000,
      "1h": 60 * 60 * 1000,
    };

    const interval = intervalMap[aggregation];
    const aggregated: { [key: number]: CPUData[] } = {};

    data.forEach((item) => {
      const timeSlot = Math.floor(item.timestamp / interval) * interval;
      if (!aggregated[timeSlot]) {
        aggregated[timeSlot] = [];
      }
      aggregated[timeSlot].push(item);
    });

    return Object.entries(aggregated).map(([timeSlot, items]) => ({
      timestamp: parseInt(timeSlot),
      currentLoad:
        items.reduce((sum, item) => sum + item.currentLoad, 0) / items.length,
      avgLoad:
        items.reduce((sum, item) => sum + item.avgLoad, 0) / items.length,
      cores: items[0].cores.map((_: any, index: number) => ({
        load:
          items.reduce((sum, item) => sum + item.cores[index].load, 0) /
          items.length,
      })),
    }));
  }

  private formatForChartJS(data: CPUData[]): CPUChartData
   {
    if (!data.length) {
      return {
        overall: { labels: [], datasets: [] },
        cores: { labels: [], datasets: [] },
      };
    }

    // Format timestamps for labels with seconds
    const labels = data.map((item) =>
      new Date(item.timestamp).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );

    // Overall CPU load chart data
    const overall = {
      labels,
      datasets: [
        {
          label: "Current Load",
          data: data.map((item) => item.currentLoad),
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Average Load",
          data: data.map((item) => item.avgLoad),
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
          fill: true,
          tension: 0.4,
        },
      ],
    };

    // Per-core CPU load chart data
    const cores = {
      labels,
      datasets: data[0].cores.map((_, index) => ({
        label: `Core ${index + 1}`,
        data: data.map((item) => item.cores[index].load),
        borderColor: this.COLORS[index].replace("0.5", "1"),
        backgroundColor: this.COLORS[index],
        fill: true,
        tension: 0.4,
      })),
    };

    return { overall, cores };
  }
}

export default OSService.getInstance();
