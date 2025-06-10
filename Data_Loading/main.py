import pandas as pd
from datetime import date,datetime, timedelta
import sys
from sql_server_connection import get_energy_data
from oracle_oda_connection import insert_datos, get_meters_data


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
#ayer = (datetime.now() - timedelta(days=3)).replace(second=0, microsecond=0).strftime('%Y-%m-%d %H:%M')


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
#### Si el registro se ha perdido, se rellenara con cero (0) para luego ser editado desde la app
def fill_lost_registers(accumulated_energy, meter_data):
    energy_types = {
        'KWH_DEL': 'del_active',
        'KWH_REC': 'rec_active',
        'KVARH_DEL': 'del_reactive',
        'KVARH_REC': 'rec_reactive'
    }
    
    # Filter non-zero energy data for each type
    filtered_data = {
        name: accumulated_energy[(accumulated_energy["TIPO_ENERGIA"] == etype) & 
                                (accumulated_energy["DATO_ENERGIA"] != 0)]
        for etype, name in energy_types.items()
    }
    
    # Check if any energy type has missing dates
    if any(len(list(data["FECHA"])) < len(time_list) for data in filtered_data.values()):
        # Prepare data frames to insert for missing dates
        dfs_to_insert = []
        
        for etype, name in energy_types.items():
            # Get existing dates as strings
            existing_dates = [fecha.strftime('%Y-%m-%d %H:%M') 
                            for fecha in filtered_data[name]["FECHA"]]
            
            # Find missing dates
            missing_dates = pd.to_datetime(
                [date for date in time_list if date not in existing_dates],
                format='%Y-%m-%d %H:%M'
            )
            
            # Create DataFrame for missing dates
            if not missing_dates.empty:
                new_rows = [{
                    'FECHA': date,
                    'description': meter_data["description"],
                    'id': meter_data["id"],
                    'DATO_ENERGIA': 0,
                    'TIPO_ENERGIA': etype,
                    'ESTADO': 1,
                    'FECHA_CREACION': datetime.now(),
                    'USUARIO_CREACION': "VI"
                } for date in missing_dates]
                
                dfs_to_insert.append(pd.DataFrame(new_rows))
        
        # Filter original data to exclude zero values
        accumulated_energy = accumulated_energy[accumulated_energy["DATO_ENERGIA"] != 0]
        
        # Concatenate all DataFrames
        if dfs_to_insert:
            accumulated_energy = pd.concat(
                [accumulated_energy] + dfs_to_insert,
                ignore_index=True
            )
    
    print("Data to insert after filling: ", accumulated_energy)
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

    # print(data_to_insert)
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