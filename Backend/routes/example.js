const express = require("express");
const { getConnection } = require("../db");
const router = express.Router();

router.get("/meters", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      "SELECT ID_PUNTO, NOMBRE_PLANTA, IP, NOMBRE_PUNTO, SUBESTACION, SERIE \
      FROM MCAM_METERS_OWNERS \
      ORDER BY NOMBRE_PLANTA, IP \
      FETCH FIRST 20 ROWS ONLY"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Database query error: ", error);
    res.status(500).json({ error: "Failed to fetch data" });
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
