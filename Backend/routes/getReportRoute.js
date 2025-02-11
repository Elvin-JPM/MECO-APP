const express = require("express");
const { getConnection } = require("../db");
const router = express.Router();
const oracledb = require("oracledb");

router.get("/report/:reportName", async (req, res) => {
  let connection;
  try {
    const reportName = req.params.reportName;

    connection = await getConnection();

    const getReportQuery = `
      SELECT VALIDACION_PDF FROM MCAM_RESUMEN_VALIDACIONES
      WHERE NOMBRE_REPORTE = :reportName
    `;

    const result = await connection.execute(
      getReportQuery,
      {
        reportName,
      },
      { fetchInfo: { VALIDACION_PDF: { type: oracledb.BUFFER } } }
    );

    const report = result.rows.map(([VALIDACION_PDF]) => ({
      validacion_pdf:
        VALIDACION_PDF && Buffer.isBuffer(VALIDACION_PDF)
          ? VALIDACION_PDF.toString("base64")
          : null,
    }));

    res.json({
      data: report,
    });
  } catch (error) {
    console.error("Database query error:", error.message || "Unknown error");
    res.status(500).json({ error: "Failed to fetch report" });
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
