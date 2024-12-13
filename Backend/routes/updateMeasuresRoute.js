const express = require("express");
const { getConnection } = require("../db");

const router = express.Router();

router.put("/updateMeasures", async (req, res) => {
  const rowsToEdit = req.body; // Assuming req.body is an array of objects
  console.log("Rows to edit:", rowsToEdit);

  let connection;
  try {
    connection = await getConnection();

    const queryPrincipal = `
      UPDATE MCAM_MEDICIONES
      SET
        KWH_DEL = :kwh_del_mp,
        KWH_REC = :kwh_rec_mp
      WHERE ID_MEDIDOR = :idPrincipal
      AND FECHA = TO_DATE(:fecha, 'DD-MM-YYYY HH24:MI')
    `;

    const queryRespaldo = `
      UPDATE MCAM_MEDICIONES
      SET
        KWH_DEL = :kwh_del_mr,
        KWH_REC = :kwh_rec_mr
      WHERE ID_MEDIDOR = :idRespaldo
      AND FECHA = TO_DATE(:fecha, 'DD-MM-YYYY HH24:MI')
    `;

    // Use a for...of loop for async/await
    for (const rowToEdit of rowsToEdit) {
      // Update the principal record
      await connection.execute(
        queryPrincipal,
        {
          kwh_del_mp: rowToEdit.kwh_del_mp,
          kwh_rec_mp: rowToEdit.kwh_rec_mp,
          idPrincipal: rowToEdit.idPrincipal,
          fecha: rowToEdit.fecha,
        },
        { autoCommit: false } // Set autoCommit to false for batch operations
      );

      // Update the respaldo record
      await connection.execute(
        queryRespaldo,
        {
          kwh_del_mr: rowToEdit.kwh_del_mr,
          kwh_rec_mr: rowToEdit.kwh_rec_mr,
          idRespaldo: rowToEdit.idRespaldo,
          fecha: rowToEdit.fecha,
        },
        { autoCommit: false } // Set autoCommit to false for batch operations
      );
    }

    // Commit the transaction after all operations
    await connection.commit();

    res.status(200).json({ message: "Measures updated successfully" });
  } catch (error) {
    console.error("Error updating data:", error);

    // Rollback the transaction in case of an error
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Error rolling back transaction:", rollbackError);
      }
    }

    res.status(500).json({ error: "Failed to update data" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing the connection:", closeError);
      }
    }
  }
});

module.exports = router;
