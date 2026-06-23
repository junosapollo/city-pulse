import glob
import json
from pathlib import Path
import pandas as pd

_PROJECT_ROOT = Path(__file__).resolve().parent.parent
_DATASET_DIR = _PROJECT_ROOT / "dataset"

# Glob-match on stable prefix
_events_csv = glob.glob(str(_DATASET_DIR / "*Astram*.csv*"))
_violations_csv = glob.glob(str(_DATASET_DIR / "*violation*.csv*"))

assert len(_events_csv) == 1, f"Expected 1 Astram CSV, found {len(_events_csv)}: {_events_csv}"
assert len(_violations_csv) == 1, f"Expected 1 violation CSV, found {len(_violations_csv)}: {_violations_csv}"

EVENTS_PATH = _events_csv[0]
VIOLATIONS_PATH = _violations_csv[0]

def _parse_violation_type(raw):
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        return [str(raw)] if pd.notna(raw) else []

def mask_vehicle(v):
    """'FKN00GL1234' -> 'FKN0****1234'"""
    s = str(v)
    if len(s) <= 8:
        return s[:2] + '*' * (len(s) - 4) + s[-2:] if len(s) > 4 else '****'
    return s[:4] + '*' * (len(s) - 8) + s[-4:]

print("Loading dataset A...")
events_df = pd.read_csv(EVENTS_PATH)
print("Loading dataset B...")
violations_df = pd.read_csv(VIOLATIONS_PATH)

# Parse timestamps
events_df['start_datetime'] = pd.to_datetime(events_df['start_datetime'], errors='coerce')
violations_df['created_datetime'] = pd.to_datetime(violations_df['created_datetime'], errors='coerce')

# Extract derived columns
for df, col in [(events_df, 'start_datetime'), (violations_df, 'created_datetime')]:
    df['hour'] = df[col].dt.hour
    df['day_of_week'] = df[col].dt.dayofweek
    df['month'] = df[col].dt.month
    df['date'] = df[col].dt.date

# Normalize stations
events_df['police_station'] = events_df['police_station'].astype(str).str.strip()
violations_df['police_station'] = violations_df['police_station'].astype(str).str.strip()

# Filter out NULL stations
events_df = events_df[(events_df['police_station'] != 'NULL') & (events_df['police_station'] != 'nan') & (events_df['police_station'] != '')]
violations_df = violations_df[(violations_df['police_station'] != 'NULL') & (violations_df['police_station'] != 'nan') & (violations_df['police_station'] != '')]

_v_stations = set(violations_df['police_station'].unique())
_e_stations = set(events_df['police_station'].unique())
OVERLAPPING_STATIONS = sorted(_v_stations & _e_stations)

violations_df['violation_types_list'] = violations_df['violation_type'].apply(_parse_violation_type)

violations_df['validation_status'] = violations_df['validation_status'].fillna('unknown')

DATASET_LAST_DATE = violations_df['date'].dropna().max()
DATASET_FIRST_DATE = violations_df['date'].dropna().min()

print(f"Loaded {len(violations_df):,} violations and {len(events_df):,} events across {len(OVERLAPPING_STATIONS)} overlapping stations.")
