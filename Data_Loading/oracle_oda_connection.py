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

###### Function to extract meter data
def get_meters_data():
    data = []
    query = text("""
        SELECT 
            id, 
            description, 
            dir_canal, 
            id_ion_data, 
            multiplicador, 
            tipo 
        FROM MCAM_MEDIDORES 
        WHERE INTEGRADO = 1 
        AND ID_ION_DATA IS NOT NULL
    """)
    try:
        df = pd.read_sql(query, con=engine)
        for index, row in df.iterrows():
            data.append(row.to_dict())
        return data
    except Exception as e:
        print(f"Error querying data: {e}")
        return None

###### Function to insert energy data into the Oracle database
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
            meter_id = int(data_to_insert['ID_MEDIDOR'].iloc[0])  # Convert numpy.int64 to native int
            
            print(f"\nDate range check:")
            print(f"Min date: {min_date} (type: {type(min_date)})")
            print(f"Max date: {max_date} (type: {type(max_date)})")
            print(f"Meter ID: {meter_id} (type: {type(meter_id)})")
            
            # Modified query to also fetch ORIGEN and DATO_ENERGIA columns
            existing_records_query = f"""
                SELECT FECHA, ID_MEDIDOR, TIPO_ENERGIA, ORIGEN, DATO_ENERGIA
                FROM MCAM_MEDICIONES
                WHERE FECHA BETWEEN TO_DATE('{min_date}', 'YYYY-MM-DD HH24:MI:SS') 
                    AND TO_DATE('{max_date}', 'YYYY-MM-DD HH24:MI:SS')
                AND ID_MEDIDOR = {meter_id}
            """
            
            existing_records = pd.read_sql(existing_records_query, connection)
            print(f"Found {len(existing_records)} existing records")
            
            # Create a dictionary to store existing records with their keys for efficient lookup
            existing_records_dict = {}
            for _, row in existing_records.iterrows():
                key = (row['fecha'], row['id_medidor'], row['tipo_energia'])
                existing_records_dict[key] = row
            
            # Identify records to insert, update, and update for origen P/R
            records_to_insert = []
            records_to_update = []
            records_to_update_p_r = []
            
            for _, row in data_to_insert.iterrows():
                key = (row['FECHA'], row['ID_MEDIDOR'], row['TIPO_ENERGIA'])
                
                # Skip records with NaN in DATO_ENERGIA (critical field)
                if pd.isna(row['DATO_ENERGIA']):
                    print(f"Skipping record with NaN DATO_ENERGIA: {key}")
                    continue
                    
                if key not in existing_records_dict:
                    # New record, add to insert list
                    records_to_insert.append(row)
                elif existing_records_dict[key]['origen'] == 'VI':
                    # Existing record with ORIGEN='VI', add to update list
                    records_to_update.append(row)
                elif existing_records_dict[key]['origen'] in ('P', 'R'):
                    # Existing record with ORIGEN='P' or 'R', check if DATO_ENERGIA is different
                    if existing_records_dict[key]['dato_energia'] != row['DATO_ENERGIA']:
                        # Add to update list for origen P/R
                        records_to_update_p_r.append(row)
            
            # Convert lists to DataFrames
            df_to_insert = pd.DataFrame(records_to_insert) if records_to_insert else pd.DataFrame()
            df_to_update = pd.DataFrame(records_to_update) if records_to_update else pd.DataFrame()
            df_to_update_p_r = pd.DataFrame(records_to_update_p_r) if records_to_update_p_r else pd.DataFrame()
            
            print(f"\nRecords to insert: {len(df_to_insert)}")
            print(f"Records to update (ORIGEN='VI'): {len(df_to_update)}")
            print(f"Records to update (ORIGEN='P' or 'R'): {len(df_to_update_p_r)}")
            
            # Insert new records
            if not df_to_insert.empty:
                print("Sample record to insert:")
                print(df_to_insert.iloc[0])
                
                # Debugging: Print all records to insert
                print("All records to insert:")
                print(df_to_insert)
                
                df_to_insert.to_sql(
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
                print(f"\nSuccessfully inserted {len(df_to_insert)} new records")
            else:
                print("\nNo new records to insert")
            
            # Update existing records with ORIGEN='VI'
            if not df_to_update.empty:
                print("Sample record to update (ORIGEN='VI'):")
                print(df_to_update.iloc[0])
                for _, row in df_to_update.iterrows():
                    # Create a dictionary of parameters with NULL handling
                    params = {
                        'fecha': row['FECHA'],
                        'id_medidor': int(row['ID_MEDIDOR']),  # Convert numpy.int64 to native int
                        'tipo_energia': row['TIPO_ENERGIA'],
                        'dato_energia': float(row['DATO_ENERGIA']),  # Convert to float to ensure proper handling
                        'id_usuario': int(row['ID_USUARIO']),  # Convert numpy.int64 to native int
                        'hora_actualizacion': row['HORA_ACTUALIZACION'],
                        'origen': row['ORIGEN']
                    }
                    
                    # Construct and execute update query
                    update_query = text("""
                        UPDATE MCAM_MEDICIONES
                        SET DATO_ENERGIA = :dato_energia,
                            ID_USUARIO = :id_usuario,
                            HORA_ACTUALIZACION = :hora_actualizacion,
                            ORIGEN = :origen
                        WHERE FECHA = :fecha
                        AND ID_MEDIDOR = :id_medidor
                        AND TIPO_ENERGIA = :tipo_energia
                        AND ORIGEN = 'VI'
                    """)
                    
                    # Execute the query with parameters
                    connection.execute(update_query, params)
                
                connection.commit()
                print(f"\nSuccessfully updated {len(df_to_update)} existing records with ORIGEN='VI'")
            else:
                print("\nNo records to update with ORIGEN='VI'")
            
            # Update existing records with ORIGEN='P' or 'R'
            if not df_to_update_p_r.empty:
                print("Sample record to update (ORIGEN='P' or 'R'):")
                print(df_to_update_p_r.iloc[0])
                
                for _, row in df_to_update_p_r.iterrows():
                    # Create a dictionary of parameters with NULL handling
                    params = {
                        'fecha': row['FECHA'],
                        'id_medidor': int(row['ID_MEDIDOR']),  # Convert numpy.int64 to native int
                        'tipo_energia': row['TIPO_ENERGIA'],
                        'dato_energia': float(row['DATO_ENERGIA']),  # Convert to float to ensure proper handling
                        'id_usuario': int(row['ID_USUARIO']),  # Convert numpy.int64 to native int
                        'hora_actualizacion': row['HORA_ACTUALIZACION'],
                        'origen': row['ORIGEN']
                    }
                    
                    # Construct and execute update query
                    update_query = text("""
                        UPDATE MCAM_MEDICIONES
                        SET DATO_ENERGIA = :dato_energia,
                            ID_USUARIO = :id_usuario,
                            HORA_ACTUALIZACION = :hora_actualizacion,
                            ORIGEN = :origen
                        WHERE FECHA = :fecha
                        AND ID_MEDIDOR = :id_medidor
                        AND TIPO_ENERGIA = :tipo_energia
                        AND ORIGEN IN ('P', 'R')
                    """)
                    
                    # Execute the query with parameters
                    connection.execute(update_query, params)
                
                connection.commit()
                print(f"\nSuccessfully updated {len(df_to_update_p_r)} existing records with ORIGEN='P' or 'R'")
            else:
                print("\nNo records to update with ORIGEN='P' or 'R'")
            
            # Check for existing data greater than the current date
            current_date = pd.Timestamp.now()  # Get the current date and time
            print(f"\nChecking for existing data after {current_date}")

            # Convert current_date to Oracle-compatible format
            current_date_str = current_date.strftime('%Y-%m-%d %H:%M:%S')

            # Define the delete query
            delete_query = text("""
                DELETE FROM MCAM_MEDICIONES
                WHERE FECHA > TO_DATE(:current_date, 'YYYY-MM-DD HH24:MI:SS')
                AND ID_MEDIDOR = :meter_id
            """)

            # Debugging: Print the delete query and parameters
            print("Delete Query:")
            print(delete_query)

            print("Parameters:")
            print({'current_date': current_date_str, 'meter_id': meter_id})

            # Debugging: Check if there are records to delete
            check_query = text("""
                SELECT COUNT(*) as record_count
                FROM MCAM_MEDICIONES
                WHERE FECHA > TO_DATE(:current_date, 'YYYY-MM-DD HH24:MI:SS')
                AND ID_MEDIDOR = :meter_id
            """)
            result = connection.execute(check_query, {'current_date': current_date_str, 'meter_id': meter_id})
            record_count = result.scalar()
            print(f"Number of records to delete: {record_count}")

            # Execute the delete query
            if record_count > 0:
                result = connection.execute(delete_query, {'current_date': current_date_str, 'meter_id': meter_id})
                deleted_rows = result.rowcount
                connection.commit()
                print(f"Deleted {deleted_rows} existing records with dates after {current_date_str}")
            else:
                print("No records to delete.")
                
    except Exception as e:
        print(f"\nError in insert_datos: {str(e)}")
        # Print more details if available
        import traceback
        traceback.print_exc()
        raise