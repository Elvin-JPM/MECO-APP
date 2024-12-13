const express = require("express");
const { getConnection } = require("../db");
const router = express.Router();
const oracledb = require("oracledb");

router.get("/integratedMeters/:plantSubId", async (req, res) => {
  let connection;
  const puntoMedicion = req.params.plantSubId.split("-"); // parametro de la forma '34-PLANTA'
  const idPuntoMedicion = puntoMedicion[0];
  const tipoPuntoMedicion = puntoMedicion[1]; // Puede ser PLANTA o SUBESTACION
  console.log("id punto: ", puntoMedicion);
  try {
    connection = await getConnection();
    const result =
      tipoPuntoMedicion === "SUBESTACION"
        ? await connection.execute(
            `SELECT A.ID, A.DESCRIPTION, A.ID_ION_DATA, A.ID_PUNTO_MEDICION, A.TIPO FROM MCAM_MEDIDORES A
        INNER JOIN MCAM_PUNTOS_MEDICION B
        ON A.ID_PUNTO_MEDICION = B.ID
        WHERE ID_SUBESTACION = ${idPuntoMedicion}
        AND A.INTEGRADO = 1`,
            [],
            { fetchInfo: { FOTO: { type: oracledb.BUFFER } } }
          )
        : await connection.execute(
            `SELECT A.ID, A.DESCRIPTION, A.ID_ION_DATA, A.ID_PUNTO_MEDICION, A.TIPO FROM MCAM_MEDIDORES A
        INNER JOIN MCAM_PUNTOS_MEDICION B
        ON A.ID_PUNTO_MEDICION = B.ID
        WHERE ID_PLANTA = ${idPuntoMedicion}`,
            [],
            { fetchInfo: { FOTO: { type: oracledb.BUFFER } } }
          );

    const integratedMeters = result.rows.map(
      ([ID, DESCRIPTION, ID_ION_DATA, ID_PUNTO_MEDICION, TIPO]) => ({
        id: ID,
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
