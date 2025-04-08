const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { initOracleDb } = require("./db");
const { initSqlServer } = require("./sqlServerConnection");
const http = require("http");
const socketIo = require("socket.io");
const { pingDevice } = require("./utils/pingUtils"); // Import from utilities

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
    // origin:
    //   process.env.NODE_ENV === "production"
    //     ? process.env.FRONTEND_URL_PROD
    //     : process.env.FRONTEND_URL_DEV,
    origin:
      process.env.NODE_ENV === "production"
        ? "http://10.10.5.40" // Explicitly allow frontend
        : "*", // Allow all in dev

    methods: ["GET", "POST"],
    credentials: true,
  },
  path: "/socket.io",
  transports: ["websocket"], // Force WebSocket
  pingTimeout: 60000,
  pingInterval: 25000,
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
  console.log("New WebSocket connection:", socket.id);

  socket.on("startPinging", async (ipAddresses) => {
    console.log("Starting ping for IPs:", ipAddresses);

    const pingAndSendUpdates = async (ips) => {
      for (const ip of ips) {
        try {
          const result = await pingDevice(ip);
          socket.emit("pingUpdate", {
            ip,
            success: result.success,
            message: result.message,
          });
        } catch (error) {
          socket.emit("pingUpdate", {
            ip,
            success: false,
            message: `Error pinging ${ip}: ${error.message}`,
          });
        }
      }
    };

    // Initial ping
    await pingAndSendUpdates(ipAddresses);

    // Set up periodic pinging
    const intervalId = setInterval(() => {
      pingAndSendUpdates(ipAddresses);
    }, 60000);

    // Clean up on disconnect
    socket.on("disconnect", () => {
      clearInterval(intervalId);
      console.log("WebSocket disconnected:", socket.id);
    });
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
