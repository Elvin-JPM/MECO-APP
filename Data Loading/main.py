import pandas as pd
from datetime import date,datetime, timedelta
import pyodbc
import cryptography
from cryptography.hazmat.primitives.kdf import pbkdf2
from sql_server_connection import get_energy_data
from oracle_oda_connection import insert_datos, get_meters_data
import sys

# Lee el argumento que viene desde /Backend/app.js
if len(sys.argv) > 1:
    days_back = int(sys.argv[1])  
else:
    days_back = 1  

starting_time = datetime.now()

meters_data = get_meters_data()
energy_table = []
empty_energy_meters = []

# Get today's date at 00:00
hoy = datetime.now().replace(second=0, microsecond=0).strftime('%Y-%m-%d %H:%M')

# Obtiene la fecha actual y le resta la cantidad de dias que viene de node js
ayer = (datetime.now() - timedelta(days=days_back)).replace(second=0, microsecond=0).strftime('%Y-%m-%d %H:%M')

# Se definen las fecha inicial y final y se convierten a datetime
start_date = ayer
end_date = hoy
start_datetime = datetime.strptime(start_date, '%Y-%m-%d %H:%M')
end_datetime = datetime.strptime(end_date, '%Y-%m-%d %H:%M')

# Estas funciones se utilizan para crear el rango de fecha con el que se va a comparar
# los datos extraidos, es decir, si el script se ejecuta a la 1:20 entonces la funcion
# round_to_next_interval(dt), pasara la fecha inicial a 1:30 y la funcion round_to_previous_interval
# pondra la fecha final en 1:15
def round_to_next_interval(dt):
    """
    Rounds the given datetime to the next interval of 0, 15, 30, or 45 minutes.
    
    Args:
        dt (datetime): The input datetime object.
    
    Returns:
        datetime: The adjusted datetime object.
    """
    # Extract the current minute
    current_minute = dt.minute

    # Check if the current minute is already a valid interval
    if current_minute in {0, 15, 30, 45}:
        return dt

    # Calculate the next valid interval
    if current_minute < 15:
        next_minute = 15
    elif current_minute < 30:
        next_minute = 30
    elif current_minute < 45:
        next_minute = 45
    else:
        # If the minute is >= 45, round to the next hour (00 minutes)
        next_minute = 0
        dt += timedelta(hours=1)  # Move to the next hour

    # Replace the minute and second with the next valid interval
    rounded_dt = dt.replace(minute=next_minute, second=0, microsecond=0)

    return rounded_dt

def round_to_previous_interval(dt):
    """
    Rounds the given datetime down to the previous interval of 0, 15, 30, or 45 minutes.
    
    Args:
        dt (datetime): The input datetime object.
    
    Returns:
        datetime: The adjusted datetime object.
    """
    # Extract the current minute
    current_minute = dt.minute

    # Check if the current minute is already a valid interval
    if current_minute in {0, 15, 30, 45}:
        return dt

    # Calculate the previous valid interval
    if current_minute < 15:
        previous_minute = 0
    elif current_minute < 30:
        previous_minute = 15
    elif current_minute < 45:
        previous_minute = 30
    else:
        previous_minute = 45

    # Replace the minute and second with the previous valid interval
    rounded_dt = dt.replace(minute=previous_minute, second=0, microsecond=0)

    return rounded_dt

start_datetime = round_to_next_interval(start_datetime)
end_datetime = round_to_previous_interval(end_datetime)

# Se crea la lista de fechas
time_list = []
current_time = start_datetime

while current_time <= end_datetime:
    time_list.append(current_time.strftime('%Y-%m-%d %H:%M'))
    current_time += timedelta(minutes=15)

##########################################################################################################################################################
##########################################################################################################################################################


