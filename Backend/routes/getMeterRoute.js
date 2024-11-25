const express = require("express");
const { getConnection } = require("../db");
const router = express.Router();

router.get("/meters/:meterId", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT * \
      FROM MCAM_MEDIDORES \
      WHERE ID = ${req.params.meterId}`
    );
    const meter = result.rows.map(
      ([
        ID,
        SERIE,
        ID_MODELO,
        ID_PUNTO_MEDICION,
        FUENTE_EXTERNA,
        FOTO,
        IP,
        INTEGRADO,
        ACTIVO,
        NUMERO_PUERTO,
        TIPO,
        DESCRIPTION,
      ]) => ({
        id: ID,
        serie: SERIE,
        id_modelo: ID_MODELO,
        id_punto_medicion: ID_PUNTO_MEDICION,
        fuente_externa: FUENTE_EXTERNA,
        foto: FOTO,
        ip: IP,
        integrado: INTEGRADO,
        activo: ACTIVO,
        numero_puerto: NUMERO_PUERTO,
        tipo: TIPO,
        description: DESCRIPTION,
      })
    );
    res.json(meter);
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
