const express = require("express");
const { getConnection } = require("../db");
const router = express.Router();

router.get("/plantssubs", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      "SELECT NOMBRE FROM ( \
            SELECT NOMBRE_PLANTA AS NOMBRE FROM ODS_DEV.BTR_PLANTAS \
            UNION \
            SELECT SUBESTACION AS NOMBRE FROM ODS_DEV.BTR_SUBESTACIONES\
            ) \
       ORDER BY NOMBRE"
    );
    const plantsAndSubstations = result.rows.map(([nombre]) => nombre);
    res.json(plantsAndSubstations);
  } catch (error) {
    console.error("Database query error: ", error);
    res.status(500).json({ error: "Failed to fetch plants and substations" });
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
