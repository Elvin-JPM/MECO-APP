const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { initOracleDb, cleanup } = require("./db");
const { initSqlServer } = require("./sqlServerConnection");
const http = require("http");
const socketIo = require("socket.io");
const { pingDevice } = require("./utils/pingUtils"); // Import from utilities

if (process.env.NODE_ENV === "development") {
  require("./pythonWorker.js");
}

const app = express();
const PORT =
  process.env.NODE_ENV === "development"
    ? process.env.PORT_DEV
    : process.env.PORT_PROD || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
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

// Middleware
app.set("trust proxy", 1);
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowedOrigin =
        process.env.NODE_ENV === "production"
          ? process.env.FRONTEND_URL_PROD
          : process.env.FRONTEND_URL_DEV;
      const isAllowed = origin
        .toLowerCase()
        .startsWith(allowedOrigin.toLowerCase());
      callback(null, isAllowed);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.options("*", cors());

// Import and load routes
const routes = [
  "getMeterCommStatusPing",
  "getMetersInfo",
  "getMetersRoute",
  "getSubstationsRoute",
  "getPowerPlantsRoute",
  "getPlantAndSubstationsRoute",
  "getMetersModelsRoute",
  "getMeterRoute",
  "getIntegratedMetersRoute",
  "getMeterMeasuresRoute",
  "getAgenteRoute",
  "getReportRoute",
  "getStatisticsRoute",
  "getDemandaNacionalHoraria",
  "getDemandNodesNames",
  "updateMeasuresRoute",
  "updateMeterRoute",
  "createUserRoute",
  "insertNewMeterRoute",
  "createSubstitutionReport",
  "loginRoute",
  "protected",
  "logoutRoute",
  "meRoute",
  "refreshTokenRoute",
  "getMeasurementPoints",
  "editSubstitutionReport",
  "getSubstitutionReportsRoute",
  "updateReportApprovedRoute",
  "getGeneracionNacionalHoraria",
];

routes.forEach((routeName) => {
  try {
    const routeModule = require(`./routes/${routeName}`);
    app.use("/api", routeModule);
    console.log(`Loaded route: /api/${routeName}`);
  } catch (err) {
    console.error(`Error loading route ${routeName}:`, err);
  }
});

// WebSocket Connection Handler
io.on("connection", (socket) => {
  // console.log(
  //   `New connection: ${socket.id} from ${socket.handshake.headers.origin}`
  // );

  socket.on("error", (err) => {
    console.error(`Socket error (${socket.id}):`, err);
  });

  socket.on("startPinging", async (ipAddresses) => {
    console.log("Starting ping for IPs:", ipAddresses);

    // Clear previous interval if exists
    if (socket.pingIntervalId) {
      clearInterval(socket.pingIntervalId);
    }

    const pingAndSendUpdates = async (ips) => {
      for (const ip of ips) {
        try {
          const result = await pingDevice(ip);
          // Ensure we're still connected before sending update
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

    // Initial ping
    await pingAndSendUpdates(ipAddresses);

    // Set up periodic pinging with shorter interval
    socket.pingIntervalId = setInterval(() => {
      if (socket.connected) {
        pingAndSendUpdates(ipAddresses);
      } else {
        clearInterval(socket.pingIntervalId);
      }
    }, 60000); // Ping every 60 seconds

    // Clean up on disconnect
    socket.once("disconnect", () => {
      if (socket.pingIntervalId) {
        clearInterval(socket.pingIntervalId);
      }
      console.log(`WebSocket disconnected: ${socket.id}`);
    });
  });

  // Handle client disconnection
  socket.on("disconnect", (reason) => {
    console.log(`Client ${socket.id} disconnected: ${reason}`);
    if (socket.pingIntervalId) {
      clearInterval(socket.pingIntervalId);
    }
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    websockets: io.engine.clientsCount,
  });
});

// Start Server
(async () => {
  try {
    await initOracleDb();
    await initSqlServer();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`WebSocket available at /socket.io`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
})();
