import numpy as np
import scipy.spatial.distance
from data_loader import OVERLAPPING_STATIONS

def compute(violations_df, events_df):
    v_df = violations_df
    e_df = events_df
    
    v_hours = [int((v_df['hour'] == h).sum()) for h in range(24)]
    e_hours = [int((e_df['hour'] == h).sum()) for h in range(24)]
    accidents_df = e_df[e_df['event_cause'].astype(str).str.lower() == 'accident']
    acc_hours = [int((accidents_df['hour'] == h).sum()) for h in range(24)]
    
    city_wide = {
        "violation_hours": v_hours,
        "incident_hours": e_hours,
        "accident_hours": acc_hours
    }
    
    per_station = []
    
    for station in OVERLAPPING_STATIONS:
        sv_df = v_df[v_df['police_station'] == station]
        se_df = e_df[e_df['police_station'] == station]
        
        sv_hours = np.array([(sv_df['hour'] == h).sum() for h in range(24)], dtype=float)
        se_hours = np.array([(se_df['hour'] == h).sum() for h in range(24)], dtype=float)
        
        v_peak = np.argsort(sv_hours)[-3:][::-1].tolist()
        e_peak = np.argsort(se_hours)[-3:][::-1].tolist()
        
        if se_df.empty:
            div_score = None
        else:
            sv_hours += 1e-10
            se_hours += 1e-10
            sv_norm = sv_hours / sv_hours.sum()
            se_norm = se_hours / se_hours.sum()
            div_score = float(scipy.spatial.distance.jensenshannon(sv_norm, se_norm))
            
        per_station.append({
            "name": station,
            "divergence_score": div_score,
            "violation_peak_hours": [int(h) for h in v_peak],
            "incident_peak_hours": [int(h) for h in e_peak]
        })
        
    per_station.sort(key=lambda x: (x['divergence_score'] is None, -(x['divergence_score'] or 0)))
    
    return {
        "city_wide": city_wide,
        "per_station": per_station
    }
