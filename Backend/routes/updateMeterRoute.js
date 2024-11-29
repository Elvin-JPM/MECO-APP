const express = require("express");
const { getConnection } = require("../db");
const multer = require("multer");

const router = express.Router();

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

router.put("/updateMeter/:id", upload.single("foto"), async (req, res) => {
  const { id } = req.params; // Extract the meter ID from the route parameter
  const {
    plantssub,
    idPunto,
    ip,
    serie,
    modelo,
    puerto,
    fuenteExterna,
    integrado,
    activo,
    tipo,
    description,
  } = req.body;

  console.log(req.body);
  console.log("File: ", req.file);

  const foto = req.file ? req.file.buffer : null;

  let connection;

  try {
    connection = await getConnection();
    const query = `
      UPDATE MCAM_MEDIDORES
      SET 
        SERIE = :serie,
        ID_MODELO = :modelo,
        ID_PUNTO_MEDICION = :idPunto,
        FUENTE_EXTERNA = :fuenteExterna,
        FOTO = :foto,
        IP = :ip,
        INTEGRADO = :integrado,
        ACTIVO = :activo,
        NUMERO_PUERTO = :puerto,
        TIPO = :tipo,
        DESCRIPTION = :description
      WHERE ID = :id
    `;

    await connection.execute(
      query,
      {
        id,
        serie,
        modelo,
        idPunto,
        fuenteExterna,
        foto,
        ip,
        integrado,
        activo,
        puerto,
        tipo,
        description,
      },
      { autoCommit: true }
    );

    res.status(200).json({ message: "Meter updated successfully" });
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ error: "Failed to update data" });
  }
});

module.exports = router;
