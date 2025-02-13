const express = require("express");
const { getConnection } = require("../db");

const router = express.Router();

router.put("/updateMeasures", async (req, res) => {
  const reqBody = req.body; // Assuming req.body is an array of object
  const rowsToEdit = reqBody.filter(
    (item) => typeof item === "object" && item !== null
  );
  console.log("Rows to edit:", rowsToEdit);
  const reportName = reqBody.filter((item) => typeof item === "string")[0];
  console.log(reportName);

  let connection;
  try {
    connection = await getConnection();

    // Use a for...of loop for async/await
    for (const rowToEdit of rowsToEdit) {
      // Preprocess numeric values to remove commas
      const energia_del_mp_new = parseFloat(
        rowToEdit.energia_del_mp_new.replace(/,/g, "")
      );
      const energia_rec_mp_new = parseFloat(
        rowToEdit.energia_rec_mp_new.replace(/,/g, "")
      );
      const energia_del_mr_new = parseFloat(
        rowToEdit.energia_del_mr_new.replace(/,/g, "")
      );
      const energia_rec_mr_new = parseFloat(
        rowToEdit.energia_rec_mr_new.replace(/,/g, "")
      );

      console.log("Datos nuevos sin coma: ");
      console.log(energia_del_mp_new);
      console.log(energia_rec_mp_new);
      console.log(energia_rec_mr_new);
      console.log(energia_del_mr_new);

      let energiaGenerada = "";
      let energiaConsumida = "";

      if (rowToEdit.tipoMedicion === "energiaActivaAcumulada") {
        energiaGenerada = "KWH_DEL";
        energiaConsumida = "KWH_REC";
      } else if (rowToEdit.tipoMedicion === "energiaReactivaAcumulada") {
        energiaGenerada = "KVARH_DEL";
        energiaConsumida = "KVARH_REC";
      } else if (rowToEdit.tipoMedicion === "energiaActivaIntervalo") {
        energiaGenerada = "KWH_DEL_INT";
        energiaConsumida = "KWH_REC_INT";
      } else {
        energiaGenerada = "KVARH_DEL_INT";
        energiaConsumida = "KVARH_REC_INT";
      }

      console.log(
        "Comparacion kwh_del_mp: ",
        parseFloat(rowToEdit.energia_del_mp) === energia_del_mp_new,
        parseFloat(rowToEdit.energia_del_mp),
        energia_del_mp_new
      );
      console.log(
        "Comparacion kwh_rec_mp: ",
        parseFloat(rowToEdit.energia_rec_mp) === energia_rec_mp_new,
        parseFloat(rowToEdit.energia_rec_mp),
        energia_rec_mp_new
      );
      console.log(
        "Comparacion kwh_del_mr: ",
        parseFloat(rowToEdit.energia_del_mr) === energia_del_mr_new,
        parseFloat(rowToEdit.energia_del_mr),
        energia_del_mr_new
      );
      console.log(
        "Comparacion kwh_rec_mr: ",
        parseFloat(rowToEdit.energia_rec_mr) === energia_rec_mr_new,
        parseFloat(rowToEdit.energia_rec_mr),
        energia_rec_mr_new
      );

      let queryPrincipal = `
  BEGIN
    UPDATE MCAM_MEDICIONES
    SET
      DATO_ENERGIA = :energia_del_mp_new
      ${
        parseFloat(rowToEdit.energia_del_mp) !== energia_del_mp_new ||
        rowToEdit.filaValidadaCompleta
          ? ", ORIGEN = 'VS', REPORTE_VALIDACION = :reportName"
          : ""
      }
    WHERE ID_MEDIDOR = :idPrincipal
    AND TIPO_ENERGIA = :energiaGenerada
    AND FECHA = TO_DATE(:fecha, 'DD-MM-YYYY HH24:MI');

    UPDATE MCAM_MEDICIONES
    SET
      DATO_ENERGIA = :energia_rec_mp_new
      ${
        parseFloat(rowToEdit.energia_rec_mp) !== energia_rec_mp_new ||
        rowToEdit.filaValidadaCompleta
          ? ", ORIGEN = 'VS', REPORTE_VALIDACION = :reportName"
          : ""
      }
    WHERE ID_MEDIDOR = :idPrincipal
    AND TIPO_ENERGIA = :energiaConsumida
    AND FECHA = TO_DATE(:fecha, 'DD-MM-YYYY HH24:MI');
  END;
`;

      // Build parameters dynamically
      let bindParamsPrincipal = {
        energia_del_mp_new,
        energia_rec_mp_new,
        energiaGenerada,
        energiaConsumida,
        idPrincipal: rowToEdit.idPrincipal,
        fecha: rowToEdit.fecha,
      };

      if (
        parseFloat(rowToEdit.energia_del_mp) !== energia_del_mp_new ||
        rowToEdit.filaValidadaCompleta
      ) {
        bindParamsPrincipal.reportName = reportName;
      }

      if (
        parseFloat(rowToEdit.energia_rec_mp) !== energia_rec_mp_new ||
        rowToEdit.filaValidadaCompleta
      ) {
        bindParamsPrincipal.reportName = reportName;
      }

      // Execute with the correct number of parameters
      await connection.execute(queryPrincipal, bindParamsPrincipal, {
        autoCommit: false,
      });

      let queryRespaldo = `
  BEGIN
    UPDATE MCAM_MEDICIONES
    SET
      DATO_ENERGIA = :energia_del_mr_new
      ${
        parseFloat(rowToEdit.energia_del_mr) !== energia_del_mr_new ||
        rowToEdit.filaValidadaCompleta
          ? ", ORIGEN = 'VS', REPORTE_VALIDACION = :reportName"
          : ""
      }
    WHERE ID_MEDIDOR = :idRespaldo
    AND TIPO_ENERGIA = :energiaGenerada
    AND FECHA = TO_DATE(:fecha, 'DD-MM-YYYY HH24:MI');

    UPDATE MCAM_MEDICIONES
    SET
      DATO_ENERGIA = :energia_rec_mr_new
      ${
        parseFloat(rowToEdit.energia_rec_mr) !==
          parseFloat(energia_rec_mr_new) || rowToEdit.filaValidadaCompleta
          ? ", ORIGEN = 'VS', REPORTE_VALIDACION = :reportName"
          : ""
      }
    WHERE ID_MEDIDOR = :idRespaldo
    AND TIPO_ENERGIA = :energiaConsumida
    AND FECHA = TO_DATE(:fecha, 'DD-MM-YYYY HH24:MI');
  END;
`;

      let bindParamsRespaldo = {
        energia_del_mr_new,
        energia_rec_mr_new,
        energiaGenerada,
        energiaConsumida,
        idRespaldo: rowToEdit.idRespaldo,
        fecha: rowToEdit.fecha,
      };

      if (
        parseFloat(rowToEdit.energia_del_mr) !== energia_del_mr_new ||
        rowToEdit.filaValidadaCompleta
      ) {
        bindParamsRespaldo.reportName = reportName;
      }

      if (
        parseFloat(rowToEdit.energia_rec_mr) !== energia_rec_mr_new ||
        rowToEdit.filaValidadaCompleta
      ) {
        bindParamsRespaldo.reportName = reportName;
      }

      // Execute with the correct number of parameters
      await connection.execute(queryRespaldo, bindParamsRespaldo, {
        autoCommit: false,
      });
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
