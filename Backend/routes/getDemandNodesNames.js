const express = require("express");
const { getConnection } = require("../db");
const router = express.Router();

router.get("/nodes_names", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT ID, NOMBRE_NODO FROM MCAM_NODOS_DEMANDA`
    );
    console.log("Nodos de demanda: ", result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("Database query error: ", error);
    res.status(500).json({ error: "Failed to fetch nodes names" });
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
