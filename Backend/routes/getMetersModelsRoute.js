const express = require("express");
const { getConnection } = require("../db");
const router = express.Router();

router.get("/meter_models", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      "SELECT ID, MODELO FROM MCAM_MODELOS_MEDIDORES ORDER BY ID"
    );
    const substations = result.rows.map(([id, modelo]) => ({
      id,
      modelo,
    }));
    res.json(substations);
  } catch (error) {
    console.error("Database query error: ", error);
    res.status(500).json({ error: "Failed to fetch meters' models" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error("Error closing connection: ", err);
      }
    }
  }
});

module.exports = router;
