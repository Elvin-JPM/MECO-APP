const express = require("express");
const { getConnection } = require("../db");
const router = express.Router();
const oracledb = require("oracledb");
const { query, validationResult } = require("express-validator");

///////////////////////////////////////////////////

router.get("/statistics", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let connection;
  try {
    const { medidorPrincipal, medidorRespaldo, fechaInicial, fechaFinal } =
      req.query;

    console.log(req.query);

    // let energiaGenerada = "";
    // let energiaConsumida = "";

    // if (tipoMedida === "energiaActivaAcumulada") {
    //   energiaGenerada = "KWH_DEL";
    //   energiaConsumida = "KWH_REC";
    // } else if (tipoMedida === "energiaReactivaAcumulada") {
    //   energiaGenerada = "KVARH_DEL";
    //   energiaConsumida = "KVARH_REC";
    // } else if (tipoMedida === "energiaActivaIntervalo") {
    //   energiaGenerada = "KWH_DEL_INT";
    //   energiaConsumida = "KWH_REC_INT";
    // } else {
    //   energiaGenerada = "KVARH_DEL_INT";
    //   energiaConsumida = "KVARH_REC_INT";
    // }

    // const fechaInicialFormatted = fechaInicial.replace("T", " ").slice(0, 16);
    // const fechaFinalFormatted = fechaFinal.replace("T", " ").slice(0, 16);

    // Input validation
    if (!medidorPrincipal || !medidorRespaldo || !fechaInicial || !fechaFinal) {
      return res.status(422).json({ error: "Invalid or missing parameters" });
    }

    console.log("Starting statistics endpoint");
    connection = await getConnection();
    console.log("Connection established");

    // Build the query
    let countRegistersMP = `
        SELECT COUNT(*) AS CUENTA FROM E##POSADAS.MCAM_MEDICIONES
        WHERE ID_MEDIDOR = :medidorPrincipal
        AND TIPO_ENERGIA IN  ('KWH_DEL', 'KWH_REC') 
        AND FECHA BETWEEN TO_DATE(:fechaInicial, 'YYYY-MM-DD HH24:MI')
        AND TO_DATE(:fechaFinal, 'YYYY-MM-DD HH24:MI')

        UNION ALL

        SELECT COUNT(*) AS CONTEO_CERO FROM E##POSADAS.MCAM_MEDICIONES
        WHERE ID_MEDIDOR = :medidorPrincipal
        AND TIPO_ENERGIA IN  ('KWH_DEL', 'KWH_REC')
        AND DATO_ENERGIA = 0
        AND FECHA BETWEEN TO_DATE(:fechaInicial, 'YYYY-MM-DD HH24:MI')
        AND TO_DATE(:fechaFinal, 'YYYY-MM-DD HH24:MI')
        
    `;

    let countRegistersMR = `
        SELECT COUNT(*) AS CUENTA FROM E##POSADAS.MCAM_MEDICIONES
        WHERE ID_MEDIDOR = :medidorRespaldo
        AND TIPO_ENERGIA IN  ('KWH_DEL', 'KWH_REC') 
        AND FECHA BETWEEN TO_DATE(:fechaInicial, 'YYYY-MM-DD HH24:MI')
        AND TO_DATE(:fechaFinal, 'YYYY-MM-DD HH24:MI')

        UNION ALL

        SELECT COUNT(*) AS CONTEO_CERO FROM E##POSADAS.MCAM_MEDICIONES
        WHERE ID_MEDIDOR = :medidorRespaldo
        AND TIPO_ENERGIA IN  ('KWH_DEL', 'KWH_REC') 
        AND FECHA BETWEEN TO_DATE(:fechaInicial, 'YYYY-MM-DD HH24:MI')
        AND TO_DATE(:fechaFinal, 'YYYY-MM-DD HH24:MI')
        AND DATO_ENERGIA = 0
    `;

    let totalPowerMP = `
        SELECT ROUND(SUM(DATO_ENERGIA),2) AS KWH_INT FROM E##POSADAS.MCAM_MEDICIONES
        WHERE TIPO_ENERGIA = 'KWH_DEL_INT'
        AND ID_MEDIDOR = :medidorPrincipal
        AND FECHA BETWEEN TO_DATE(:fechaInicial, 'YYYY-MM-DD HH24:MI')
        AND TO_DATE(:fechaFinal, 'YYYY-MM-DD HH24:MI')

        UNION ALL

        SELECT ROUND(SUM(DATO_ENERGIA),2) AS KWH_INT FROM E##POSADAS.MCAM_MEDICIONES
        WHERE TIPO_ENERGIA = 'KWH_REC_INT'
        AND ID_MEDIDOR = :medidorPrincipal
        AND FECHA BETWEEN TO_DATE(:fechaInicial, 'YYYY-MM-DD HH24:MI')
        AND TO_DATE(:fechaFinal, 'YYYY-MM-DD HH24:MI')
      `;

    let totalPowerMR = `
        SELECT ROUND(SUM(DATO_ENERGIA),2) AS KWH_INT FROM E##POSADAS.MCAM_MEDICIONES
        WHERE TIPO_ENERGIA = 'KWH_DEL_INT'
        AND ID_MEDIDOR = :medidorRespaldo
        AND FECHA BETWEEN TO_DATE(:fechaInicial, 'YYYY-MM-DD HH24:MI')
        AND TO_DATE(:fechaFinal, 'YYYY-MM-DD HH24:MI')

        UNION ALL

        SELECT ROUND(SUM(DATO_ENERGIA),2) AS KWH_INT FROM E##POSADAS.MCAM_MEDICIONES
        WHERE TIPO_ENERGIA = 'KWH_REC_INT'
        AND ID_MEDIDOR = :medidorRespaldo
        AND FECHA BETWEEN TO_DATE(:fechaInicial, 'YYYY-MM-DD HH24:MI')
        AND TO_DATE(:fechaFinal, 'YYYY-MM-DD HH24:MI')
      `;

    let profileMP = `
        SELECT TO_CHAR(FECHA, 'DD-MM-YYYY HH24:MI'), DATO_ENERGIA, TIPO_ENERGIA FROM E##POSADAS.MCAM_MEDICIONES
        WHERE TIPO_ENERGIA IN ('KWH_DEL_INT', 'KWH_REC_INT')
        AND ID_MEDIDOR = :medidorPrincipal
        AND FECHA BETWEEN TO_DATE(:fechaInicial, 'YYYY-MM-DD HH24:MI')
        AND TO_DATE(:fechaFinal, 'YYYY-MM-DD HH24:MI')
        ORDER BY FECHA
      `;

    let profileMR = `
        SELECT TO_CHAR(FECHA, 'DD-MM-YYYY HH24:MI'), DATO_ENERGIA, TIPO_ENERGIA FROM E##POSADAS.MCAM_MEDICIONES
        WHERE TIPO_ENERGIA IN ('KWH_DEL_INT', 'KWH_REC_INT')
        AND ID_MEDIDOR = :medidorRespaldo
        AND FECHA BETWEEN TO_DATE(:fechaInicial, 'YYYY-MM-DD HH24:MI')
        AND TO_DATE(:fechaFinal, 'YYYY-MM-DD HH24:MI')
        ORDER BY FECHA
      `;

    // Execute the query
    const resultCountRegistersMP = await connection.execute(countRegistersMP, {
      medidorPrincipal,
      fechaInicial,
      fechaFinal,
      medidorPrincipal,
      fechaInicial,
      fechaFinal,
    });

    const resultCountRegistersMR = await connection.execute(countRegistersMR, {
      medidorRespaldo,
      fechaInicial,
      fechaFinal,
      medidorRespaldo,
      fechaInicial,
      fechaFinal,
    });

    const resultTotalPowerMP = await connection.execute(totalPowerMP, {
      medidorPrincipal,
      fechaInicial,
      fechaFinal,
      medidorPrincipal,
      fechaInicial,
      fechaFinal,
    });

    const resultTotalPowerMR = await connection.execute(totalPowerMR, {
      medidorRespaldo,
      fechaInicial,
      fechaFinal,
      medidorRespaldo,
      fechaInicial,
      fechaFinal,
    });

    const resultProfileMP = await connection.execute(profileMP, {
      medidorPrincipal,
      fechaInicial,
      fechaFinal,
      medidorPrincipal,
      fechaInicial,
      fechaFinal,
    });

    const resultProfileMR = await connection.execute(profileMR, {
      medidorRespaldo,
      fechaInicial,
      fechaFinal,
      medidorRespaldo,
      fechaInicial,
      fechaFinal,
    });

    const countMP = {};
    const countMR = {};
    const totPowerMP = {};
    const totPowerMR = {};

    resultCountRegistersMP.rows.forEach((element, index) => {
      if (index === 0) {
        countMP.regTotales = element[0];
      } else {
        countMP.regCero = element[0];
      }
    });

    resultCountRegistersMR.rows.forEach((element, index) => {
      if (index === 0) {
        countMR.regTotales = element[0];
      } else {
        countMR.regCero = element[0];
      }
    });

    resultTotalPowerMP.rows.forEach((element, index) => {
      if (index === 0) {
        totPowerMP.del = element[0];
      } else {
        totPowerMP.rec = element[0];
      }
    });

    resultTotalPowerMR.rows.forEach((element, index) => {
      if (index === 0) {
        totPowerMR.del = element[0];
      } else {
        totPowerMR.rec = element[0];
      }
    });

    const profMP = resultProfileMP.rows.map(
      ([FECHA, DATO_ENERGIA, TIPO_ENERGIA]) => ({
        fecha: FECHA,
        dato_energia: DATO_ENERGIA,
        tipo_energia: TIPO_ENERGIA,
      })
    );

    const profMR = resultProfileMR.rows.map(
      ([FECHA, DATO_ENERGIA, TIPO_ENERGIA]) => ({
        fecha: FECHA,
        dato_energia: DATO_ENERGIA,
        tipo_energia: TIPO_ENERGIA,
      })
    );

    console.log("Query executed successfully", "Data: ", countMP, countMR);
    console.log(
      "Query executed successfully",
      "Data: ",
      totPowerMP,
      totPowerMR
    );
    console.log("Query executed successfully", "Data: ", profMP, profMR);

    res.json({
      data: { countMP, countMR, totPowerMP, totPowerMR, profMP, profMR },
    });
  } catch (error) {
    console.error("Database query error:", error.message);
    res.status(500).json({ error: "Failed to fetch statistics" });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
