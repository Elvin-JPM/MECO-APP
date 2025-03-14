from sqlalchemy import create_engine, text
from sqlalchemy.dialects.oracle import NUMBER, DATE
from sqlalchemy.exc import IntegrityError
import pandas as pd
from dotenv import load_dotenv
import os

load_dotenv()

DIALECT = "oracle"
SQL_DRIVER = "oracledb"  
USERNAME = os.getenv('ORACLE_USERNAME')  
PASSWORD = os.getenv('ORACLE_PASSWORD')  
HOST = os.getenv('ORACLE_HOST')  
PORT = os.getenv('ORACLE_PORT')  
SERVICE = os.getenv('ORACLE_SERVICE')  
ENGINE_PATH_WIN_AUTH = (
    DIALECT
    + "+"
    + SQL_DRIVER
    + "://"
    + USERNAME
    + ":"
    + PASSWORD
    + "@"
    + HOST
    + ":"
    + str(PORT)
    + "/?service_name="
    + SERVICE
)
engine = create_engine(ENGINE_PATH_WIN_AUTH, isolation_level='READ COMMITTED')

###### Funcion para extraer los datos de los medidores y pasarlos para realizar la consulta a SQL Server
def get_meters_data():
    data = []
    query = text("""SELECT 
                        id, 
                        description, 
                        dir_canal, 
                        id_ion_data, 
                        multiplicador, 
                        tipo 
                    FROM MCAM_MEDIDORES 
                    WHERE INTEGRADO = 1 
                    AND ID_ION_DATA IS NOT NULL""")
    try:
        df = pd.read_sql(query, con = engine)
        for index,row in df.iterrows():
            data.append(row.to_dict())
        return data
    except Exception as e:
        print(f"Error querying data: {e}")
        return None


###### Funcion para insertar los datos de energia en la base de datos oracle
def insert_datos(data_to_insert):
    try:
        print(f"Total records to process: {len(data_to_insert)}")
        print("\nSample of input data:")
        print(data_to_insert.head())
        
        # Convert FECHA and HORA_ACTUALIZACION to datetime if not already
        data_to_insert['FECHA'] = pd.to_datetime(data_to_insert['FECHA'])
        data_to_insert['HORA_ACTUALIZACION'] = pd.to_datetime(data_to_insert['HORA_ACTUALIZACION'])
        
        with engine.connect() as connection:
            # Fetch existing records
            min_date = data_to_insert['FECHA'].min()
            max_date = data_to_insert['FECHA'].max()
            meter_id = data_to_insert['ID_MEDIDOR'].iloc[0]
            
            print(f"\nDate range check:")
            print(f"Min date: {min_date} (type: {type(min_date)})")
            print(f"Max date: {max_date} (type: {type(max_date)})")
            print(f"Meter ID: {meter_id} (type: {type(meter_id)})")
            
            existing_records_query = f"""
                SELECT FECHA, ID_MEDIDOR, TIPO_ENERGIA 
                FROM MCAM_MEDICIONES 
                WHERE FECHA BETWEEN TO_DATE('{min_date}', 'YYYY-MM-DD HH24:MI:SS') 
                AND TO_DATE('{max_date}', 'YYYY-MM-DD HH24:MI:SS') 
                AND ID_MEDIDOR = {meter_id}
            """
            
            existing_records = pd.read_sql(existing_records_query, connection)
            print(f"Found {len(existing_records)} existing records")
            
            # Create a set of existing record keys for efficient lookup
            existing_keys = set(existing_records.apply(lambda row: (row['fecha'], row['id_medidor'], row['tipo_energia']), axis=1))
            
            # Filter out records that already exist
            filtered_data = data_to_insert[~data_to_insert.apply(lambda row: (row['FECHA'], row['ID_MEDIDOR'], row['TIPO_ENERGIA']) in existing_keys, axis=1)]
            
            print(f"\nRecords to insert after filtering: {len(filtered_data)}")
            if not filtered_data.empty:
                print("Sample record to insert:")
                print(filtered_data.iloc[0])
            
            if filtered_data.empty:
                print("\nNo new records to insert")
                return
            
            # Insert the filtered records using pandas
            filtered_data.to_sql(
                'mcam_mediciones', 
                con=engine, 
                if_exists='append', 
                index=False,
                dtype={
                    "FECHA": DATE,
                    "DATO_ENERGIA": NUMBER(precision=18, scale=4),
                    "ID_MEDIDOR": NUMBER,
                    "ID_USUARIO": NUMBER,
                    "HORA_ACTUALIZACION": DATE
                }
            )
            print(f"\nSuccessfully inserted {len(filtered_data)} new records")
            
    except Exception as e:
        print(f"\nError in insert_datos: {str(e)}")
        raise
