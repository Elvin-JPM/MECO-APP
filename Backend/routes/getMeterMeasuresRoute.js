const express = require("express");
const { getConnection } = require("../db");
const router = express.Router();
const oracledb = require("oracledb");

///////////////////////////////////////////////////

router.get("/measures", async (req, res) => {
  let connection;
  try {
    const {
      medidorPrincipal,
      medidorRespaldo,
      fechaInicial,
      fechaFinal,
      page = 1,
      limit = 30,
    } = req.query;

    const fechaInicialFormatted = fechaInicial.replace("T", " ").slice(0, 16);
    const fechaFinalFormatted = fechaFinal.replace("T", " ").slice(0, 16);

    // Input validation
    if (
      !medidorPrincipal ||
      !medidorRespaldo ||
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
          AND FECHA BETWEEN TO_DATE(:fechaInicial, 'YYYY-MM-DD HH24:MI') AND TO_DATE(:fechaFinal, 'YYYY-MM-DD HH24:MI')
      ) MP
      INNER JOIN (
        SELECT TO_CHAR(FECHA, 'DD-MM-YYYY HH24:MI') AS FECHA
        FROM MCAM_MEDICIONES
        WHERE ID_MEDIDOR = :medidorRespaldo
          AND FECHA BETWEEN TO_DATE(:fechaInicial, 'YYYY-MM-DD HH24:MI') AND TO_DATE(:fechaFinal, 'YYYY-MM-DD HH24:MI')
      ) MR 
      ON MP.FECHA = MR.FECHA
    `;
    const countResult = await connection.execute(countQuery, {
      medidorPrincipal,
      medidorRespaldo,
      fechaInicial: fechaInicialFormatted,
      fechaFinal: fechaFinalFormatted,
    });
    const totalCount = countResult.rows[0][0];

    // Paginated query
    const paginatedQuery = `
      SELECT FECHA,
            KWH_DEL_MP, KWH_REC_MP, KVARH_DEL_MP, KVARH_REC_MP, KWH_DEL_MR, KWH_REC_MR, KVARH_DEL_MR, KVARH_REC_MR,
            KWH_DEL_INT_MP, KWH_REC_INT_MP, KVARH_DEL_INT_MP, KVARH_REC_INT_MP, KWH_DEL_INT_MR, KWH_REC_INT_MR, KVARH_DEL_INT_MR, KVARH_REC_INT_MR

      FROM (
        SELECT MP.FECHA,
               MP.KWH_DEL AS KWH_DEL_MP, MP.KWH_REC AS KWH_REC_MP, MP.KVARH_DEL AS KVARH_DEL_MP, MP.KVARH_REC AS KVARH_REC_MP,
               MR.KWH_DEL AS KWH_DEL_MR, MR.KWH_REC AS KWH_REC_MR, MR.KVARH_DEL AS KVARH_DEL_MR, MR.KVARH_REC AS KVARH_REC_MR,
               MP.KWH_DEL_INT AS KWH_DEL_INT_MP, MP.KWH_REC_INT AS KWH_REC_INT_MP, MP.KVARH_DEL_INT AS KVARH_DEL_INT_MP, MP.KVARH_REC_INT AS KVARH_REC_INT_MP,
               MR.KWH_DEL_INT AS KWH_DEL_INT_MR, MR.KWH_REC_INT AS KWH_REC_INT_MR, MR.KVARH_DEL_INT AS KVARH_DEL_INT_MR, MR.KVARH_REC_INT AS KVARH_REC_INT_MR
        FROM (
          SELECT TO_CHAR(FECHA, 'DD-MM-YYYY HH24:MI') AS FECHA,
          KWH_DEL, KWH_REC, KVARH_DEL, KVARH_REC, KWH_DEL_INT, KWH_REC_INT, KVARH_DEL_INT, KVARH_REC_INT
          FROM MCAM_MEDICIONES
          WHERE ID_MEDIDOR = :medidorPrincipal
            AND FECHA BETWEEN TO_DATE(:fechaInicial, 'YYYY-MM-DD HH24:MI') AND TO_DATE(:fechaFinal, 'YYYY-MM-DD HH24:MI')
        ) MP
        INNER JOIN (
          SELECT TO_CHAR(FECHA, 'DD-MM-YYYY HH24:MI') AS FECHA,
          KWH_DEL, KWH_REC, KVARH_DEL, KVARH_REC, KWH_DEL_INT, KWH_REC_INT, KVARH_DEL_INT, KVARH_REC_INT
          FROM MCAM_MEDICIONES
          WHERE ID_MEDIDOR = :medidorRespaldo
            AND FECHA BETWEEN TO_DATE(:fechaInicial, 'YYYY-MM-DD HH24:MI') AND TO_DATE(:fechaFinal, 'YYYY-MM-DD HH24:MI')
        ) MR 
        ON MP.FECHA = MR.FECHA
      )
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;
    const result = await connection.execute(paginatedQuery, {
      medidorPrincipal,
      medidorRespaldo,
      fechaInicial: fechaInicialFormatted,
      fechaFinal: fechaFinalFormatted,
      offset,
      limit: parseInt(limit),
    });

    const measures = result.rows.map(
      ([
        FECHA,
        KWH_DEL_MP,
        KWH_REC_MP,
        KVARH_DEL_MP,
        KVARH_REC_MP,
        KWH_DEL_MR,
        KWH_REC_MR,
        KVARH_DEL_MR,
        KVARH_REC_MR,
        KWH_DEL_INT_MP,
        KWH_REC_INT_MP,
        KVARH_DEL_INT_MP,
        KVARH_REC_INT_MP,
        KWH_DEL_INT_MR,
        KWH_REC_INT_MR,
        KVARH_DEL_INT_MR,
        KVARH_REC_INT_MR,
      ]) => ({
        fecha: FECHA,
        kwh_del_mp: KWH_DEL_MP,
        kwh_rec_mp: KWH_REC_MP,
        kvarh_del_mp: KVARH_DEL_MP,
        kvarh_rec_mp: KVARH_REC_MP,
        kwh_del_mr: KWH_DEL_MR,
        kwh_rec_mr: KWH_REC_MR,
        kvarh_del_mr: KVARH_DEL_MR,
        kvarh_rec_mr: KVARH_REC_MR,
        kwh_del_int_mp: KWH_DEL_INT_MP,
        kwh_rec_int_mp: KWH_REC_INT_MP,
        kvarh_del_int_mp: KVARH_DEL_INT_MP,
        kvarh_rec_int_mp: KVARH_REC_INT_MP,
        kwh_del_int_mr: KWH_DEL_INT_MR,
        kwh_rec_int_mr: KWH_REC_INT_MR,
        kvarh_del_int_mr: KVARH_DEL_INT_MR,
        kvarh_rec_int_mr: KVARH_REC_INT_MR,
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
