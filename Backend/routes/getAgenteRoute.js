const express = require("express");
const { getConnection } = require("../db");
const router = express.Router();
const oracledb = require("oracledb");

router.get("/agentes/:codigoPunto", async (req, res) => {
  let connection;
  try {
    console.log("id received for agent: ", req.params.codigoPunto);
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT * \
      FROM MCAM_DATOS_PUNTOS_MEDICION \
      WHERE ID = ${req.params.codigoPunto}`,
      [],
      { fetchInfo: { FOTO: { type: oracledb.BUFFER } } }
    );
    const dataPunto = result.rows.map(
      ([
        ID,
        NOMBRE_PUNTO,
        DISPOSITIVO_CONEXION,
        DISPOSITIVO_FRONTERA,
        NOMBRE_AGENTE,
        VOLTAJE_PUNTO,
        SUBESTACION,
        NOMBRE_PLANTA,
      ]) => ({
        id: ID,
        nombre_punto: NOMBRE_PUNTO,
        dispositivo_conexion: DISPOSITIVO_CONEXION,
        dispositivo_frontera: DISPOSITIVO_FRONTERA,
        nombre_agente: NOMBRE_AGENTE,
        voltaje_punto: VOLTAJE_PUNTO,
        subestacion: SUBESTACION,
        nombre_planta: NOMBRE_PLANTA,
      })
    );
    console.log(dataPunto);
    res.json(dataPunto);
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
