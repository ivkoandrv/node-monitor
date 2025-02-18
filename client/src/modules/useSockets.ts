import { ref, onUnmounted } from "vue";
import { io, Socket } from "socket.io-client";
import type { CPUData, CPUChartData } from "../../../packages/types/os";

export function useSockets() {
  const socket = ref<Socket | null>(null);
  const isConnected = ref(false);
  const lastPong = ref<string>("");
  const cpuData = ref<CPUData | null>(null);
  const chartData = ref<{ overall: CPUChartData; cores: CPUChartData } | null>(
    null
  );

  const connect = () => {
    socket.value = io(
      import.meta.env.VITE_NODE_SERVER || "http://localhost:3500",
      {
        transports: ["websocket"],
        autoConnect: true,
      }
    );

    socket.value.on("connect", () => {
      console.log("Connected to server");
      isConnected.value = true;
    });

    socket.value.on("disconnect", () => {
      console.log("Disconnected from server");
      isConnected.value = false;
    });

    socket.value.on("cpu-update", (data: CPUData) => {
      cpuData.value = data;
    });
  };

  // CPU monitoring
  const subscribeToCPU = () => {
    if (!socket.value) return;
    socket.value.emit("subscribe:cpu");
  };

  const unsubscribeFromCPU = () => {
    if (!socket.value) return;
    socket.value.emit("unsubscribe:cpu");
  };

  const getCPUHistory = async (
    startTime: number,
    endTime: number,
    aggregation?: "raw" | "1m" | "5m" | "1h"
  ) => {
    if (!socket.value) return;

    return new Promise((resolve) => {
      socket.value?.emit("get:cpu-history", {
        startTime,
        endTime,
        aggregation,
      });
      socket.value?.once("cpu-history", (data) => {
        chartData.value = data;
        resolve(data);
      });
    });
  };

  // Cleanup on component unmount
  onUnmounted(() => {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
    }
  });

  return {
    isConnected,
    lastPong,
    cpuData,
    chartData,
    connect,
    subscribeToCPU,
    unsubscribeFromCPU,
    getCPUHistory,
  };
}
