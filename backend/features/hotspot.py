import pandas as pd
from data_loader import OVERLAPPING_STATIONS

def compute(violations_df, events_df):
    parking_types = {
        "WRONG PARKING",
        "NO PARKING",
        "PARKING IN A MAIN ROAD",
        "PARKING ON FOOTPATH",
        "PARKING NEAR ROAD CROSSING"
    }
    
    def is_parking(types_list):
        return bool(set(types_list) & parking_types)

    parking_df = violations_df[violations_df['violation_types_list'].apply(is_parking)].copy()
    parking_df = parking_df[parking_df['police_station'].isin(OVERLAPPING_STATIONS)]

    stations_res = []
    for station, group in parking_df.groupby('police_station'):
        all_types = [item for sublist in group['violation_types_list'] for item in sublist]
        top_violation = pd.Series(all_types).mode().iloc[0] if all_types else "Unknown"
        
        stations_res.append({
            "name": station,
            "lat": float(group['latitude'].mean()),
            "lng": float(group['longitude'].mean()),
            "count": int(len(group)),
            "top_violation": str(top_violation)
        })
    stations_res.sort(key=lambda x: x['count'], reverse=True)

    pts = parking_df[['latitude', 'longitude']].dropna()
    if len(pts) > 50000:
        pts = pts.sample(50000, random_state=42)
    
    heatmap_points = [{"lat": float(r.latitude), "lng": float(r.longitude), "weight": 1} for r in pts.itertuples()]

    return {
        "stations": stations_res,
        "heatmap_points": heatmap_points
    }
