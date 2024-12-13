// const express = require("express");
// const { getConnection } = require("../db");
// const router = express.Router();
// const oracledb = require("oracledb");

// router.get("/meters", async (req, res) => {
//   let connection;
//   try {
//     connection = await getConnection();
//     const result = await connection.execute(
//       "SELECT ID, ID_PUNTO, NOMBRE_PLANTA, IP, NOMBRE_PUNTO, SUBESTACION, SERIE, FOTO \
//       FROM MCAM_METERS_OWNERS \
//       ORDER BY NOMBRE_PLANTA, IP \
//       FETCH FIRST 20 ROWS ONLY",
//       [],
//       { fetchInfo: { FOTO: { type: oracledb.BUFFER } } }
//     );
//     const meters = result.rows.map(
//       ([
//         id,
//         id_punto,
//         nombre_planta,
//         ip,
//         nombre_punto,
//         subestacion,
//         serie,
//         foto,
//       ]) => ({
//         id,
//         id_punto,
//         nombre_planta,
//         ip,
//         nombre_punto,
//         subestacion,
//         serie,
//         foto: foto && Buffer.isBuffer(foto) ? foto.toString("base64") : null,
//       })
//     );
//     res.json(meters);
//   } catch (error) {
//     console.error("Database query error:", error.message || "Unknown error");
//     res.status(500).json({ error: "Failed to fetch meters" });
//   } finally {
//     if (connection) {
//       try {
//         await connection.close();
//       } catch (error) {
//         console.error("Error closing connection: ", err.message || error);
//       }
//     }
//   }
// });

// module.exports = router;

/// CODE WITH PAGINATION

const express = require("express");
const { getConnection } = require("../db");
const router = express.Router();
const oracledb = require("oracledb");

router.get("/meters", async (req, res) => {
  let connection;
  try {
    // Extract pagination parameters with defaults
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    connection = await getConnection();

    // Total count query to get the number of records
    const countResult = await connection.execute(
      "SELECT COUNT(*) AS totalCount FROM MCAM_METERS_OWNERS"
    );
    const totalCount = countResult.rows[0][0];

    // Query for paginated results
    const paginatedQuery = `
      SELECT ID, ID_PUNTO, NOMBRE_PLANTA, IP, NOMBRE_PUNTO, SUBESTACION, SERIE, FOTO
      FROM (
        SELECT a.*, ROWNUM rnum
        FROM (
          SELECT ID, ID_PUNTO, NOMBRE_PLANTA, IP, NOMBRE_PUNTO, SUBESTACION, SERIE, FOTO
          FROM MCAM_METERS_OWNERS
          ORDER BY NOMBRE_PLANTA, IP
        ) a
        WHERE ROWNUM <= :maxRow
      )
      WHERE rnum > :offset
    `;

    const result = await connection.execute(
      paginatedQuery,
      {
        maxRow: offset + parseInt(limit), // Rows up to the limit
        offset: offset, // Skip rows up to the offset
      },
      { fetchInfo: { FOTO: { type: oracledb.BUFFER } } }
    );

    const meters = result.rows.map(
      ([
        id,
        id_punto,
        nombre_planta,
        ip,
        nombre_punto,
        subestacion,
        serie,
        foto,
      ]) => ({
        id,
        id_punto,
        nombre_planta,
        ip,
        nombre_punto,
        subestacion,
        serie,
        foto: foto && Buffer.isBuffer(foto) ? foto.toString("base64") : null,
      })
    );

    res.json({
      data: meters,
      currentPage: parseInt(page),
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error("Database query error:", error.message || "Unknown error");
    res.status(500).json({ error: "Failed to fetch meters" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error("Error closing connection: ", error.message || error);
      }
    }
  }
});

module.exports = router;
