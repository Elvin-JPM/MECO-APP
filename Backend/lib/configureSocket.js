const socketIo = require("socket.io");
const { pingDevice } = require("../utils/pingUtils");

let ioInstance = null; // Store the io instance here instead of module.exports

function configureSocket(server) {
  const io = socketIo(server, {
    cors: {
      origin: process.env.NODE_ENV === "production" ? "http://10.10.5.40" : "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/socket.io",
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000,
    cookie: false,
    serveClient: false,
  });

  ioInstance = io; // Store the instance

  io.on("connection", (socket) => {
    socket.on("error", (err) => {
      console.error(`Socket error (${socket.id}):`, err);
    });

    socket.on("startPinging", async (ipAddresses) => {
      console.log("Starting ping for IPs:", ipAddresses);

      if (socket.pingIntervalId) {
        clearInterval(socket.pingIntervalId);
      }

      const pingAndSendUpdates = async (ips) => {
        for (const ip of ips) {
          try {
            const result = await pingDevice(ip);
            if (socket.connected) {
              socket.emit("pingUpdate", {
                ip,
                success: result.success,
                message: result.message,
                timestamp: new Date().toISOString(),
              });
            }
          } catch (error) {
            if (socket.connected) {
              socket.emit("pingUpdate", {
                ip,
                success: false,
                message: `Error pinging ${ip}: ${error.message}`,
                timestamp: new Date().toISOString(),
              });
            }
          }
        }
      };

      await pingAndSendUpdates(ipAddresses);

      socket.pingIntervalId = setInterval(() => {
        if (socket.connected) {
          pingAndSendUpdates(ipAddresses);
        } else {
          clearInterval(socket.pingIntervalId);
        }
      }, 60000);

      socket.once("disconnect", () => {
        if (socket.pingIntervalId) {
          clearInterval(socket.pingIntervalId);
        }
        console.log(`WebSocket disconnected: ${socket.id}`);
      });
    });

    socket.on("disconnect", (reason) => {
      console.log(`Client ${socket.id} disconnected: ${reason}`);
      if (socket.pingIntervalId) {
        clearInterval(socket.pingIntervalId);
      }
    });
  });

  return io;
}

function getIO() {
  if (!ioInstance) {
    throw new Error("Socket.IO not initialized!");
  }
  return ioInstance;
}

module.exports = {
  configureSocket,
  getIO,
};
