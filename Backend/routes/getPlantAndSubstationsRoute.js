const express = require("express");
const { getConnection } = require("../db");
const router = express.Router();

router.get("/plantssubs", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `
        SELECT 
    MIN(ID) AS ID, -- Pick one ID (e.g., the smallest) for each unique name
    NOMBRE
FROM (
    SELECT 
        ID_PLANTA || '-PLANTA' AS ID, 
        NOMBRE_PLANTA AS NOMBRE 
    FROM ODS_DEV.BTR_PLANTAS 
    UNION 
    SELECT 
        ID_SUBESTACION || '-SUBESTACION' AS ID, 
        SUBESTACION AS NOMBRE 
    FROM ODS_DEV.BTR_SUBESTACIONES
)
GROUP BY NOMBRE
ORDER BY NOMBRE
      `
    );
    const plantsAndSubstations = result.rows.map(([id, nombre]) => {
      return { id, nombre }; // Returning an object for each row
    });

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
