const express = require("express");
const { getConnection } = require("../db");
const router = express.Router();
const multer = require("multer");
const oracledb = require("oracledb");

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.put(
  "/editSubstitutionReport",
  upload.single("file"),
  async (req, res) => {
    const {
      agente,
      codigoPunto,
      nombreCentral,
      designacion,
      resumenProblema,
      razonProblema,
      consecuencia,
      medicionesAfectadas,
      medicionesDisponibles,
      diasTipo,
      procedimiento,
      fechaInicial,
      fechaFinal,
      validadoPor,
      nombreReporte,
      rowsToEdit,
    } = req.body;

    const pdfFile = req.file ? req.file.buffer : null; // Ensure this is handled properly

    console.log("req.body: ", req.body);
    console.log("file: ", pdfFile);

    let connection;

    try {
      connection = await getConnection();

      const query = `
        UPDATE MCAM_RESUMEN_VALIDACIONES
          SET
            CREATED_BY_USER = 2,
            AGENTE = :agente,
            CODIGO_PUNTO = :codigoPunto,
            NOMBRE_CENTRAL = :nombreCentral,
            DESIGNACION = :designacion,
            RESUMEN = :resumenProblema,
            CONSECUENCIA = :consecuencia,
            MEDICIONES_AFECTADAS = :medicionesAfectadas,
            MEDICIONES_DISPONIBLES = :medicionesDisponibles,
            FECHA_INICIAL = TO_DATE(:fechaInicial, 'YYYY-MM-DD"T"HH24:MI'),
            FECHA_FINAL = TO_DATE(:fechaFinal, 'YYYY-MM-DD"T"HH24:MI'),
            VALIDACION_PDF = :pdfFile,
            DIAS_TIPO = :diasTipo,
            RAZON_PROBLEMA = :razonProblema,
            PROCEDIMIENTO = :procedimiento,
            FECHA_CREACION = SYSDATE,
            VALIDADO_POR = :validadoPor,
            NOMBRE_REPORTE = :nombreReporte,
            FILAS_EDITADAS = :rowsToEdit,
            FECHA_ACTUALIZACION = SYSDATE,
            APROBADO = 0
          WHERE
            NOMBRE_REPORTE = :nombreReporte
      `;

      // Execute the query with bind variables
      await connection.execute(
        query,
        {
          agente,
          codigoPunto,
          nombreCentral,
          designacion,
          resumenProblema,
          consecuencia,
          medicionesAfectadas,
          medicionesDisponibles,
          fechaInicial,
          fechaFinal,
          pdfFile: pdfFile
            ? { val: pdfFile, type: oracledb.BLOB, dir: oracledb.BIND_IN }
            : null, // Ensure this is either a valid Buffer or NULL
          diasTipo,
          razonProblema,
          procedimiento,
          validadoPor,
          nombreReporte,
          rowsToEdit: { val: rowsToEdit, type: oracledb.CLOB },
        },
        { autoCommit: true }
      );

      res.status(200).json({ message: "Changes saved!" });
    } catch (error) {
      console.error("Error saving data:", error);
      res.status(500).json({ error: "Failed to save data" });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeError) {
          console.error("Error closing the connection:", closeError);
        }
      }
    }
  }
);

module.exports = router;
