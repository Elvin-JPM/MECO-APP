const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { initOracleDb } = require("./db");
const { initSqlServer } = require("./sqlServerConnection");

const app = express();
const PORT =
  process.env.NODE_ENV === "development"
    ? process.env.PORT_DEV
    : process.env.PORT_PROD || 3002;

// Middleware
app.set("trust proxy", 1);
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use((req, res, next) => {
  console.log("Cookies received:", req.cookies);
  next();
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

// CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      let allowedOrigin;
      if (process.env.NODE_ENV === "production") {
        allowedOrigin = process.env.FRONTEND_URL_PROD;
      } else {
        allowedOrigin = process.env.FRONTEND_URL_DEV;
      }

      const isAllowed = origin
        .toLowerCase()
        .startsWith(allowedOrigin.toLowerCase());

      console.log(
        `CORS check: ${origin} against ${allowedOrigin} => ${isAllowed}`
      );

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

// Import Routes
const routes = [
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

routes.forEach((route) => {
  app.use("/api", require(`./routes/${route}`));
});

// Start Server
(async () => {
  try {
    await initOracleDb();
    await initSqlServer();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server: ", error);
    process.exit(1);
  }
})();
