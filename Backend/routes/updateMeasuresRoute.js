const express = require("express");
const { getConnection } = require("../db");

const router = express.Router();

router.put("/updateMeasures", async (req, res) => {
  const rowsToEdit = req.body; // Assuming req.body is an array of objects
  console.log("Rows to edit:", rowsToEdit);
  let queryPrincipal = "";
  let queryRespaldo = "";

  let connection;
  try {
    connection = await getConnection();

    // Use a for...of loop for async/await
    for (const rowToEdit of rowsToEdit) {
      // Preprocess numeric values to remove commas
      const energia_del_mp = parseFloat(
        rowToEdit.energia_del_mp.replace(/,/g, "")
      );
      const energia_rec_mp = parseFloat(
        rowToEdit.energia_rec_mp.replace(/,/g, "")
      );
      const energia_del_mr = parseFloat(
        rowToEdit.energia_del_mr.replace(/,/g, "")
      );
      const energia_rec_mr = parseFloat(
        rowToEdit.energia_rec_mr.replace(/,/g, "")
      );

      if (rowToEdit.tipoMedicion === "energiaActivaIntervalo") {
        queryPrincipal = `
      UPDATE MCAM_MEDICIONES
      SET
        KWH_DEL_INT = :energia_del_mp,
        KWH_REC_INT = :energia_rec_mp
      WHERE ID_MEDIDOR = :idPrincipal
      AND FECHA = TO_DATE(:fecha, 'DD-MM-YYYY HH24:MI')
    `;
        queryRespaldo = `
      UPDATE MCAM_MEDICIONES
      SET
        KWH_DEL_INT = :energia_del_mr,
        KWH_REC_INT = :energia_rec_mr
      WHERE ID_MEDIDOR = :idRespaldo
      AND FECHA = TO_DATE(:fecha, 'DD-MM-YYYY HH24:MI')
      `;
      } else if (rowToEdit.tipoMedicion === "energiaActivaAcumulada") {
        queryPrincipal = `
      UPDATE MCAM_MEDICIONES
      SET
        KWH_DEL = :energia_del_mp,
        KWH_REC = :energia_rec_mp
      WHERE ID_MEDIDOR = :idPrincipal
      AND FECHA = TO_DATE(:fecha, 'DD-MM-YYYY HH24:MI')
    `;
        queryRespaldo = `
      UPDATE MCAM_MEDICIONES
      SET
        KWH_DEL = :energia_del_mr,
        KWH_REC = :energia_rec_mr
      WHERE ID_MEDIDOR = :idRespaldo
      AND FECHA = TO_DATE(:fecha, 'DD-MM-YYYY HH24:MI')`;
      } else if (rowToEdit.tipoMedicion === "energiaReactivaAcumulada") {
        queryPrincipal = `
      UPDATE MCAM_MEDICIONES
      SET
        KVARH_DEL = :energia_del_mp,
        KVARH_REC = :energia_rec_mp
      WHERE ID_MEDIDOR = :idPrincipal
      AND FECHA = TO_DATE(:fecha, 'DD-MM-YYYY HH24:MI')
    `;
        queryRespaldo = `
      UPDATE MCAM_MEDICIONES
      SET
        KVARH_DEL = :energia_del_mr,
        KVARH_REC = :energia_rec_mr
      WHERE ID_MEDIDOR = :idRespaldo
      AND FECHA = TO_DATE(:fecha, 'DD-MM-YYYY HH24:MI')`;
      } else {
        queryPrincipal = `
      UPDATE MCAM_MEDICIONES
      SET
        KVARH_DEL_INT = :energia_del_mp,
        KVARH_REC_INT = :energia_rec_mp
      WHERE ID_MEDIDOR = :idPrincipal
      AND FECHA = TO_DATE(:fecha, 'DD-MM-YYYY HH24:MI')
    `;
        queryRespaldo = `
      UPDATE MCAM_MEDICIONES
      SET
        KVARH_DEL_INT = :energia_del_mr,
        KVARH_REC_INT = :energia_rec_mr
      WHERE ID_MEDIDOR = :idRespaldo
      AND FECHA = TO_DATE(:fecha, 'DD-MM-YYYY HH24:MI')`;
      }

      // Update the principal record
      await connection.execute(
        queryPrincipal,
        {
          energia_del_mp,
          energia_rec_mp,
          idPrincipal: rowToEdit.idPrincipal,
          fecha: rowToEdit.fecha,
        },
        { autoCommit: false }
      );

      // Update the respaldo record
      await connection.execute(
        queryRespaldo,
        {
          energia_del_mr,
          energia_rec_mr,
          idRespaldo: rowToEdit.idRespaldo,
          fecha: rowToEdit.fecha,
        },
        { autoCommit: false }
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
