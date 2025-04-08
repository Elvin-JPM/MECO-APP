const express = require("express");
const { getConnection } = require("../db");
const router = express.Router();
// const logger = require("../logger"); // Assuming you have a logger setup

router.get("/meters_info", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT ID, ID_PUNTO_MEDICION, IP, INTEGRADO, NUMERO_PUERTO, TIPO, DESCRIPTION 
       FROM MCAM_MEDIDORES
       WHERE INTEGRADO = 1`
    );

    if (result.rows.length === 0) {
      return res.status(204).send(); // No Content
    }

    const meters = result.rows.map((row) => ({
      id: row[0],
      idPuntoMedicion: row[1],
      ip: row[2],
      integrado: row[3],
      numeroPuerto: row[4],
      tipo: row[5],
      description: row[6],
    }));

    res.status(200).json({
      success: true,
      data: meters,
    });
  } catch (error) {
    // logger.error("Error fetching meters info:", error); // Use logging library
    res.status(500).json({
      success: false,
      error: "Failed to fetch meters info",
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        // Corrected variable name
        console.log("Error closing database connection:", err);
      }
    }
  }
});

module.exports = router;
