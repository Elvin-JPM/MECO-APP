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

    // Input validation
    if (
      !medidorPrincipal ||
      !medidorRespaldo ||
      !tipoMedida ||
      !fechaInicial ||
      !fechaFinal ||
      isNaN(page) ||
      isNaN(limit)
    ) {
      return res.status(422).json({ error: "Invalid or missing parameters" });
    }

    const offset = (page - 1) * parseInt(limit);
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

    // Paginated query
    // const paginatedQuery = `
    //   SELECT FECHA, ORIGEN_MP, ORIGEN_MR,
    //         KWH_DEL_MP, KWH_REC_MP, KVARH_DEL_MP, KVARH_REC_MP, KWH_DEL_MR, KWH_REC_MR, KVARH_DEL_MR, KVARH_REC_MR,
    //         KWH_DEL_INT_MP, KWH_REC_INT_MP, KVARH_DEL_INT_MP, KVARH_REC_INT_MP, KWH_DEL_INT_MR, KWH_REC_INT_MR, KVARH_DEL_INT_MR, KVARH_REC_INT_MR

    //   FROM (
    //     SELECT MP.FECHA,
    //            MP.ORIGEN AS ORIGEN_MP, MR.ORIGEN AS ORIGEN_MR,
    //            MP.KWH_DEL AS KWH_DEL_MP, MP.KWH_REC AS KWH_REC_MP, MP.KVARH_DEL AS KVARH_DEL_MP, MP.KVARH_REC AS KVARH_REC_MP,
    //            MR.KWH_DEL AS KWH_DEL_MR, MR.KWH_REC AS KWH_REC_MR, MR.KVARH_DEL AS KVARH_DEL_MR, MR.KVARH_REC AS KVARH_REC_MR,
    //            MP.KWH_DEL_INT AS KWH_DEL_INT_MP, MP.KWH_REC_INT AS KWH_REC_INT_MP, MP.KVARH_DEL_INT AS KVARH_DEL_INT_MP, MP.KVARH_REC_INT AS KVARH_REC_INT_MP,
    //            MR.KWH_DEL_INT AS KWH_DEL_INT_MR, MR.KWH_REC_INT AS KWH_REC_INT_MR, MR.KVARH_DEL_INT AS KVARH_DEL_INT_MR, MR.KVARH_REC_INT AS KVARH_REC_INT_MR
    //     FROM (
    //       SELECT TO_CHAR(FECHA, 'DD-MM-YYYY HH24:MI') AS FECHA,
    //       ORIGEN,
    //       KWH_DEL, KWH_REC, KVARH_DEL, KVARH_REC, KWH_DEL_INT, KWH_REC_INT, KVARH_DEL_INT, KVARH_REC_INT
    //       FROM MCAM_MEDICIONES
    //       WHERE ID_MEDIDOR = :medidorPrincipal
    //         AND FECHA BETWEEN TO_DATE(:fechaInicial, 'YYYY-MM-DD HH24:MI') AND TO_DATE(:fechaFinal, 'YYYY-MM-DD HH24:MI')
    //     ) MP
    //     INNER JOIN (
    //       SELECT TO_CHAR(FECHA, 'DD-MM-YYYY HH24:MI') AS FECHA,
    //       ORIGEN,
    //       KWH_DEL, KWH_REC, KVARH_DEL, KVARH_REC, KWH_DEL_INT, KWH_REC_INT, KVARH_DEL_INT, KVARH_REC_INT
    //       FROM MCAM_MEDICIONES
    //       WHERE ID_MEDIDOR = :medidorRespaldo
    //         AND FECHA BETWEEN TO_DATE(:fechaInicial, 'YYYY-MM-DD HH24:MI') AND TO_DATE(:fechaFinal, 'YYYY-MM-DD HH24:MI')
    //     ) MR
    //     ON MP.FECHA = MR.FECHA
    //   )
    //   OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    // `;

    const paginatedQuery = `
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
              AND FECHA BETWEEN TO_DATE(:fechaInicial, 'YYYY-MM-DD HH24:MI') AND TO_DATE(:fechaFinal, 'YYYY-MM-DD HH24:MI')
              AND TIPO_ENERGIA = :energiaGenerada) EG_MP

              INNER JOIN

              (SELECT FECHA, ORIGEN AS OR_REC_MP, DATO_ENERGIA AS ENERGIA_REC_MP 
              FROM MCAM_MEDICIONES
              WHERE ID_MEDIDOR = :medidorPrincipal
              AND FECHA BETWEEN TO_DATE(:fechaInicial, 'YYYY-MM-DD HH24:MI') AND TO_DATE(:fechaFinal, 'YYYY-MM-DD HH24:MI')
              AND TIPO_ENERGIA = :energiaConsumida) EC_MP

              ON EG_MP.FECHA = EC_MP.FECHA

              INNER JOIN

              (SELECT FECHA, ORIGEN AS OR_DEL_MR, DATO_ENERGIA AS ENERGIA_DEL_MR 
              FROM MCAM_MEDICIONES
              WHERE ID_MEDIDOR = :medidorRespaldo
              AND FECHA BETWEEN TO_DATE(:fechaInicial, 'YYYY-MM-DD HH24:MI') AND TO_DATE(:fechaFinal, 'YYYY-MM-DD HH24:MI')
              AND TIPO_ENERGIA = :energiaGenerada) EG_MR

              ON EG_MP.FECHA = EG_MR.FECHA

              INNER JOIN

              (SELECT FECHA, ORIGEN AS OR_REC_MR, DATO_ENERGIA AS ENERGIA_REC_MR 
              FROM MCAM_MEDICIONES
              WHERE ID_MEDIDOR = :medidorRespaldo
              AND FECHA BETWEEN TO_DATE(:fechaInicial, 'YYYY-MM-DD HH24:MI') AND TO_DATE(:fechaFinal, 'YYYY-MM-DD HH24:MI')
              AND TIPO_ENERGIA = :energiaConsumida) EC_MR

              ON EG_MP.FECHA = EC_MR.FECHA
              )
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;
    const result = await connection.execute(paginatedQuery, {
      medidorPrincipal,
      medidorRespaldo,
      fechaInicial: fechaInicialFormatted,
      fechaFinal: fechaFinalFormatted,
      energiaGenerada,
      energiaConsumida,
      offset,
      limit: parseInt(limit),
    });

    const measures = result.rows.map(
      ([
        FECHA,
        OR_DEL_MP, //ORIGEN DE LA ENERGIA ENVIADA MEDIDOR PRINCIPAL
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

    res.json({
      data: measures,
      currentPage: parseInt(page),
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error("Database query error:", error.message);
    res.status(500).json({ error: "Failed to fetch measures" });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
