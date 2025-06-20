const express = require("express");
const { getConnection } = require("../db");
const router = express.Router();

router.get("/metersConnectionTime", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();

    const query = `
      SELECT ID, ID_PUNTO_MEDICION, DESCRIPTION, TIPO, IP, ESTADO_COM, ULTIMO_INTENTO, ULTIMO_INTENTO_INCORRECTO
      FROM MCAM_MEDIDORES
      WHERE INTEGRADO = 1
      ORDER BY DESCRIPTION, TIPO
    `;

    const result = await connection.execute(query);

    const metersCommTimes = result.rows.map(
      ([
        ID,
        ID_PUNTO_MEDICION,
        DESCRIPTION,
        TIPO,
        IP,
        ESTADO_COM,
        ULTIMO_INTENTO,
        ULTIMO_INTENTO_INCORRECTO,
      ]) => ({
        id: ID,
        idPuntoMedicion: ID_PUNTO_MEDICION,
        description: DESCRIPTION,
        tipo: TIPO,
        ip: IP,
        estadoCom: ESTADO_COM,
        fechaUltimoIntentoCom: ULTIMO_INTENTO,
        fechaPrimerIntentoIncorrecto: ULTIMO_INTENTO_INCORRECTO,
      })
    );

    res.status(200).json(metersCommTimes);
  } catch (error) {
    console.error("Database query error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch meters communications status" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
        // Optionally track this in monitoring but don't fail the request
      }
    }
  }
});

module.exports = router;