#### Funcion para rellenar los registros perdidos en los medidores
#### Si el registro se ha perdido, se rellenara con cero (0) para luego ser editado desde la interfaz
def fill_lost_registers(accumulated_energy, meter_data):
 
    ### Separando los tipos de energia para el medidor principal y respaldo
    del_active_energy = accumulated_energy[(accumulated_energy["TIPO_ENERGIA"] == "KWH_DEL")]
    rec_active_energy = accumulated_energy[(accumulated_energy["TIPO_ENERGIA"] == "KWH_REC")]
    del_reactive_energy = accumulated_energy[(accumulated_energy["TIPO_ENERGIA"] == "KVARH_DEL")]
    rec_reactive_energy = accumulated_energy[(accumulated_energy["TIPO_ENERGIA"] == "KVARH_REC")]

    ### Si existe algun valor faltante se ejecutara todo este codigo, adjuntando las nuevas filas a accumulated_energy
    ### Si no hay valores faltantes, entonces se retorna directamente accumulated_energy al final de la funcion
    if len(list(del_active_energy["FECHA"])) < len(time_list) or \
       len(list(rec_active_energy["FECHA"])) < len(time_list) or \
       len(list(del_reactive_energy["FECHA"])) < len(time_list) or \
       len(list(rec_reactive_energy["FECHA"])) < len(time_list):

        ### Convirtiendo la columna Fecha de cada tipo de energia a string
        del_active_fecha = [fecha.strftime('%Y-%m-%d %H:%M') for fecha in list(del_active_energy["FECHA"])]
        rec_active_fecha = [fecha.strftime('%Y-%m-%d %H:%M') for fecha in list(rec_active_energy["FECHA"])]
        del_reactive_fecha = [fecha.strftime('%Y-%m-%d %H:%M') for fecha in list(del_reactive_energy["FECHA"])]
        rec_reactive_fecha = [fecha.strftime('%Y-%m-%d %H:%M') for fecha in list(rec_reactive_energy["FECHA"])]

        ### Encontrando los valores faltantes y convirtiendolos a una lista de Timestamp como vienen de SQL Server 
        ### La comparacion se hace entre time_list la cual es una variable global que se crea a partir de las variables start_date y end_date
        del_active_values_to_insert =   list(pd.to_datetime([date_missing for date_missing in time_list if date_missing not in del_active_fecha], format='%Y-%m-%d %H:%M'))
        rec_active_values_to_insert =   list(pd.to_datetime([date_missing for date_missing in time_list if date_missing not in rec_active_fecha], format='%Y-%m-%d %H:%M'))
        del_reactive_values_to_insert = list(pd.to_datetime([date_missing for date_missing in time_list if date_missing not in del_reactive_fecha], format='%Y-%m-%d %H:%M'))
        rec_reactive_values_to_insert = list(pd.to_datetime([date_missing for date_missing in time_list if date_missing not in rec_reactive_fecha], format='%Y-%m-%d %H:%M'))

        # Crear las listas que se insertaran en cada dataframe
        lists_to_insert_del_active = []
        lists_to_insert_rec_active = []
        lists_to_insert_del_reactive = []
        lists_to_insert_rec_reactive = []

        ### ENERGIA ACTIVA
        for value_to_insert_del_active in del_active_values_to_insert:
            data_to_insert_row = []
            data_to_insert_row.append(value_to_insert_del_active)
            data_to_insert_row.append(meter_data["description"])
            data_to_insert_row.append(meter_data["id"])
            data_to_insert_row.append(0)
            data_to_insert_row.append("KWH_DEL")
            data_to_insert_row.append(1)
            data_to_insert_row.append(datetime.now())
            data_to_insert_row.append("VI")
            lists_to_insert_del_active.append(data_to_insert_row)

        df_values_to_insert_del_active = pd.DataFrame(lists_to_insert_del_active, columns = accumulated_energy.columns)

        for value_to_insert_rec_active in rec_active_values_to_insert:
            data_to_insert_row = []
            data_to_insert_row.append(value_to_insert_rec_active)
            data_to_insert_row.append(meter_data["description"])
            data_to_insert_row.append(meter_data["id"])
            data_to_insert_row.append(0)
            data_to_insert_row.append("KWH_REC")
            data_to_insert_row.append(1)
            data_to_insert_row.append(datetime.now())
            data_to_insert_row.append("VI")
            lists_to_insert_rec_active.append(data_to_insert_row)

        df_values_to_insert_rec_active = pd.DataFrame(lists_to_insert_rec_active, columns = accumulated_energy.columns)

        ### ENERGIA REACTIVA
        for value_to_insert_del_reactive in del_reactive_values_to_insert:
            data_to_insert_row = []
            data_to_insert_row.append(value_to_insert_del_reactive)
            data_to_insert_row.append(meter_data["description"])
            data_to_insert_row.append(meter_data["id"])
            data_to_insert_row.append(0)
            data_to_insert_row.append("KVARH_DEL")
            data_to_insert_row.append(1)
            data_to_insert_row.append(datetime.now())
            data_to_insert_row.append("VI")
            lists_to_insert_del_reactive.append(data_to_insert_row)

        df_values_to_insert_del_reactive = pd.DataFrame(lists_to_insert_del_reactive, columns = accumulated_energy.columns)

        for value_to_insert_rec_reactive in rec_reactive_values_to_insert:
            data_to_insert_row = []
            data_to_insert_row.append(value_to_insert_rec_reactive)
            data_to_insert_row.append(meter_data["description"])
            data_to_insert_row.append(meter_data["id"])
            data_to_insert_row.append(0)
            data_to_insert_row.append("KVARH_REC")
            data_to_insert_row.append(1)
            data_to_insert_row.append(datetime.now())
            data_to_insert_row.append("VI")
            lists_to_insert_rec_reactive.append(data_to_insert_row)

        df_values_to_insert_rec_reactive = pd.DataFrame(lists_to_insert_rec_reactive, columns = accumulated_energy.columns)
        
        dataframes = [
            accumulated_energy, 
            df_values_to_insert_del_active, 
            df_values_to_insert_rec_active,
            df_values_to_insert_del_reactive,
            df_values_to_insert_rec_reactive
        ]

