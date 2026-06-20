import sys
import requests
from data_loader import violations_df, events_df, OVERLAPPING_STATIONS, DATASET_LAST_DATE

def check(name, expected, actual):
    if expected == actual:
        print(f"✓ PASS | {name}: {expected}")
        return True
    else:
        print(f"✗ FAIL | {name} | Expected: {expected}, Actual: {actual}")
        return False

success = True

print("--- CSV Level Checks ---")
success &= check("Violation row count", 298450, len(violations_df))
success &= check("Event row count", 8173, len(events_df))

def contains_type(row_list, t):
    return t in row_list

wp = violations_df['violation_types_list'].apply(lambda x: contains_type(x, "WRONG PARKING")).sum()
npk = violations_df['violation_types_list'].apply(lambda x: contains_type(x, "NO PARKING")).sum()
pmr = violations_df['violation_types_list'].apply(lambda x: contains_type(x, "PARKING IN A MAIN ROAD")).sum()

success &= check("Wrong Parking records", 164977, int(wp))
success &= check("No Parking records", 139050, int(npk))
success &= check("Parking in Main Road records", 23943, int(pmr))
success &= check("Overlapping stations", 54, len(OVERLAPPING_STATIONS))

enf_2_6 = len(violations_df[violations_df['hour'].isin([2,3,4,5])])
enf_10_4 = len(violations_df[violations_df['hour'].isin([10,11,12,13,14,15])])

accidents = events_df[events_df['event_cause'].astype(str).str.lower() == 'accident']
acc_11_5 = len(accidents[accidents['hour'].isin([23,0,1,2,3,4,5])])

success &= check("Enforcement 2–6 AM", 113664, enf_2_6)
success &= check("Enforcement 10 AM–4 PM", 1452, enf_10_4)
success &= check("Accidents 11 PM–5 AM", 180, acc_11_5)

veh_counts = violations_df.groupby('vehicle_number').size()
global_repeat = (veh_counts >= 5).sum()
success &= check("Global repeat offenders (>=5)", 3489, int(global_repeat))

st_vc = violations_df.groupby(['police_station', 'vehicle_number']).size()
ps_repeat = st_vc[st_vc >= 5].index.get_level_values('vehicle_number').nunique()

success &= check("Per-station repeat offenders (>=5 at one station)", 3114, int(ps_repeat))

dist_dev = violations_df['device_id'].nunique()
success &= check("Distinct enforcement devices", 3070, int(dist_dev))

success &= check("Dataset last date", "2024-04-08", str(DATASET_LAST_DATE))

print("\n--- API Level Checks ---")
try:
    ov = requests.get("http://localhost:8000/api/overview").json()
    success &= check("API total_violations", 298450, ov['total_violations'])
    success &= check("API total_events", 8173, ov['total_events'])
    success &= check("API total_stations", 54, ov['total_stations'])
    
    off = requests.get("http://localhost:8000/api/offenders").json()
    success &= check("API total_repeat", 3489, off['summary']['total_repeat'])
    
    pred = requests.get("http://localhost:8000/api/prediction").json()
    success &= check("API forecast_date", "2024-04-09", pred['forecast_date'])
except requests.exceptions.ConnectionError:
    print("Backend not running on :8000. Skipping API checks.")

if not success:
    sys.exit(1)
