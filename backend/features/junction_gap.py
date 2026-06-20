import pandas as pd
from data_loader import OVERLAPPING_STATIONS

def compute(violations_df, events_df):
    v_df = violations_df
    
    no_j_mask = v_df['junction_name'].astype(str).str.strip() == "No Junction"
    
    no_j_count = int(no_j_mask.sum())
    with_j_count = int((~no_j_mask).sum())
    total = len(v_df)
    
    no_j_pct = float(no_j_count / total * 100) if total > 0 else 0.0
    with_j_pct = float(with_j_count / total * 100) if total > 0 else 0.0
    
    no_j_df = v_df[no_j_mask]
    
    pts = no_j_df[['latitude', 'longitude', 'police_station']].dropna(subset=['latitude', 'longitude'])
    if len(pts) > 5000:
        pts = pts.sample(5000, random_state=42)
        
    locations = [{"lat": float(r.latitude), "lng": float(r.longitude), "station": str(r.police_station)} for r in pts.itertuples()]
    
    by_station = []
    
    for station in OVERLAPPING_STATIONS:
        st_df = v_df[v_df['police_station'] == station]
        st_total = len(st_df)
        st_no_j = int((st_df['junction_name'].astype(str).str.strip() == "No Junction").sum())
        
        st_no_j_pct = float(st_no_j / st_total * 100) if st_total > 0 else 0.0
        
        by_station.append({
            "name": station,
            "no_junction_count": st_no_j,
            "no_junction_pct": st_no_j_pct,
            "total_violations": st_total
        })
        
    by_station.sort(key=lambda x: x['no_junction_pct'], reverse=True)
    
    return {
        "no_junction": {
            "count": no_j_count,
            "pct": no_j_pct,
            "locations": locations
        },
        "with_junction": {
            "count": with_j_count,
            "pct": with_j_pct
        },
        "by_station": by_station
    }
