# CityPulse — Bengaluru Parking Intelligence Dashboard



CityPulse is an interactive intelligence dashboard that fuses two real BTP datasets — **298,450 parking violations** and **8,173 traffic incidents** — into 8 analytical features for urban traffic management.

## Features

| # | Feature | Description |
|---|---|---|
| 1 | **Spatial Hotspot Heatmap** | Parking violation density across 54 police stations with station & heatmap views |
| 2 | **Congestion Correlation Engine** | Pearson correlation between violation volume and traffic incidents per station |
| 3 | **Enforcement Gap Analysis** | Hour-by-hour comparison of violations vs incidents with Jensen-Shannon divergence |
| 4 | **Parking Pressure Score** | Composite metric (40/20/20/20 weighted) ranking stations by enforcement stress |
| 5 | **Predictive Hotspot Forecast** | XGBoost model predicting next-day violation counts by station and hour |
| 6 | **Hardware Health Monitor** | Device audit flagging cameras with rejection/duplicate rates above 90th percentile |
| 7 | **Chronic Offender Tracker** | Vehicles with ≥5 city-wide violations, masked numbers, expandable location maps |
| 8 | **Junction Coverage Gap Map** | Analysis of the ~49.5% of violations lacking junction tagging |

## Tech Stack

- **Backend:** Python · FastAPI · Pandas · SciPy · XGBoost · scikit-learn
- **Frontend:** Next.js · React · Leaflet (react-leaflet) · Recharts
- **Map Tiles:** CartoDB Dark Matter (OpenStreetMap)

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Linux/Mac
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The backend loads both CSV datasets at startup (~5–10s for XGBoost training), computes all features once, and caches results in memory.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Verification

```bash
cd backend
source venv/bin/activate
python verify.py
```

Runs 13 CSV-level checks and 5 API-level checks. All 18 must pass (exit code 0).

## Project Structure

```
city-pulse/
├── backend/
│   ├── main.py              # FastAPI app, routes, startup caching
│   ├── data_loader.py       # CSV loading, parsing, normalization
│   ├── verify.py            # Automated number verification
│   ├── requirements.txt
│   └── features/
│       ├── hotspot.py        # F1: Spatial clustering
│       ├── correlation.py    # F2: Cross-dataset correlation
│       ├── enforcement_gap.py # F3: Timing divergence
│       ├── pressure_score.py # F4: Composite metric
│       ├── prediction.py     # F5: XGBoost forecast
│       ├── hardware_health.py # F6: Device audit
│       ├── offender.py       # F7: Repeat offenders
│       └── junction_gap.py   # F8: Coverage gaps
├── frontend/
│   └── src/
│       ├── app/              # Next.js app router
│       ├── components/       # 12 React components
│       └── lib/api.js        # API client
├── dataset/                  # Raw CSV files (not committed)
└── context/hackathon.md      # Original brief
```

## Datasets

| Dataset | Rows | Date Range | Key Columns |
|---|---|---|---|
| Astram Event Data | 8,173 | 2023-11-09 → 2024-04-08 | start_datetime, event_type, event_cause, police_station |
| Police Violation Data | 298,450 | 2023-11-09 → 2024-04-08 | created_datetime, violation_type (JSON), vehicle_number, device_id |

## Key Numbers

- **54** overlapping police stations between both datasets
- **3,489** chronic offenders (≥5 violations city-wide)
- **3,070** enforcement camera devices
- **49.5%** of violations lack junction tagging
- Pearson correlation between violations and incidents: computed per run

## License

Apache-2.0 license 
