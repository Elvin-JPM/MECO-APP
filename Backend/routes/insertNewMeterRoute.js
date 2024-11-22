const express = require("express");
const { getConnection } = require("../db");
const router = express.Router();
const multer = require("multer");

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/newMeter", upload.single("foto"), async (req, res) => {
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
  } = req.body;

  console.log(req.body);
  console.log("File: ", req.file);

  const foto = req.file ? req.file.buffer : null;

  let connection;

  try {
    connection = await getConnection();
    const query = `
      INSERT INTO MCAM_MEDIDORES
        (SERIE, ID_MODELO, ID_PUNTO_MEDICION, FUENTE_EXTERNA, FOTO, IP, INTEGRADO, ACTIVO, NUMERO_PUERTO)
      VALUES
        (:serie, :modelo, :idPunto, :fuenteExterna, :foto, :ip, :integrado, :activo, :puerto)
    `;

    await connection.execute(
      query,
      {
        serie,
        modelo,
        idPunto,
        fuenteExterna,
        foto,
        ip,
        integrado,
        activo,
        puerto,
      },
      { autoCommit: true }
    );

    res.status(200).json({ message: "Meter added successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Failed to insert data" });
  }
});

module.exports = router;
