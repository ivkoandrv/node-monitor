<script setup lang="ts">
import { onMounted, onUnmounted, watch, ref } from "vue";
import { useSockets } from "@/modules/useSockets";
import CPUCharts from "@/components/CPUCharts.vue";

const {
  isConnected,
  cpuData,
  chartData,
  connect,
  subscribeToCPU,
  unsubscribeFromCPU,
  getCPUHistory,
} = useSockets();

let historyInterval: NodeJS.Timer;
const isMonitoring = ref(true);

const toggleMonitoring = () => {
  isMonitoring.value = !isMonitoring.value;
  if (isMonitoring.value) {
    // Resume monitoring
    subscribeToCPU();
    fetchHistory();
    historyInterval = setInterval(fetchHistory, 1000);
  } else {
    // Stop monitoring
    unsubscribeFromCPU();
    if (historyInterval) {
      clearInterval(historyInterval);
    }
  }
};

const fetchHistory = async () => {
  const endTime = Date.now();
  const startTime = endTime - 30 * 1000;
  await getCPUHistory(startTime, endTime, "raw");
};

onMounted(() => {
  connect();
  fetchHistory();
  historyInterval = setInterval(fetchHistory, 1000);
});

onUnmounted(() => {
  if (historyInterval) {
    clearInterval(historyInterval);
  }
  unsubscribeFromCPU();
});

watch(isConnected, (newValue) => {
  if (newValue) {
    subscribeToCPU();
  }
});
</script>

<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Magic of the Multithreading - CPU monitor</h1>
      <button
        @click="toggleMonitoring"
        class="px-4 py-2 rounded-lg font-medium transition-colors"
        :class="[
          isMonitoring
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-green-500 hover:bg-green-600 text-white',
        ]"
      >
        {{ isMonitoring ? "Stop Monitoring" : "Start Monitoring" }}
      </button>
    </div>

    <!-- Connection Status -->
    <div class="text-sm text-gray-600 mb-4">
      Status: {{ isConnected ? "Connected" : "Disconnected" }}
    </div>

    <div v-if="cpuData" class="mb-4">
      <h2 class="text-xl mb-2">Current Load</h2>
      <p>Average Load: {{ cpuData.avgLoad.toFixed(2) }}%</p>
      <p>Current Load: {{ cpuData.currentLoad.toFixed(2) }}%</p>
    </div>

    <template v-if="chartData">
      <CPUCharts :chart-data="chartData" />
    </template>
  </div>
</template>
