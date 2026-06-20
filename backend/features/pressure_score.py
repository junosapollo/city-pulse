import numpy as np
from data_loader import OVERLAPPING_STATIONS
from features import enforcement_gap

def compute(violations_df, events_df):
    v_df = violations_df[violations_df['police_station'].isin(OVERLAPPING_STATIONS)]
    
    eg_res = enforcement_gap.compute(violations_df, events_df)
    div_dict = {d['name']: d['divergence_score'] for d in eg_res['per_station']}
    
    parking_types = {
        "WRONG PARKING",
        "NO PARKING",
        "PARKING IN A MAIN ROAD",
        "PARKING ON FOOTPATH",
        "PARKING NEAR ROAD CROSSING"
    }
    
    def is_parking(types_list):
        return bool(set(types_list) & parking_types)

    parking_v_df = v_df[v_df['violation_types_list'].apply(is_parking)]
    
    v_counts = parking_v_df.groupby('police_station').size()
    max_v = v_counts.max()
    
    d_counts = v_df.groupby('police_station')['device_id'].nunique()
    max_d = d_counts.max()
    
    stations = []
    
    for station in OVERLAPPING_STATIONS:
        v_norm = v_counts.get(station, 0) / max_v if max_v > 0 else 0
        
        st_df = v_df[v_df['police_station'] == station]
        veh_counts = st_df.groupby('vehicle_number').size()
        repeat_veh = (veh_counts >= 5).sum()
        total_veh = len(veh_counts)
        ro_ratio = repeat_veh / total_veh if total_veh > 0 else 0
        
        td = div_dict.get(station)
        if td is None:
            td = 0.5
            
        d_count = d_counts.get(station, 0)
        d_norm = d_count / max_d if max_d > 0 else 0
        d_gap = 1.0 - d_norm
        
        score = v_norm * 0.4 + ro_ratio * 0.2 + td * 0.2 + d_gap * 0.2
        
        stations.append({
            "name": station,
            "score": float(score),
            "violations_norm": float(v_norm),
            "repeat_offender_ratio": float(ro_ratio),
            "timing_divergence": float(td),
            "device_count": int(d_count)
        })
        
    stations.sort(key=lambda x: x['score'], reverse=True)
    return {"stations": stations}
