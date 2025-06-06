const express = require("express");
const { getConnection } = require("../db");
const multer = require("multer");

const router = express.Router();

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

router.put(
  "/approveReport/:reportId",
  upload.single("foto"),
  async (req, res) => {
    const { reportId } = req.params; // Extract the report ID from the route parameter

    let connection;

    try {
      connection = await getConnection();
      const query = `
      UPDATE MCAM_RESUMEN_VALIDACIONES
      SET 
        APROBADO = 1
      WHERE ID = :reportId
    `;

      await connection.execute(
        query,
        {
          reportId,
        },
        { autoCommit: true }
      );

      res.status(200).json({ message: "Reporte actualizado exitosamente" });
    } catch (error) {
      console.error("Error updating data:", error);
      res.status(500).json({ error: "Failed to update data" });
    }
  }
);

module.exports = router;
