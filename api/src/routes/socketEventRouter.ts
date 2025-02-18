import { type Socket } from "socket.io";
import osService from "../services/os.service";
import { socketService } from "@/modules/socketService";

const eventHandlers: {
  [event: string]: (
    socket: Socket,
    data: any
  ) => void | Promise<void> | (() => void);
} = {
  connect: (socket: Socket, data: string) => {
    socketService.sendToClient(socket.id, "ping_pong", { ping: data });
  },

  "subscribe:cpu": (socket: Socket) => {
    console.log("Client subscribed to CPU monitoring");
    // No need to return unsubscribe function
    socket.join("cpu-updates"); // Join a room for CPU updates
  },

  "unsubscribe:cpu": (socket: Socket) => {
    console.log("Client unsubscribed from CPU monitoring");
    socket.leave("cpu-updates"); // Leave the CPU updates room
  },

  "get:cpu-history": async (
    socket: Socket,
    data: {
      startTime: number;
      endTime: number;
      aggregation?: "raw" | "1m" | "5m" | "1h";
    }
  ) => {
    const history = await osService.getHistoricalData(
      data.startTime,
      data.endTime,
      data.aggregation
    );
    socket.emit("cpu-history", history);
  },
};

export default eventHandlers;
