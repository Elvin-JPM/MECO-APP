import pandas as pd
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

load_dotenv()

# Connection string
SERVER = os.getenv('MSSQL_SERVER')
DATABASE = os.getenv('MSSQL_DATABASE')
DRIVER = os.getenv('MSSQL_DRIVER')
USERNAME = os.getenv('MSSQL_USERNAME')
PASSWORD = os.getenv('MSSQL_PASSWORD')
DATABASE_CONNECTION = (
    f"mssql+pyodbc://{USERNAME}:{PASSWORD}@{SERVER}/{DATABASE}?driver={DRIVER}"
)

# Engine creation
engine = create_engine(DATABASE_CONNECTION, max_overflow=20, pool_size=10)

def get_energy_data(meter, start_date, end_date=None):
        
    if end_date is None:
        end_date = start_date

    # Dynamic IDs based on `dir_canal`
    if meter["dir_canal"] == 1:
        EAG, EAC, ERG, ERC = 129, 139, 91, 101
    else:
        EAG, EAC, ERG, ERC = 139, 129, 101, 91
    
    if meter['id_ion_data'] in (1083, 1090, 1091, 1092, 1093, 1094):
        EAG, EAC = 10491, 10490

    # SQL Query

    sql = text("""
        SELECT DATEADD(HOUR, -6, TimestampUTC) AS FECHA, 
        :description AS DESCRIPCION,
        :meter_id AS ID_MEDIDOR, 
        VALUE *:multiplicador AS DATO_ENERGIA, 
        'KWH_DEL' AS TIPO_ENERGIA,
        1 AS ID_USUARIO,
        DATEADD(HOUR, -6, GETUTCDATE()) AS HORA_ACTUALIZACION,
        :tipo AS ORIGEN
        FROM DataLog2
        WHERE DATEADD(HOUR, -6, TimestampUTC) BETWEEN :start_date AND :end_date
        AND QuantityID = :eag_id
        AND SourceID = :source_id

        UNION ALL

        SELECT DATEADD(HOUR, -6, TimestampUTC) AS FECHA, 
        :description AS DESCRIPCION,
        :meter_id AS ID_MEDIDOR, 
        VALUE *:multiplicador AS DATO_ENERGIA, 
        'KWH_REC' AS TIPO_ENERGIA,
        1 AS ID_USUARIO,
        DATEADD(HOUR, -6, GETUTCDATE()) AS HORA_ACTUALIZACION,
        :tipo AS ORIGEN
        FROM DataLog2
        WHERE DATEADD(HOUR, -6,TimestampUTC) BETWEEN :start_date AND :end_date
        AND QuantityID = :eac_id
        AND SourceID = :source_id

        UNION ALL 

        SELECT DATEADD(HOUR, -6, TimestampUTC) AS FECHA, 
        :description AS DESCRIPCION,
        :meter_id AS ID_MEDIDOR, 
        VALUE *:multiplicador AS DATO_ENERGIA, 
        'KVARH_DEL' AS TIPO_ENERGIA,
        1 AS ID_USUARIO,
        DATEADD(HOUR, -6, GETUTCDATE()) AS HORA_ACTUALIZACION,
        :tipo AS ORIGEN
        FROM DataLog2
        WHERE DATEADD(HOUR, -6,TimestampUTC) BETWEEN :start_date AND :end_date
        AND QuantityID = :erg_id
        AND SourceID = :source_id

        UNION ALL 

        SELECT DATEADD(HOUR, -6, TimestampUTC) AS FECHA, 
        :description AS DESCRIPCION,
        :meter_id AS ID_MEDIDOR, 
        VALUE *:multiplicador AS DATO_ENERGIA, 
        'KVARH_REC' AS TIPO_ENERGIA,
        1 AS ID_USUARIO,
        DATEADD(HOUR, -6, GETUTCDATE()) AS HORA_ACTUALIZACION,
        :tipo AS ORIGEN
        FROM DataLog2
        WHERE DATEADD(HOUR, -6,TimestampUTC) BETWEEN :start_date AND :end_date
        AND QuantityID = :erc_id
        AND SourceID = :source_id;
""")

    params = {
        "description": meter["description"],
        "meter_id":meter["id"],
        "source_id": meter["id_ion_data"],
        "eag_id": EAG,
        "eac_id": EAC,
        "erg_id": ERG,
        "erc_id": ERC,
        "start_date": start_date,
        "end_date": end_date,
        "multiplicador": meter["multiplicador"],
        "tipo": "P" if meter["tipo"] == "PRINCIPAL" else "R"
    }

    # Execute query
    return pd.read_sql(sql, con=engine.connect(), params=params)


