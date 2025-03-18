import pandas as pd
from datetime import date,datetime, timedelta
import pyodbc
import cryptography
from cryptography.hazmat.primitives.kdf import pbkdf2
from sql_server_connection import get_energy_data
from oracle_oda_connection import insert_datos, get_meters_data
import sys


starting_time = datetime.now()

meters_data = get_meters_data()
energy_table = []
empty_energy_meters = []

# Get today's date at 00:00
hoy = datetime.now().replace(second=0, microsecond=0).strftime('%Y-%m-%d %H:%M')

# Get yesterday's date at 00:00
ayer = (datetime.now() - timedelta(days = 1)).replace(second=0, microsecond=0).strftime('%Y-%m-%d %H:%M')

# start_date='2025-01-29 00:00'
# end_date='2025-01-30 00:00'

start_date = ayer
end_date = hoy

start_datetime = datetime.strptime(start_date, '%Y-%m-%d %H:%M')
end_datetime = datetime.strptime(end_date, '%Y-%m-%d %H:%M')


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
# Create the list of times
time_list = []
current_time = start_datetime


while current_time <= end_datetime:
    time_list.append(current_time.strftime('%Y-%m-%d %H:%M'))
    current_time += timedelta(minutes=15)


print(time_list)
print("len of time list: ", len(time_list))