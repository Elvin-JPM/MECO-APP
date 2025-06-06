const express = require("express");
const { getConnection } = require("../db");
const router = express.Router();

router.get("/generacion_horaria", async (req, res) => {
  const { fecha } = req.query;

  // Validate required query parameter
  if (!fecha) {
    return res
      .status(400)
      .json({ error: "The 'fecha' query parameter is required" });
  }

  // Validate fecha format (basic check for YYYY-MM-DD format)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return res
      .status(400)
      .json({ error: "Invalid date format. Please use YYYY-MM-DD" });
  }

  let connection;
  try {
    connection = await getConnection();

    // Using parameterized query to prevent SQL injection
    const sqlQuery = `
      SELECT DAY_DATE || ' ' || HOUR_INX AS FECHA, 
             ROUND(SUM(C0432_SAMPL_VALUE1_R)/60, 4) AS "GENERACION"
      FROM T0401_ACCOUNTS@DWH_X10 A
      JOIN FACT_SCADA_T0432_DATA@DWH_X10 B ON A.C0401_AID = B.C0401_AID
      WHERE DAY_DATE = TO_DATE(:fecha, 'YYYY-MM-DD')
      AND C0401_NAME = 'H01IN_SISTEMA.TOTAL_POTAC'
      AND A.ACTIVE_IND = 'Y'
      GROUP BY DAY_DATE, HOUR_INX
      ORDER BY DAY_DATE, HOUR_INX
    `;

    const result = await connection.execute(sqlQuery, [fecha]);

    if (!result.rows || result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No data found for the specified date" });
    }

    console.log(
      `Successfully retrieved ${result.rows.length} records for date: ${fecha}`
    );
    res.json({
      date: fecha,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({
      error: "Failed to fetch generation data",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error("Error closing connection:", error);
      }
    }
  }
});

module.exports = router;
