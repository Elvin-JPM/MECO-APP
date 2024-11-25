const express = require("express");
const cors = require("cors");
const { initOracleDb } = require("./db");
const getMetersRoute = require("./routes/getMetersRoute");
const getSubstationsRoute = require("./routes/getSubstationsRoute");
const getPowerPlantsRoute = require("./routes/getPowerPlantsRoute");
const getPlantsAndSubstationsRoute = require("./routes/getPlantAndSubstationsRoute");
const getMetersModelsRoute = require("./routes/getMetersModelsRoute");
const insertNewMeterRoute = require("./routes/insertNewMeterRoute");
const getMeterRoute = require("./routes/getMeterRoute");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use("/api", insertNewMeterRoute);
app.use("/api", getMeterRoute);

// Start the server
(async () => {
  try {
    await initOracleDb();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server: ", error);
    process.exit(1);
  }
})();
