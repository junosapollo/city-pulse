import pandas as pd
from data_loader import mask_vehicle

def compute(violations_df, events_df):
    v_df = violations_df
    
    veh_counts = v_df.groupby('vehicle_number').size()
    repeat_veh_mask = veh_counts >= 5
    repeat_veh = veh_counts[repeat_veh_mask].index
    
    total_distinct_vehicles = len(veh_counts)
    total_violations = len(v_df)
    
    chronic_df = v_df[v_df['vehicle_number'].isin(repeat_veh)]
    
    offenders = []
    
    for v_num, group in chronic_df.groupby('vehicle_number'):
        count = len(group)
        v_type = group['vehicle_type'].mode().iloc[0] if not group['vehicle_type'].empty else "Unknown"
        top_station = group['police_station'].mode().iloc[0] if not group['police_station'].empty else "Unknown"
        
        pts = group[['latitude', 'longitude']].dropna()
        if len(pts) > 20:
            pts = pts.sample(20, random_state=42)
            
        locations = [{"lat": float(r.latitude), "lng": float(r.longitude)} for r in pts.itertuples()]
        
        offenders.append({
            "vehicle_number_masked": mask_vehicle(v_num),
            "count": int(count),
            "vehicle_type": str(v_type),
            "top_station": str(top_station),
            "locations": locations
        })
        
    offenders.sort(key=lambda x: x['count'], reverse=True)
    
    total_repeat = len(repeat_veh)
    pct_vehicles = float(total_repeat / total_distinct_vehicles * 100) if total_distinct_vehicles > 0 else 0.0
    pct_violations = float(chronic_df.shape[0] / total_violations * 100) if total_violations > 0 else 0.0
    
    return {
        "repeat_offenders": offenders[:200],
        "summary": {
            "total_repeat": int(total_repeat),
            "pct_of_vehicles": pct_vehicles,
            "pct_of_violations": pct_violations
        }
    }
