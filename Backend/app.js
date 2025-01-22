const express = require("express");
const cors = require("cors");
const { initOracleDb } = require("./db");
const { initSqlServer } = require("./sqlServerConnection");
const getMetersRoute = require("./routes/getMetersRoute");
const getSubstationsRoute = require("./routes/getSubstationsRoute");
const getPowerPlantsRoute = require("./routes/getPowerPlantsRoute");
const getPlantsAndSubstationsRoute = require("./routes/getPlantAndSubstationsRoute");
const getMetersModelsRoute = require("./routes/getMetersModelsRoute");
const getMeterRoute = require("./routes/getMeterRoute");
const getIntegratedMetersRoute = require("./routes/getIntegratedMetersRoute");
const getMeterMesasuresRoute = require("./routes/getMeterMeasuresRoute");
const getAgenteRoute = require("./routes/getAgenteRoute");

const updateMeterRoute = require("./routes/updateMeterRoute");
const updateMeasuresRoute = require("./routes/updateMeasuresRoute");

const insertNewMeterRoute = require("./routes/insertNewMeterRoute");
const createUserRoute = require("./routes/createUserRoute");
const createSubstitutionReport = require("./routes/createSubstitutionReport");

const loginRoute = require("./routes/loginRoute");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Cache-Control",
      "X-Requested-With",
      "User-Agent",
      "Origin",
      "X-CSRF-Token",
      "headers",
    ],
    credentials: true,
    maxAge: 3600, // Value is in seconds
  })
);

// Routes
app.use("/api", getMetersRoute);
app.use("/api", getSubstationsRoute);
app.use("/api", getPowerPlantsRoute);
app.use("/api", getPlantsAndSubstationsRoute);
app.use("/api", getMetersModelsRoute);
app.use("/api", getMeterRoute);
app.use("/api", getIntegratedMetersRoute);
app.use("/api", getMeterMesasuresRoute);
app.use("/api", getAgenteRoute);
app.use("/api", updateMeasuresRoute);
app.use("/api", updateMeterRoute);

app.use("/api", createUserRoute);
app.use("/api", insertNewMeterRoute);
app.use("/api", createSubstitutionReport);

app.use("/api", loginRoute);

// Start the server
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
