import pandas as pd
import scipy.stats
from data_loader import OVERLAPPING_STATIONS

def compute(violations_df, events_df):
    v_df = violations_df[violations_df['police_station'].isin(OVERLAPPING_STATIONS)]
    e_df = events_df[events_df['police_station'].isin(OVERLAPPING_STATIONS)]
    
    v_counts = v_df.groupby('police_station').size()
    e_counts = e_df.groupby('police_station').size()
    
    # Normalization
    v_min, v_max = v_counts.min(), v_counts.max()
    e_min, e_max = e_counts.min(), e_counts.max()
    
    v_norm_series = (v_counts - v_min) / (v_max - v_min) if v_max > v_min else v_counts * 0
    e_norm_series = (e_counts - e_min) / (e_max - e_min) if e_max > e_min else e_counts * 0
    
    stations = []
    
    for station in OVERLAPPING_STATIONS:
        v_raw = int(v_counts.get(station, 0))
        e_raw = int(e_counts.get(station, 0))
        
        station_e_df = e_df[e_df['police_station'] == station]
        breakdown = station_e_df.groupby('event_cause').size().to_dict()
        breakdown = {str(k): int(v) for k, v in breakdown.items()}
        
        stations.append({
            "name": station,
            "violations_norm": float(v_norm_series.get(station, 0)),
            "incidents_norm": float(e_norm_series.get(station, 0)),
            "violations_raw": v_raw,
            "incidents_raw": e_raw,
            "incident_breakdown": breakdown
        })
        
    # Align series for correlation
    v_aligned = [v_norm_series.get(s, 0) for s in OVERLAPPING_STATIONS]
    e_aligned = [e_norm_series.get(s, 0) for s in OVERLAPPING_STATIONS]
    
    r, p = scipy.stats.pearsonr(v_aligned, e_aligned)
    
    return {
        "stations": stations,
        "correlation_r": float(r),
        "correlation_p": float(p)
    }