# Filter out empty or all-NaN DataFrames
        non_empty_dfs = [df for df in dataframes if not df.empty and not df.isna().all(axis=None)]

# Concatenate only the valid DataFrames
        if non_empty_dfs:  # If there are valid DataFrames to concatenate
            accumulated_energy = pd.concat(non_empty_dfs, ignore_index=True)
        else:
            accumulated_energy = pd.DataFrame()  # Create an empty DataFrame if all are empty
            
    print("Accumulated energy: ",accumulated_energy[(accumulated_energy["TIPO_ENERGIA"] == "KWH_REC")])

    return accumulated_energy

    
###########################################################################################################################################################
###########################################################################################################################################################


#### Funcion para transformar datos de energia acumulada en energia por intervalos
#### Luego se concatenan en una sola tabla los valores de energia acumulada con los valores de intervalos
def transform_energy_to_intervals(meter_energy):
    new_meter_energy = meter_energy[["FECHA", "DESCRIPCION", "ID_MEDIDOR", "DATO_ENERGIA", "TIPO_ENERGIA", "ID_USUARIO", "HORA_ACTUALIZACION", "ORIGEN"]]
    
    meter_energy_interval = pd.DataFrame()
    meter_energy_interval["FECHA"] = new_meter_energy["FECHA"][1:]  # Keep the timestamp, starting from 00:15
    meter_energy_interval["DESCRIPCION"] = new_meter_energy["DESCRIPCION"][1:]
    meter_energy_interval["ID_MEDIDOR"] = new_meter_energy["ID_MEDIDOR"][1:]
    meter_energy_interval['DATO_ENERGIA'] = new_meter_energy.groupby("TIPO_ENERGIA")["DATO_ENERGIA"].diff().iloc[1:]
    meter_energy_interval["TIPO_ENERGIA"] = new_meter_energy["TIPO_ENERGIA"][1:] + "_INT"
    meter_energy_interval["ID_USUARIO"] = new_meter_energy["ID_USUARIO"][1:]
    meter_energy_interval["HORA_ACTUALIZACION"] = new_meter_energy["HORA_ACTUALIZACION"][1:]
    meter_energy_interval["ORIGEN"] = new_meter_energy["ORIGEN"][1:]
    
    data_to_insert = pd.concat([meter_energy, meter_energy_interval], axis=0, ignore_index=True)

    print(data_to_insert)
    return data_to_insert

###########################################################################################################################################################
###########################################################################################################################################################

## blucle el listado total de medidores, los datos de cada medidor y las fechas de inicio y fin se le pasan a la funcion get_energy_data para extraer los datos
## que se encuentran en la base de datos del PME
for meter_data in meters_data:
    meter_energy = get_energy_data(
            meter_data, 
            start_date, 
            end_date
        )
    print("data extracted from sql server: ", meter_energy)
    
    energy_table.append(meter_energy)
    if not meter_energy.empty:
        meter_energy = fill_lost_registers(meter_energy, meter_data)
        data_to_insert = transform_energy_to_intervals(meter_energy)
        insert_datos(data_to_insert)
    else:
        print("meter_energy is empty!", meter_data["description"])
        empty_energy_meters.append(meter_data)
        
print(len(energy_table))


ending_time = datetime.now()
print(f"Total time taken: {ending_time - starting_time}")