const express = require("express");
const { getConnection } = require("../db");
const router = express.Router();
const oracledb = require("oracledb");

///////////////////////////////////////////////////

router.get("/measures", async (req, res) => {
  let connection;
  try {
    const {
      tipoMedida,
      medidorPrincipal,
      medidorRespaldo,
      fechaInicial,
      fechaFinal,
      page = 1,
      limit = 30,
    } = req.query;

    //const { page } = req.params;
    console.log("page received: ", page);

    console.log("Data for table: ", req.query);

    let energiaGenerada = "";
    let energiaConsumida = "";

    if (tipoMedida === "energiaActivaAcumulada") {
      energiaGenerada = "KWH_DEL";
      energiaConsumida = "KWH_REC";
    } else if (tipoMedida === "energiaReactivaAcumulada") {
      energiaGenerada = "KVARH_DEL";
      energiaConsumida = "KVARH_REC";
    } else if (tipoMedida === "energiaActivaIntervalo") {
      energiaGenerada = "KWH_DEL_INT";
      energiaConsumida = "KWH_REC_INT";
    } else {
      energiaGenerada = "KVARH_DEL_INT";
      energiaConsumida = "KVARH_REC_INT";
    }

    const fechaInicialFormatted = fechaInicial.replace("T", " ").slice(0, 16);
    const fechaFinalFormatted = fechaFinal.replace("T", " ").slice(0, 16);

    console.log(
      "Fechas formateadas: ",
      fechaInicialFormatted,
      fechaFinalFormatted
    );

    // Input validation
    if (
      !medidorPrincipal ||
      !medidorRespaldo ||
      !tipoMedida ||
      !fechaInicial ||
      !fechaFinal ||
      (isNaN(page) && page !== -1) || // Allow -1 for page
      (isNaN(limit) && limit !== "all")
    ) {
      return res.status(422).json({ error: "Invalid or missing parameters" });
    }

    connection = await getConnection();

    // Total count query
    const countQuery = `
      SELECT COUNT(*) AS TOTAL_COUNT
      FROM (
        SELECT TO_CHAR(FECHA, 'DD-MM-YYYY HH24:MI') AS FECHA
        FROM MCAM_MEDICIONES
        WHERE ID_MEDIDOR = :medidorPrincipal
        AND TIPO_ENERGIA = :energiaGenerada
          AND FECHA BETWEEN TO_DATE(:fechaInicial, 'YYYY-MM-DD HH24:MI') AND TO_DATE(:fechaFinal, 'YYYY-MM-DD HH24:MI')
      ) MP_EG
       INNER JOIN (
        SELECT TO_CHAR(FECHA, 'DD-MM-YYYY HH24:MI') AS FECHA
        FROM MCAM_MEDICIONES
        WHERE ID_MEDIDOR = :medidorPrincipal
        AND TIPO_ENERGIA = :energiaConsumida
          AND FECHA BETWEEN TO_DATE(:fechaInicial, 'YYYY-MM-DD HH24:MI') AND TO_DATE(:fechaFinal, 'YYYY-MM-DD HH24:MI')
      ) MP_EC 
      ON MP_EG.FECHA = MP_EC.FECHA
      INNER JOIN (
        SELECT TO_CHAR(FECHA, 'DD-MM-YYYY HH24:MI') AS FECHA
        FROM MCAM_MEDICIONES
        WHERE ID_MEDIDOR = :medidorRespaldo
        AND TIPO_ENERGIA = :energiaConsumida
          AND FECHA BETWEEN TO_DATE(:fechaInicial, 'YYYY-MM-DD HH24:MI') AND TO_DATE(:fechaFinal, 'YYYY-MM-DD HH24:MI')
      ) MR_EC 
      ON MP_EG.FECHA = MR_EC.FECHA
      INNER JOIN (
        SELECT TO_CHAR(FECHA, 'DD-MM-YYYY HH24:MI') AS FECHA
        FROM MCAM_MEDICIONES
        WHERE ID_MEDIDOR = :medidorRespaldo
        AND TIPO_ENERGIA = :energiaGenerada
          AND FECHA BETWEEN TO_DATE(:fechaInicial, 'YYYY-MM-DD HH24:MI') AND TO_DATE(:fechaFinal, 'YYYY-MM-DD HH24:MI')
      ) MR_EG
      ON MP_EG.FECHA = MR_EG.FECHA
    `;
    const countResult = await connection.execute(countQuery, {
      medidorPrincipal,
      medidorRespaldo,
      energiaGenerada,
      energiaConsumida,
      fechaInicial: fechaInicialFormatted,
      fechaFinal: fechaFinalFormatted,
    });
    const totalCount = countResult.rows[0][0];

    console.log("total count: ", totalCount);

    // Build the query
    let paginatedQuery = `
            SELECT 
            EG_MP.FECHA, 
            OR_DEL_MP, 
            ENERGIA_DEL_MP, 
            OR_REC_MP, 
            ENERGIA_REC_MP,
            OR_DEL_MR, 
            ENERGIA_DEL_MR, 
            OR_REC_MR, 
            ENERGIA_REC_MR
            FROM (
              (SELECT FECHA, ORIGEN AS OR_DEL_MP, DATO_ENERGIA AS ENERGIA_DEL_MP 
              FROM MCAM_MEDICIONES
              WHERE ID_MEDIDOR = :medidorPrincipal
              AND FECHA BETWEEN TO_DATE(:fechaInicialFormatted, 'YYYY-MM-DD HH24:MI') AND TO_DATE(:fechaFinalFormatted, 'YYYY-MM-DD HH24:MI')
              AND TIPO_ENERGIA = :energiaGenerada) EG_MP

              INNER JOIN

              (SELECT FECHA, ORIGEN AS OR_REC_MP, DATO_ENERGIA AS ENERGIA_REC_MP 
              FROM MCAM_MEDICIONES
              WHERE ID_MEDIDOR = :medidorPrincipal
              AND FECHA BETWEEN TO_DATE(:fechaInicialFormatted, 'YYYY-MM-DD HH24:MI') AND TO_DATE(:fechaFinalFormatted, 'YYYY-MM-DD HH24:MI')
              AND TIPO_ENERGIA = :energiaConsumida) EC_MP

              ON EG_MP.FECHA = EC_MP.FECHA

              INNER JOIN

              (SELECT FECHA, ORIGEN AS OR_DEL_MR, DATO_ENERGIA AS ENERGIA_DEL_MR 
              FROM MCAM_MEDICIONES
              WHERE ID_MEDIDOR = :medidorRespaldo
              AND FECHA BETWEEN TO_DATE(:fechaInicialFormatted, 'YYYY-MM-DD HH24:MI') AND TO_DATE(:fechaFinalFormatted, 'YYYY-MM-DD HH24:MI')
              AND TIPO_ENERGIA = :energiaGenerada) EG_MR

              ON EG_MP.FECHA = EG_MR.FECHA

              INNER JOIN

              (SELECT FECHA, ORIGEN AS OR_REC_MR, DATO_ENERGIA AS ENERGIA_REC_MR 
              FROM MCAM_MEDICIONES
              WHERE ID_MEDIDOR = :medidorRespaldo
              AND FECHA BETWEEN TO_DATE(:fechaInicialFormatted, 'YYYY-MM-DD HH24:MI') AND TO_DATE(:fechaFinalFormatted, 'YYYY-MM-DD HH24:MI')
              AND TIPO_ENERGIA = :energiaConsumida) EC_MR

              ON EG_MP.FECHA = EC_MR.FECHA
              )
              ORDER BY FECHA
    `;

    // Add pagination only if page is not -1
    if (page !== "-1") {
      // const offset = (page - 1) * parseInt(limit);
      paginatedQuery += ` OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`;
    }

    // Execute the query
    const result = await connection.execute(paginatedQuery, {
      medidorPrincipal,
      medidorRespaldo,
      fechaInicialFormatted,
      fechaFinalFormatted,
      energiaGenerada,
      energiaConsumida,
      ...(page !== "-1" && {
        offset: (page - 1) * parseInt(limit),
        limit: parseInt(limit),
      }),
    });

    const measures = result.rows.map(
      ([
        FECHA,
        OR_DEL_MP,
        ENERGIA_DEL_MP,
        OR_REC_MP,
        ENERGIA_REC_MP,
        OR_DEL_MR,
        ENERGIA_DEL_MR,
        OR_REC_MR,
        ENERGIA_REC_MR,
      ]) => ({
        fecha: FECHA,
        or_del_mp: OR_DEL_MP,
        energia_del_mp: ENERGIA_DEL_MP,
        or_rec_mp: OR_REC_MP,
        energia_rec_mp: ENERGIA_REC_MP,
        or_del_mr: OR_DEL_MR,
        energia_del_mr: ENERGIA_DEL_MR,
        or_rec_mr: OR_REC_MR,
        energia_rec_mr: ENERGIA_REC_MR,
      })
    );

    console.log(measures);

    res.json({
      data: measures,
      currentPage: page === "-1" ? 1 : parseInt(page),
      totalItems: totalCount,
      totalPages: page === "-1" ? 1 : Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error("Database query error:", error.message);
    res.status(500).json({ error: "Failed to fetch measures" });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
