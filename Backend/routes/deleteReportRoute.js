const express = require("express");
const { getConnection } = require("../db");
const router = express.Router();
const oracledb = require("oracledb");

router.delete("/reports/:id", async (req, res) => {
  const reportId = req.params.id;
  let connection;

  try {
    connection = await getConnection();

    // Start a transaction
    await connection.execute("BEGIN NULL; END;"); // Starts transaction

    // Get the filas_editadas data
    const filasEditadasQuery = `SELECT FILAS_EDITADAS FROM MCAM_RESUMEN_VALIDACIONES WHERE ID = :id`;
    console.log(
      "Executing query to get filas_editadas for report ID:",
      reportId
    );
    // Execute the query to get filas_editadas
    const filasEditadasResult = await connection.execute(
      filasEditadasQuery,
      {
        id: reportId,
      },
      { fetchInfo: { FILAS_EDITADAS: { type: oracledb.STRING } } }
    );

    console.log(
      "Query for filas editadas returned:",
      filasEditadasResult.rows[0][0]
    );

    if (!filasEditadasResult.rows || filasEditadasResult.rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Reporte no encontrado" });
    }

    const filasEditadas = filasEditadasResult.rows[0][0];

    // Parse the JSON data
    let editedRows;
    try {
      editedRows = JSON.parse(filasEditadas);
      console.log("Parsed filas_editadas JSON:", editedRows);
    } catch (error) {
      await connection.rollback();
      console.error("Error parsing filas_editadas JSON:", error);
      return res.status(400).json({ message: "Formato de datos inválido" });
    }

    // Process each row in the array
    let updateSuccess = true;
    for (const row of editedRows) {
      if (!row.hasOwnProperty("or_del_mp") && row.fecha) {
        try {
          // Update energia_del_mp (MP - principal)
          let energiaDel = null;
          let energiaRec = null;
          if (row.tipoMedicion === "energiaActivaAcumulada") {
            energiaDel = "KWH_DEL";
            energiaRec = "KWH_REC";
          } else if (row.tipoMedicion === "energiaReactivaAcumulada") {
            energiaDel = "KVARH_DEL";
            energiaRec = "KVARH_REC";
          } else if (row.tipoMedicion === "energiaActivaIntervalo") {
            energiaDel = "KWH_DEL_INT";
            energiaRec = "KWH_REC_INT";
          } else if (row.tipoMedicion === "energiaReactivaIntervalo") {
            energiaDel = "KVARH_DEL_INT";
            energiaRec = "KVARH_REC_INT";
          }

          if (
            row.energia_del_mp !== undefined &&
            row.idPrincipal !== undefined
          ) {
            const result = await connection.execute(
              `UPDATE MCAM_MEDICIONES 
               SET DATO_ENERGIA = :energia, ORIGEN = 'P', REPORTE_VALIDACION = NULL 
               WHERE TIPO_ENERGIA = :tipoEnergia
                 AND ID_MEDIDOR = :id
                 AND FECHA = TO_DATE(:fecha, 'DD-MM-YYYY HH24:MI')`,
              {
                energia: row.energia_del_mp,
                id: row.idPrincipal,
                fecha: row.fecha,
                tipoEnergia: energiaDel,
              }
            );
          }

          // Update energia_rec_mp (MP - principal)
          if (
            row.energia_rec_mp !== undefined &&
            row.idPrincipal !== undefined
          ) {
            await connection.execute(
              `UPDATE MCAM_MEDICIONES 
               SET DATO_ENERGIA = :energia, ORIGEN = 'P', REPORTE_VALIDACION = NULL
               WHERE TIPO_ENERGIA = :tipoEnergia
                 AND ID_MEDIDOR = :id
                 AND FECHA = TO_DATE(:fecha, 'DD-MM-YYYY HH24:MI')`,
              {
                energia: row.energia_rec_mp,
                id: row.idPrincipal,
                fecha: row.fecha,
                tipoEnergia: energiaRec,
              }
            );
          }

          // Update energia_del_mr (MR - respaldo)
          if (
            row.energia_del_mr !== undefined &&
            row.idRespaldo !== undefined
          ) {
            await connection.execute(
              `UPDATE MCAM_MEDICIONES 
               SET DATO_ENERGIA = :energia, ORIGEN = 'R', REPORTE_VALIDACION = NULL
               WHERE TIPO_ENERGIA = :tipoEnergia
                 AND ID_MEDIDOR = :id
                 AND FECHA = TO_DATE(:fecha, 'DD-MM-YYYY HH24:MI')`,
              {
                energia: row.energia_del_mr,
                id: row.idRespaldo,
                fecha: row.fecha,
                tipoEnergia: energiaDel,
              }
            );
          }

          // Update energia_rec_mr (MR - respaldo)
          if (
            row.energia_rec_mr !== undefined &&
            row.idRespaldo !== undefined
          ) {
            await connection.execute(
              `UPDATE MCAM_MEDICIONES 
               SET DATO_ENERGIA = :energia, ORIGEN = 'R', REPORTE_VALIDACION = NULL
               WHERE TIPO_ENERGIA = :tipoEnergia
                 AND ID_MEDIDOR = :id
                 AND FECHA = TO_DATE(:fecha, 'DD-MM-YYYY HH24:MI')`,
              {
                energia: row.energia_rec_mr,
                id: row.idRespaldo,
                fecha: row.fecha,
                tipoEnergia: energiaRec,
              }
            );
          }
        } catch (updateError) {
          console.error("Error updating mediciones:", updateError);
          updateSuccess = false;
          break; // Exit the loop on first error
        }
      }
    }

    if (!updateSuccess) {
      await connection.rollback();
      return res
        .status(500)
        .json({ message: "Error al actualizar las mediciones" });
    }

    // Only delete if all updates succeeded
    const deleteQuery = `DELETE FROM MCAM_RESUMEN_VALIDACIONES WHERE ID = :id`;
    const result = await connection.execute(deleteQuery, [reportId]);

    // Commit the transaction if everything succeeded
    await connection.commit();

    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: "Reporte no encontrado" });
    }

    res.json({
      message: "Reporte eliminado y datos actualizados correctamente",
    });
  } catch (error) {
    // Rollback on any error
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Error during rollback:", rollbackError);
      }
    }
    console.error("Error al procesar el reporte:", error);
    res.status(500).json({ message: "Error al procesar el reporte" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error("Error al cerrar la conexión:", error);
      }
    }
  }
});

module.exports = router;
