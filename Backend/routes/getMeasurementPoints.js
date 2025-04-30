const express = require("express");
const { getConnection } = require("../db");
const router = express.Router();

router.get("/measurementPoints", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();

    const query = `
      SELECT PUNTOS.ID, PUNTOS.NOMBRE, PLANTAS.NOMBRE_PLANTA, PUNTOS.LATITUD, PUNTOS.LONGITUD 
      FROM (
        (SELECT * FROM MCAM_PUNTOS_MEDICION 
        WHERE LATITUD IS NOT NULL AND LONGITUD IS NOT NULL) PUNTOS
        INNER JOIN
        (SELECT * FROM ODS_DEV.BTR_PLANTAS) PLANTAS
        ON PUNTOS.ID_PLANTA = PLANTAS.ID_PLANTA
      )
      ORDER BY NOMBRE
    `;

    const result = await connection.execute(query);

    const measurementPoints = result.rows.map(
      ([id, nombre, nombre_planta, latitud, longitud]) => ({
        id,
        nombre,
        nombre_planta,
        latitud,
        longitud,
      })
    );

    res.json(measurementPoints);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Failed to fetch measurement points" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error("Error closing connection:", error);
      }
    }
  }
});

module.exports = router;
