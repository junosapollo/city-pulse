from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import data_loader
from features import (
    hotspot,
    correlation,
    enforcement_gap,
    pressure_score,
    prediction,
    hardware_health,
    offender,
    junction_gap
)

app = FastAPI(title="CityPulse API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

cache = {}

@app.on_event("startup")
async def startup_event():
    v_df = data_loader.violations_df
    e_df = data_loader.events_df
    
    print("Computing feature data at startup...")
    
    cache['hotspot'] = hotspot.compute(v_df, e_df)
    cache['correlation'] = correlation.compute(v_df, e_df)
    cache['enforcement_gap'] = enforcement_gap.compute(v_df, e_df)
    cache['pressure_score'] = pressure_score.compute(v_df, e_df)
    cache['prediction'] = prediction.compute(v_df, e_df)
    cache['hardware_health'] = hardware_health.compute(v_df, e_df)
    cache['offender'] = offender.compute(v_df, e_df)
    cache['junction_gap'] = junction_gap.compute(v_df, e_df)
    
    parking_types = {
        "WRONG PARKING",
        "NO PARKING",
        "PARKING IN A MAIN ROAD",
        "PARKING ON FOOTPATH",
        "PARKING NEAR ROAD CROSSING"
    }
    
    def is_parking(types_list):
        return bool(set(types_list) & parking_types)

    parking_count = int(v_df['violation_types_list'].apply(is_parking).sum())
    
    cache['overview'] = {
        "total_violations": len(v_df),
        "total_events": len(e_df),
        "total_stations": len(data_loader.OVERLAPPING_STATIONS),
        "parking_pct": float(parking_count / len(v_df) * 100) if len(v_df) > 0 else 0,
        "top_station": cache['hotspot']['stations'][0]['name'] if cache['hotspot']['stations'] else "Unknown",
        "date_range": {
            "start": str(data_loader.DATASET_FIRST_DATE),
            "end": str(data_loader.DATASET_LAST_DATE)
        }
    }
    
    print("Startup complete. Data cached.")

@app.get("/api/overview")
async def get_overview():
    return cache.get('overview', {})

@app.get("/api/hotspot")
async def get_hotspot():
    return cache.get('hotspot', {})

@app.get("/api/correlation")
async def get_correlation():
    return cache.get('correlation', {})

@app.get("/api/enforcement-gap")
async def get_enforcement_gap():
    return cache.get('enforcement_gap', {})

@app.get("/api/pressure-score")
async def get_pressure_score():
    return cache.get('pressure_score', {})

@app.get("/api/prediction")
async def get_prediction():
    return cache.get('prediction', {})

@app.get("/api/hardware-health")
async def get_hardware_health():
    return cache.get('hardware_health', {})

@app.get("/api/offenders")
async def get_offenders():
    return cache.get('offender', {})

@app.get("/api/junction-gap")
async def get_junction_gap():
    return cache.get('junction_gap', {})
