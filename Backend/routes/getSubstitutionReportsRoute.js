const express = require("express");
const { getConnection } = require("../db");
const router = express.Router();
const oracledb = require("oracledb");

router.get("/substitutionReports", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();

    const getReportsQuery = `
      SELECT
        ID,
        CREATED_BY_USER,
        AGENTE,
        CODIGO_PUNTO,
        NOMBRE_CENTRAL,
        DESIGNACION,
        RESUMEN,
        CONSECUENCIA,
        MEDICIONES_AFECTADAS,
        MEDICIONES_DISPONIBLES,
        FECHA_INICIAL,
        FECHA_FINAL,
        DIAS_TIPO,
        RAZON_PROBLEMA,
        PROCEDIMIENTO,
        VALIDADO_POR,
        FECHA_CREACION,
        NOMBRE_REPORTE,
        APROBADO,
        FILAS_EDITADAS,
        FECHA_ACTUALIZACION
      FROM MCAM_RESUMEN_VALIDACIONES
      ORDER BY FECHA_CREACION, FECHA_ACTUALIZACION DESC
    `;

    const result = await connection.execute(getReportsQuery, [], {
      fetchInfo: {
        FILAS_EDITADAS: { type: oracledb.STRING },
      },
    });

    const report = result.rows.map(
      ([
        ID,
        CREATED_BY_USER,
        AGENTE,
        CODIGO_PUNTO,
        NOMBRE_CENTRAL,
        DESIGNACION,
        RESUMEN,
        CONSECUENCIA,
        MEDICIONES_AFECTADAS,
        MEDICIONES_DISPONIBLES,
        FECHA_INICIAL,
        FECHA_FINAL,
        DIAS_TIPO,
        RAZON_PROBLEMA,
        PROCEDIMIENTO,
        VALIDADO_POR,
        FECHA_CREACION,
        NOMBRE_REPORTE,
        APROBADO,
        FILAS_EDITADAS,
        FECHA_ACTUALIZACION,
      ]) => ({
        id: ID,
        created_by_user: CREATED_BY_USER,
        agente: AGENTE,
        codigoPunto: CODIGO_PUNTO,
        nombreCentral: NOMBRE_CENTRAL,
        designacion: DESIGNACION,
        resumenProblema: RESUMEN,
        consecuencia: CONSECUENCIA,
        medicionesAfectadas: MEDICIONES_AFECTADAS,
        medicionesDisponibles: MEDICIONES_DISPONIBLES,
        fechaInicial: FECHA_INICIAL,
        fechaFinal: FECHA_FINAL,
        diasTipo: DIAS_TIPO,
        razonProblema: RAZON_PROBLEMA,
        procedimiento: PROCEDIMIENTO,
        validadoPor: VALIDADO_POR,
        fechaCreacion: FECHA_CREACION,
        nombreReporte: NOMBRE_REPORTE,
        aprobado: APROBADO,
        filas_editadas:
          FILAS_EDITADAS && typeof FILAS_EDITADAS === "string"
            ? JSON.parse(FILAS_EDITADAS)
            : null,
        fechaActualizacion: FECHA_ACTUALIZACION,
      })
    );

    res.json(report);
  } catch (error) {
    console.error("Database query error:", error.message || "Unknown error");
    res.status(500).json({
      error: "Failed to fetch reports",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error("Error closing connection: ", error.message || error);
      }
    }
  }
});

module.exports = router;
