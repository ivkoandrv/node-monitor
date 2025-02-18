<script setup lang="ts">
import { computed } from "vue";
import { LineChart } from "vue-chart-3";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LineController,
} from "chart.js";
import type { CPUChartData } from "@types/os";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend
);

const props = defineProps<{
  chartData: CPUChartData;
}>();

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 0,
  },
  transitions: {
    active: {
      animation: {
        duration: 0,
      },
    },
  },
  interaction: {
    intersect: false,
    mode: "index",
  },
  elements: {
    line: {
      tension: 0,
      borderWidth: 2,
      stepped: false,
      cubicInterpolationMode: "monotone",
      segment: {
        borderColor: (ctx) => {
          if (ctx.p1.parsed.y > ctx.p0.parsed.y) {
            return "rgb(75, 192, 192)";
          }
          return "rgb(255, 99, 132)";
        },
      },
      borderJoinStyle: "miter",
    },
    point: {
      radius: 0,
      hitRadius: 10,
      hoverRadius: 4,
      borderWidth: 2,
    },
  },
  scales: {
    y: {
      min: 0,
      max: 100,
      ticks: {
        callback: (value: number) => `${value}%`,
      },
      grid: {
        color: "rgba(0, 0, 0, 0.05)",
        drawBorder: false,
      },
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        maxRotation: 0,
        maxTicksLimit: 6,
        align: "inner",
      },
    },
  },
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "CPU Usage",
    },
  },
};

const overallChartData = computed(() => ({
  labels: props.chartData.overall.labels,
  datasets: props.chartData.overall.datasets,
}));

const coreChartData = computed(() => ({
  labels: props.chartData.cores.labels,
  datasets: props.chartData.cores.datasets,
}));
</script>

<template>
  <div class="charts-container space-y-6">
    <!-- Overall CPU Usage -->
    <div class="chart-wrapper mb-8">
      <h3 class="text-lg font-semibold mb-2">Overall CPU Usage</h3>
      <div class="h-[400px]">
        <LineChart :chart-data="overallChartData" :options="chartOptions" />
      </div>
    </div>

    <!-- Individual Core Usage -->
    <div class="chart-wrapper">
      <h3 class="text-lg font-semibold mb-2">CPU Cores Usage</h3>
      <div class="h-[400px]">
        <LineChart :chart-data="coreChartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.charts-container {
  padding: 1rem;
}

.chart-wrapper {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
