import { Server, Socket } from "socket.io";
import eventHandlers from "@/routes/socketEventRouter";

class SocketService {
  private io: Server | null = null;

  initialize(httpServer: unknown) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      pingTimeout: 60000, // 60 seconds
      pingInterval: 25000, // 25 seconds
    });

    console.log("[SOCKET.IO]: Initialized");

    this.io.on("connection", this.handleConnection.bind(this));
  }

  private handleConnection(socket: Socket) {
    console.log(`Client connected: ${socket.id}`);

    // Handle connection event first
    if (eventHandlers.connect) {
      eventHandlers.connect(socket, null);
    }

    // Set up event handlers
    for (const [event, handler] of Object.entries(eventHandlers)) {
      if (event !== 'connect') { // Skip connect as it's already handled
        socket.on(event, (data) => handler(socket, data));
      }
    }

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      // Clean up any subscriptions
      if (socket.data.cpuUnsubscribe) {
        socket.data.cpuUnsubscribe();
      }
    });

    // Error handling
    socket.on("error", (error) => {
      console.error(`Socket error for client ${socket.id}:`, error);
    });
  }

  sendToClient(socketId: string, event: string, message: unknown) {
    const socket = this.io?.sockets.sockets.get(socketId);
    if (socket) {
      socket.emit(event, message);
    }
  }

  broadcast(event: string, message: unknown) {
    this.io?.emit(event, message);
  }
}

export const socketService = new SocketService();