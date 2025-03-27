const express = require("express");
const { getConnection } = require("../db");
const router = express.Router();

router.get("/demanda_nacional", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `
            WITH NODO_DATA AS (
            SELECT 
                DAY_DATE || ' ' || HOUR_INX AS FECHA, 
                HOUR_INX AS HORA, 
                ID_NODO,
                POTENCIA
            FROM E##POSADAS.MCAM_DATOS_DEMANDA_HORARIA_BARRA
            WHERE DAY_DATE = TRUNC(SYSDATE) - 2
        )
                SELECT 
                    N1.FECHA,
                    N1.HORA,
                    N1.POTENCIA AS "AGF-230kV",
                    N2.POTENCIA AS "AMT-230kV",
                    N3.POTENCIA AS "BCO-138kV",
                    N4.POTENCIA AS "BER-69kV",
                    N5.POTENCIA AS "BER-138kV",
                    N6.POTENCIA AS "BIJ-138kV",
                    N7.POTENCIA AS "BOR-138kV",
                    N8.POTENCIA AS "BVI-138kV",
                    N9.POTENCIA AS "CAH-69kV",
                    N10.POTENCIA AS "CAR-138kV",
                    N11.POTENCIA AS "CAT-69kV",
                    N12.POTENCIA AS "CCE-138kV",
                    N13.POTENCIA AS "CDA-138kV",
                    N14.POTENCIA AS "CDH-230kV",
                    N15.POTENCIA AS "CHI-69kV",
                    N16.POTENCIA AS "CHM-138kV",
                    N17.POTENCIA AS "CIR-138kV",
                    N18.POTENCIA AS "CJN-230kV",
                    N19.POTENCIA AS "CKP-138kV",
                    N20.POTENCIA AS "CRL-138kV",
                    N21.POTENCIA AS "CTE-138kV",
                    N22.POTENCIA AS "CUY 69KV_GEN",
                    N23.POTENCIA AS "CYG-138kV",
                    N24.POTENCIA AS "DAN-69kV",
                    N25.POTENCIA AS "EBI-230kV",
                    N26.POTENCIA AS "ELC-138kV",
                    N27.POTENCIA AS "ERA-69kV",
                    N28.POTENCIA AS "GMC-69kV",
                    N29.POTENCIA AS "GUA-138kV",
                    N30.POTENCIA AS "ISL-138kV",
                    N31.POTENCIA AS "JUT-69kV",
                    N32.POTENCIA AS "LFL-69kV",
                    N33.POTENCIA AS "LIM-69kV",
                    N34.POTENCIA AS "LLN-69kV",
                    N35.POTENCIA AS "LNZ-69kV",
                    N36.POTENCIA AS "LPT-138kV",
                    N37.POTENCIA AS "LUT-230kV",
                    N38.POTENCIA AS "MAS-138kV",
                    N39.POTENCIA AS "MER-138kV",
                    N40.POTENCIA AS "MFL-138kV",
                    N41.POTENCIA AS "MOR-69kV",
                    N42.POTENCIA AS "NCO-138kV",
                    N43.POTENCIA AS "NIS-69kV",
                    N44.POTENCIA AS "NNC-230kV",
                    N45.POTENCIA AS "PAV-34.5kV",
                    N46.POTENCIA AS "PAZ-138kV",
                    N47.POTENCIA AS "PGR-230kV",
                    N48.POTENCIA AS "PNU-69kV",
                    N49.POTENCIA AS "PRD-34.5kV",
                    N50.POTENCIA AS "RET-138kV",
                    N51.POTENCIA AS "RNA-138kV",
                    N52.POTENCIA AS "SFE-138kV",
                    N53.POTENCIA AS "SGT-138kV",
                    N54.POTENCIA AS "SHL-138kV",
                    N55.POTENCIA AS "SIS-138kV",
                    N56.POTENCIA AS "SLU-34.5kV",
                    N57.POTENCIA AS "SMT-138kV",
                    N58.POTENCIA AS "SNC 230kV",
                    N59.POTENCIA AS "SRS-69kV",
                    N60.POTENCIA AS "SUY-138kV",
                    N61.POTENCIA AS "SUY-230kV",
                    N62.POTENCIA AS "TAL-69kV",
                    N63.POTENCIA AS "TEL-138kV",
                    N64.POTENCIA AS "LVI-138kV",
                    N65.POTENCIA AS "TER SLU",
                    N66.POTENCIA AS "TON-230kV",
                    N67.POTENCIA AS "TSZ-230kV",
                    N68.POTENCIA AS "VEG-13.8kV",
                    N69.POTENCIA AS "VNU-138kV",
                    N70.POTENCIA AS "YOR-69kV",
                    N71.POTENCIA AS "ZAM-69kV",
                    N72.POTENCIA AS "PVR-69kV",
                    N73.POTENCIA AS "EST-138kV",
                    N74.POTENCIA AS "END-138kV",
                    N75.POTENCIA AS "LUV-230kV",
                    N76.POTENCIA AS "GPP B269",
                    N77.POTENCIA AS "ETX-69kV"
                FROM NODO_DATA N1
                LEFT JOIN NODO_DATA N2 ON N1.FECHA = N2.FECHA AND N2.ID_NODO = 2
                LEFT JOIN NODO_DATA N3 ON N1.FECHA = N3.FECHA AND N3.ID_NODO = 3
                LEFT JOIN NODO_DATA N4 ON N1.FECHA = N4.FECHA AND N4.ID_NODO = 4
                LEFT JOIN NODO_DATA N5 ON N1.FECHA = N5.FECHA AND N5.ID_NODO = 5
                LEFT JOIN NODO_DATA N6 ON N1.FECHA = N6.FECHA AND N6.ID_NODO = 6
                LEFT JOIN NODO_DATA N7 ON N1.FECHA = N7.FECHA AND N7.ID_NODO = 7
                LEFT JOIN NODO_DATA N8 ON N1.FECHA = N8.FECHA AND N8.ID_NODO = 8
                LEFT JOIN NODO_DATA N9 ON N1.FECHA = N9.FECHA AND N9.ID_NODO = 9
                LEFT JOIN NODO_DATA N10 ON N1.FECHA = N10.FECHA AND N10.ID_NODO = 10
                LEFT JOIN NODO_DATA N11 ON N1.FECHA = N11.FECHA AND N11.ID_NODO = 11
                LEFT JOIN NODO_DATA N12 ON N1.FECHA = N12.FECHA AND N12.ID_NODO = 12
                LEFT JOIN NODO_DATA N13 ON N1.FECHA = N13.FECHA AND N13.ID_NODO = 13
                LEFT JOIN NODO_DATA N14 ON N1.FECHA = N14.FECHA AND N14.ID_NODO = 14
                LEFT JOIN NODO_DATA N15 ON N1.FECHA = N15.FECHA AND N15.ID_NODO = 15
                LEFT JOIN NODO_DATA N16 ON N1.FECHA = N16.FECHA AND N16.ID_NODO = 16
                LEFT JOIN NODO_DATA N17 ON N1.FECHA = N17.FECHA AND N17.ID_NODO = 17
                LEFT JOIN NODO_DATA N18 ON N1.FECHA = N18.FECHA AND N18.ID_NODO = 18
                LEFT JOIN NODO_DATA N19 ON N1.FECHA = N19.FECHA AND N19.ID_NODO = 19
                LEFT JOIN NODO_DATA N20 ON N1.FECHA = N20.FECHA AND N20.ID_NODO = 20
                LEFT JOIN NODO_DATA N21 ON N1.FECHA = N21.FECHA AND N21.ID_NODO = 21
                LEFT JOIN NODO_DATA N22 ON N1.FECHA = N22.FECHA AND N22.ID_NODO = 22
                LEFT JOIN NODO_DATA N23 ON N1.FECHA = N23.FECHA AND N23.ID_NODO = 23
                LEFT JOIN NODO_DATA N24 ON N1.FECHA = N24.FECHA AND N24.ID_NODO = 24
                LEFT JOIN NODO_DATA N25 ON N1.FECHA = N25.FECHA AND N25.ID_NODO = 25
                LEFT JOIN NODO_DATA N26 ON N1.FECHA = N26.FECHA AND N26.ID_NODO = 26
                LEFT JOIN NODO_DATA N27 ON N1.FECHA = N27.FECHA AND N27.ID_NODO = 27
                LEFT JOIN NODO_DATA N28 ON N1.FECHA = N28.FECHA AND N28.ID_NODO = 28
                LEFT JOIN NODO_DATA N29 ON N1.FECHA = N29.FECHA AND N29.ID_NODO = 29
                LEFT JOIN NODO_DATA N30 ON N1.FECHA = N30.FECHA AND N30.ID_NODO = 30
                LEFT JOIN NODO_DATA N31 ON N1.FECHA = N31.FECHA AND N31.ID_NODO = 31
                LEFT JOIN NODO_DATA N32 ON N1.FECHA = N32.FECHA AND N32.ID_NODO = 32
                LEFT JOIN NODO_DATA N33 ON N1.FECHA = N33.FECHA AND N33.ID_NODO = 33
                LEFT JOIN NODO_DATA N34 ON N1.FECHA = N34.FECHA AND N34.ID_NODO = 34
                LEFT JOIN NODO_DATA N35 ON N1.FECHA = N35.FECHA AND N35.ID_NODO = 35
                LEFT JOIN NODO_DATA N36 ON N1.FECHA = N36.FECHA AND N36.ID_NODO = 36
                LEFT JOIN NODO_DATA N37 ON N1.FECHA = N37.FECHA AND N37.ID_NODO = 37
                LEFT JOIN NODO_DATA N38 ON N1.FECHA = N38.FECHA AND N38.ID_NODO = 38
                LEFT JOIN NODO_DATA N39 ON N1.FECHA = N39.FECHA AND N39.ID_NODO = 39
                LEFT JOIN NODO_DATA N40 ON N1.FECHA = N40.FECHA AND N40.ID_NODO = 40
                LEFT JOIN NODO_DATA N41 ON N1.FECHA = N41.FECHA AND N41.ID_NODO = 41
                LEFT JOIN NODO_DATA N42 ON N1.FECHA = N42.FECHA AND N42.ID_NODO = 42
                LEFT JOIN NODO_DATA N43 ON N1.FECHA = N43.FECHA AND N43.ID_NODO = 43
                LEFT JOIN NODO_DATA N44 ON N1.FECHA = N44.FECHA AND N44.ID_NODO = 44
                LEFT JOIN NODO_DATA N45 ON N1.FECHA = N45.FECHA AND N45.ID_NODO = 45
                LEFT JOIN NODO_DATA N46 ON N1.FECHA = N46.FECHA AND N46.ID_NODO = 46
                LEFT JOIN NODO_DATA N47 ON N1.FECHA = N47.FECHA AND N47.ID_NODO = 47
                LEFT JOIN NODO_DATA N48 ON N1.FECHA = N48.FECHA AND N48.ID_NODO = 48
                LEFT JOIN NODO_DATA N49 ON N1.FECHA = N49.FECHA AND N49.ID_NODO = 49
                LEFT JOIN NODO_DATA N50 ON N1.FECHA = N50.FECHA AND N50.ID_NODO = 50
                LEFT JOIN NODO_DATA N51 ON N1.FECHA = N51.FECHA AND N51.ID_NODO = 51
                LEFT JOIN NODO_DATA N52 ON N1.FECHA = N52.FECHA AND N52.ID_NODO = 52
                LEFT JOIN NODO_DATA N53 ON N1.FECHA = N53.FECHA AND N53.ID_NODO = 53
                LEFT JOIN NODO_DATA N54 ON N1.FECHA = N54.FECHA AND N54.ID_NODO = 54
                LEFT JOIN NODO_DATA N55 ON N1.FECHA = N55.FECHA AND N55.ID_NODO = 55
                LEFT JOIN NODO_DATA N56 ON N1.FECHA = N56.FECHA AND N56.ID_NODO = 56
                LEFT JOIN NODO_DATA N57 ON N1.FECHA = N57.FECHA AND N57.ID_NODO = 57
                LEFT JOIN NODO_DATA N58 ON N1.FECHA = N58.FECHA AND N58.ID_NODO = 58
                LEFT JOIN NODO_DATA N59 ON N1.FECHA = N59.FECHA AND N59.ID_NODO = 59
                LEFT JOIN NODO_DATA N60 ON N1.FECHA = N60.FECHA AND N60.ID_NODO = 60
                LEFT JOIN NODO_DATA N61 ON N1.FECHA = N61.FECHA AND N61.ID_NODO = 61
                LEFT JOIN NODO_DATA N62 ON N1.FECHA = N62.FECHA AND N62.ID_NODO = 62
                LEFT JOIN NODO_DATA N63 ON N1.FECHA = N63.FECHA AND N63.ID_NODO = 63
                LEFT JOIN NODO_DATA N64 ON N1.FECHA = N64.FECHA AND N64.ID_NODO = 64
                LEFT JOIN NODO_DATA N65 ON N1.FECHA = N65.FECHA AND N65.ID_NODO = 65
                LEFT JOIN NODO_DATA N66 ON N1.FECHA = N66.FECHA AND N66.ID_NODO = 66
                LEFT JOIN NODO_DATA N67 ON N1.FECHA = N67.FECHA AND N67.ID_NODO = 67
                LEFT JOIN NODO_DATA N68 ON N1.FECHA = N68.FECHA AND N68.ID_NODO = 68
                LEFT JOIN NODO_DATA N69 ON N1.FECHA = N69.FECHA AND N69.ID_NODO = 69
                LEFT JOIN NODO_DATA N70 ON N1.FECHA = N70.FECHA AND N70.ID_NODO = 70
                LEFT JOIN NODO_DATA N71 ON N1.FECHA = N71.FECHA AND N71.ID_NODO = 71
                LEFT JOIN NODO_DATA N72 ON N1.FECHA = N72.FECHA AND N72.ID_NODO = 72
                LEFT JOIN NODO_DATA N73 ON N1.FECHA = N73.FECHA AND N73.ID_NODO = 73
                LEFT JOIN NODO_DATA N74 ON N1.FECHA = N74.FECHA AND N74.ID_NODO = 74
                LEFT JOIN NODO_DATA N75 ON N1.FECHA = N75.FECHA AND N75.ID_NODO = 75
                LEFT JOIN NODO_DATA N76 ON N1.FECHA = N76.FECHA AND N76.ID_NODO = 76
                LEFT JOIN NODO_DATA N77 ON N1.FECHA = N77.FECHA AND N77.ID_NODO = 77
                WHERE N1.ID_NODO = 1
                ORDER BY N1.HORA
        `
    );
    console.log("Demanda nacional: ", result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("Database query error: ", error);
    res.status(500).json({ error: "Failed to fetch hourly energy demand" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error("Error closing connection: ", err);
      }
    }
  }
});

module.exports = router;
