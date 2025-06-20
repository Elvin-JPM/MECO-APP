const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { initOracleDb, cleanup } = require("./db");
const { initSqlServer } = require("./sqlServerConnection");
const http = require("http");
const { configureSocket } = require("./lib/configureSocket");
const { pingDevice } = require("./utils/pingUtils");
const { startPingWorker } = require("./pingWorker");

startPingWorker();

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

// Configure Socket.IO
const io = configureSocket(server);

// Make io accesible in routes if needed
app.set("io", io);

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
  "deleteReportRoute",
  "getMeterConnectionTimeRoute",
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
