const express = require("express");
const { getConnection } = require("../db");
const router = express.Router();
const oracledb = require("oracledb");

router.get("/integratedMeters", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT DESCRIPTION, ID_ION_DATA, ID_PUNTO_MEDICION, TIPO 
         FROM MCAM_MEDIDORES WHERE INTEGRADO = 1 ORDER BY DESCRIPTION`,
      [],
      { fetchInfo: { FOTO: { type: oracledb.BUFFER } } }
    );
    const integratedMeters = result.rows.map(
      ([DESCRIPTION, ID_ION_DATA, ID_PUNTO_MEDICION, TIPO]) => ({
        description: DESCRIPTION,
        id_ion_data: ID_ION_DATA,
        id_punto_medicion: ID_PUNTO_MEDICION,
        tipo: TIPO,
      })
    );
    res.json(integratedMeters);
  } catch (error) {
    console.error("Database query error: ", error);
    res.status(500).json({ error: "Failed to fetch meter" });
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
