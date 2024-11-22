const express = require("express");
const { getConnection } = require("../db");
const router = express.Router();

router.get("/plants", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      "SELECT ID_PLANTA, NOMBRE_PLANTA FROM ODS_DEV.BTR_PLANTAS \
       ORDER BY NOMBRE_PLANTA"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Database query error: ", error);
    res.status(500).json({ error: "Failed to fetch POWER PLANTS" });
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
