const express = require("express");
const { getSqlServerConnection } = require("../sqlServerConnection"); // Import your SQL Server connection
const router = express.Router();
const sql = require("mssql");

router.get("/measures", async (req, res) => {
  let pool;
  try {
    console.log(req.query);
    const { medidorPrincipal, medidorRespaldo, fechaInicial, fechaFinal } =
      req.query;

    if (!medidorPrincipal || !medidorRespaldo || !fechaInicial || !fechaFinal) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    // Get the SQL Server connection pool
    pool = await getSqlServerConnection();

    // Execute the query
    const result = await pool
      .request()
      .input("medidorPrincipal", sql.Int, medidorPrincipal)
      .input("medidorRespaldo", sql.Int, medidorRespaldo)
      .input(
        "fechaInicial",
        sql.DateTime,
        new Date(`${fechaInicial}:00.000Z`).toISOString()
      )
      .input(
        "fechaFinal",
        sql.DateTime,
        new Date(`${fechaFinal}:00.000Z`).toISOString()
      )
      .query(
        `SELECT FECHA, EAG_MP, EAC_MP, EAG_MR, EAC_MR 
FROM (
    SELECT 
        FORMAT(MEDIDOR_PRINCIPAL.CONVERTED_DATE, 'dd-MM-yyyy HH:mm') AS FECHA,
        DATEPART(HOUR, MEDIDOR_PRINCIPAL.NON_FORMAT_DATE) AS HORA,
        MEDIDOR_PRINCIPAL.EAG AS EAG_MP,
        MEDIDOR_PRINCIPAL.EAC AS EAC_MP,
        FORMAT(MEDIDOR_RESPALDO.CONVERTED_DATE, 'dd-MM-yyyy HH:mm') AS RESPALDO_FECHA,
        DATEPART(HOUR, MEDIDOR_RESPALDO.NON_FORMAT_DATE) AS RESPALDO_HORA,
        MEDIDOR_RESPALDO.EAG AS EAG_MR,
        MEDIDOR_RESPALDO.EAC AS EAC_MR
    FROM (
        SELECT 
            DATEADD(HOUR, -6, EAG_MP.TimestampUTC) AS CONVERTED_DATE,
            DATEADD(HOUR, -6, EAG_MP.TimestampUTC) AS NON_FORMAT_DATE,
            EAG_MP.DisplayName AS MEDIDOR, 
            EAG_MP.[Energia Activa Generada] AS EAG, 
            EAC_MP.[Energia Activa Consumida] AS EAC 
        FROM (
            SELECT 
                A.TimestampUTC, 
                B.DisplayName, 
                A.Value AS 'Energia Activa Generada' 
            FROM dbo.DataLog2 A
            INNER JOIN dbo.Source B  
                ON A.SOURCEID = B.ID
            WHERE 
                SourceID = @medidorPrincipal -- ID DEL MEDIDOR
                AND QuantityID IN (129) -- ID DE ENERGIA ACTIVA GENERADA
        ) AS EAG_MP
        INNER JOIN (
            SELECT 
                A.TimestampUTC,
                A.Value AS 'Energia Activa Consumida', 
                SourceID 
            FROM dbo.DataLog2 A
            INNER JOIN dbo.Source B  
                ON A.SOURCEID = B.ID
            WHERE 
                SourceID = @medidorPrincipal -- ID DEL MEDIDDOR
                AND QuantityID = 139 -- ID DE ENERGIA ACTIVA CONSUMIDA
        ) AS EAC_MP
        ON EAG_MP.TimestampUTC = EAC_MP.TimestampUTC
        WHERE 
            DATEADD(HOUR, -6, EAG_MP.TimestampUTC) BETWEEN @fechaInicial AND @fechaFinal
    ) AS MEDIDOR_PRINCIPAL
    INNER JOIN (
        SELECT 
            DATEADD(HOUR, -6, EAG_MR.TimestampUTC) AS CONVERTED_DATE,
            DATEADD(HOUR, -6, EAG_MR.TimestampUTC) AS NON_FORMAT_DATE,
            EAG_MR.DisplayName AS MEDIDOR, 
            EAG_MR.[Energia Activa Generada] AS EAG, 
            EAC_MR.[Energia Activa Consumida] AS EAC 
        FROM (
            SELECT 
                A.TimestampUTC, 
                B.DisplayName, 
                A.Value AS 'Energia Activa Generada' 
            FROM dbo.DataLog2 A
            INNER JOIN dbo.Source B  
                ON A.SOURCEID = B.ID
            WHERE 
                SourceID = @medidorRespaldo -- ID DEL MEDIDOR
                AND QuantityID IN (129) -- ID DE ENERGIA ACTIVA GENERADA
            ) AS EAG_MR
        INNER JOIN (
            SELECT 
                A.TimestampUTC,
                A.Value AS 'Energia Activa Consumida', 
                SourceID 
            FROM dbo.DataLog2 A
            INNER JOIN dbo.Source B  
                ON A.SOURCEID = B.ID
            WHERE 
                SourceID = @medidorRespaldo -- ID DEL MEDIDDOR
                AND QuantityID = 139 -- ID DE ENERGIA ACTIVA CONSUMIDA
            ) AS EAC_MR
        ON EAG_MR.TimestampUTC = EAC_MR.TimestampUTC
        WHERE 
            DATEADD(HOUR, -6, EAG_MR.TimestampUTC) BETWEEN @fechaInicial AND @fechaFinal
    ) AS MEDIDOR_RESPALDO
    ON 
        FORMAT(MEDIDOR_PRINCIPAL.CONVERTED_DATE, 'dd-MM-yyyy HH:mm') = FORMAT(MEDIDOR_RESPALDO.CONVERTED_DATE, 'dd-MM-yyyy HH:mm')
) AS FINAL_RESULT
`
      );

    // Map the rows into the desired structure
    const integratedMeters = result.recordset.map((row) => ({
      fecha: row.FECHA,
      EAG_MP: row.EAG_MP,
      EAC_MP: row.EAC_MP,
      EAG_MR: row.EAG_MR,
      EAC_MR: row.EAC_MR,
    }));

    // Send the response
    res.status(200).json(integratedMeters);
  } catch (error) {
    console.error("Database query error: ", error);
    res.status(500).json({ error: "Failed to fetch measures" });
  }
});

module.exports = router;
