const express = require("express");
const cron = require("node-cron");
const { exec } = require("child_process");
const path = require("path");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
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
const getReportRoute = require("./routes/getReportRoute");
const refreshTokenRoute = require("./routes/refreshTokenRoute");

const updateMeterRoute = require("./routes/updateMeterRoute");
const updateMeasuresRoute = require("./routes/updateMeasuresRoute");

const insertNewMeterRoute = require("./routes/insertNewMeterRoute");
const createUserRoute = require("./routes/createUserRoute");
const createSubstitutionReport = require("./routes/createSubstitutionReport");

const loginRoute = require("./routes/loginRoute");
const protectedRoute = require("./routes/protected");

const meRoute = require("./routes/meRoute");
const logoutRoute = require("./routes/logoutRoute");

require("dotenv").config();

const PORT = process.env.PORT || 3000;
const frontEndUrl = process.env.FRONT_END_URL;
console.log(frontEndUrl);

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use((req, res, next) => {
  console.log("Cookies received:", req.cookies); // Log cookies
  next();
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(
  cors({
    origin: "http://localhost:5173",
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

      //"headers",
    ],
    credentials: true,
    exposedHeaders: ["set-cookie"],
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
app.use("/api", getReportRoute);
app.use("/api", updateMeasuresRoute);
app.use("/api", updateMeterRoute);

app.use("/api", createUserRoute);
app.use("/api", insertNewMeterRoute);
app.use("/api", createSubstitutionReport);

app.use("/api", loginRoute);
app.use("/api", protectedRoute);

app.use("/api", logoutRoute);
app.use("/api", meRoute);
app.use("/api", refreshTokenRoute);

// Start the server
(async () => {
  try {
    await initOracleDb();
    await initSqlServer();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

    const pythonScriptPath = path.join(__dirname, "../Data Loading/main.py");

    console.log(pythonScriptPath);
    // Schedule a cron job to run every day at 1:00 AM
    cron.schedule("46 10 * * *", () => {
      console.log("Running the Python script at 1:00 AM");

      // Pass parameters to the Python script, handle spaces in the path by quoting it
      exec(`python "${pythonScriptPath}"`, (error, stdout, stderr) => {
        console.log(pythonScriptPath);
        if (error) {
          console.error(`Error executing script: ${error}`);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }
        console.log("Python script finished executing!");
        console.log(`Output: ${stdout}`);
      });
    });
  } catch (error) {
    console.error("Error starting server: ", error);
    process.exit(1);
  }
})();
