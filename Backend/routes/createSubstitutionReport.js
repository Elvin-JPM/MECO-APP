const express = require("express");
const { getConnection } = require("../db");
const router = express.Router();
const multer = require("multer");
const oracledb = require("oracledb");

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/createSubstitutionReport",
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
    } = req.body;

    const pdfFile = req.file ? req.file.buffer : null; // Ensure this is handled properly

    console.log("req.body: ", req.body);
    console.log("file: ", pdfFile);

    let connection;

    try {
      connection = await getConnection();

      const query = `
        INSERT INTO MCAM_RESUMEN_VALIDACIONES
          (   CREATED_BY_USER,
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
              VALIDACION_PDF,
              DIAS_TIPO,
              RAZON_PROBLEMA,
              PROCEDIMIENTO,
              FECHA_CREACION,
              VALIDADO_POR
          )
        VALUES
          (   2,
              :agente,
              :codigoPunto,
              :nombreCentral,
              :designacion,
              :resumenProblema,
              :consecuencia,
              :medicionesAfectadas,
              :medicionesDisponibles,
              TO_DATE(:fechaInicial, 'YYYY-MM-DD"T"HH24:MI'),
              TO_DATE(:fechaFinal, 'YYYY-MM-DD"T"HH24:MI'),
              :pdfFile,
              :diasTipo,
              :razonProblema,
              :procedimiento,
              SYSDATE,
              :validadoPor
          )
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
