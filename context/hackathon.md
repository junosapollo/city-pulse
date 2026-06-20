# CityPulse — Final Project Brief

**Hackathon:** Flipkart Gridlock 2.0 (Round 2 — Prototype Phase)
**Theme Selected:** Theme 1 — Poor Visibility on Parking-Induced Congestion
**Datasets:** 2 real, anonymized BTP datasets (traffic events + parking enforcement)
**Status:** Final brief — ready to build

---

## 1. One-Line Pitch

> **An AI-powered parking intelligence system that fuses 298K real enforcement records with 8K traffic incident reports to expose where illegal parking is choking Bengaluru's roads — and tells BTP exactly where to deploy next.**

---

## 2. Why Theme 1

The hackathon requires selecting one of three themes. Here's why Theme 1 is our strongest play:

| Theme | Data Fit | Verdict |
|---|---|---|
| 1 — Parking-Induced Congestion | 93% of our 298K records are parking violations. Full geo-coverage. Cross-dataset join works. | ✅ **Selected** |
| 2 — Event-Driven Congestion | Only 84 `public_event` rows across 5 months. `resolved_datetime` is 0.9% filled. Cannot credibly forecast. | ❌ Too sparse |
| 3 — CV Violation Detection | Zero image data in either dataset. Cannot demo a single detection. | ❌ Impossible |

Theme 1's problem statement asks for three things:
1. **Detect illegal parking hotspots** → we have 277K+ geo-coded parking violations
2. **Quantify their impact on traffic flow** → we can cross-join with 8K traffic incidents via `police_station`
3. **Enable targeted enforcement** → our timing analysis reveals when and where enforcement is misaligned with incidents

No other team is likely to have real BTP enforcement data at this scale. That's our moat.

---

## 3. The Datasets

### Dataset A — Astram Event Data
*8,173 rows · 46 columns · Nov 2023 – Apr 2024*

Traffic incidents across Bengaluru: breakdowns, accidents, water-logging, tree falls, construction, planned events.

**Usable fields:**

| Field | Fill Rate | Role in CityPulse |
|---|---|---|
| `latitude` / `longitude` | 100% | Incident geomapping |
| `corridor` | 99.8% | Geographic grouping for hotspot detection |
| `event_cause` | 100% | Breakdown / accident / waterlogging / etc. |
| `event_type` | 100% | Planned vs unplanned split |
| `priority` | ~100% | Severity weighting |
| `police_station` | 100% | **Cross-dataset join key** |
| `status` | 100% | Active / closed / resolved |
| `start_datetime` | 100% | Temporal pattern analysis |
| `closed_datetime` | 38.4% | Response time proxy |

**Key validated findings:**
- 7,706 unplanned vs 467 planned events
- Top corridor: Mysore Road — 564 vehicle breakdowns
- Water-logging clusters: Mysore Road (41), Bannerghata Road (35)
- Accident spike at 11 PM (69 events), elevated midnight–5 AM
- Only 84 `public_event` entries — too sparse for any ML model

**Unusable fields:** `resolved_datetime` (0.9%), `zone` (42.1%), `junction` (30.7%, naming incompatible with Dataset B), `description` (16.6%, multilingual free-text)

---

### Dataset B — Police Violation Data
*298,450 rows · 24 columns · Nov 2023 – Apr 2024*

Parking and traffic violation enforcement records.

**Usable fields:**

| Field | Fill Rate | Role in CityPulse |
|---|---|---|
| `latitude` / `longitude` | 100% | Violation geomapping, spatial clustering |
| `violation_type` | 100% | Violation classification (93% parking) |
| `vehicle_type` | 100% | Vehicle profile analysis |
| `vehicle_number` | 100% | Repeat-offender tracking |
| `created_datetime` | 100% | Temporal patterns, predictive features |
| `police_station` | ~100% | **Cross-dataset join key** |
| `device_id` | 100% | Enforcement hardware audit |
| `validation_status` | 58% | Approved / rejected / duplicate — QA signal |
| `center_code` | 96.2% | Zone identifier |

**Key validated findings:**
- **93% are parking violations:** Wrong Parking (164,977), No Parking (139,050), Parking in Main Road (23,943). Counts include multi-label records (a single record tagged `["WRONG PARKING","PARKING NEAR ROAD CROSSING"]` counts toward both Wrong Parking and its secondary type).
- Enforcement peaks 2–6 AM (13,700–17,100 per hour), near-zero 10 AM–4 PM
- 49.5% of records tagged `"No Junction"` — a real coverage blind spot
- 3,070 distinct enforcement devices; rejection rates vary 11–21% by device
- 3,489 vehicles (1.5%) with 5+ violations — repeat offenders
- **Zero image data** — only structured, post-classified records

**Unusable fields:** `description` (0%), `closed_datetime` (0%), `action_taken_timestamp` (0%)

---

### Cross-Dataset Link

Both datasets share the **same 54 police station names** at ~100% fill rate. This is the only reliable join key — `corridor` (Dataset A) and `junction_name` (Dataset B) use incompatible naming schemes.

Validated composite ranking: **HAL Old Airport, Kodigehalli, Halasuru Gate** rank highest on both parking-violation density and traffic-incident density simultaneously.

---

## 4. Feature Set

Every feature directly answers one of Theme 1's three requirements.

### Feature 1 — Parking Hotspot Heatmap
**Answers:** *"Detect illegal parking hotspots"*

- Spatial heatmap of 277K+ parking violations using H3 hexagonal binning or DBSCAN clustering
- Filterable by violation type, time window, vehicle type
- Drill-down to individual police station or cluster level
- Color-coded by violation density with the most congested zones highlighted

**Data:** Dataset B — `latitude`, `longitude`, `violation_type`, `created_datetime`, `vehicle_type`

---

### Feature 2 — Congestion Correlation Engine
**Answers:** *"Quantify their impact on traffic flow"*

- Police-station-level scatter plot: X-axis = normalized parking violation count, Y-axis = normalized traffic incident count
- Stations in the top-right quadrant = **proven congestion zones** where parking problems co-occur with traffic incidents
- Correlation coefficient displayed — this is the core data-fusion story
- Breakdown by incident type (accidents vs breakdowns vs waterlogging) per high-parking station

**Data:** Datasets A + B joined on `police_station`

---

### Feature 3 — Enforcement Gap Analysis
**Answers:** *"Enable targeted enforcement"*

- Dual time-series overlay: parking enforcement activity (peaks 2–6 AM) vs accident/incident occurrence (peaks 11 PM–early morning)
- Per-station **violation-timing vs. incident-timing divergence score**: computed purely from the hour-of-day distribution of `created_datetime` (violations) and `start_datetime` (incidents). This measures how misaligned the two distributions are per station — it is *not* a measure of patrol hours or officer staffing, neither of which exist in the data.
- **Verified city-wide baseline:** 38.1% of all parking enforcement activity (113,666 of 298,450 violations) is logged between 2–6 AM, while only 0.5% occurs 10 AM–4 PM. Meanwhile, 49.3% of all accidents (180 of 365) occur between 11 PM–5 AM. The enforcement window overlaps the accident window — but the per-station breakdown will reveal where the overlap is weakest.
- Day-of-week patterns: weekday vs weekend enforcement vs incident distributions

**Data:** Both datasets — `created_datetime` / `start_datetime` + `police_station`

---

### Feature 4 — Parking Pressure Score
**Answers:** All three requirements (composite metric)

- Original composite metric per police station:
  - `parking_violations_per_station` (normalized) — real, computable from Dataset B
  - `× repeat_offender_concentration` (vehicles with 5+ violations in that station) — real, computable from Dataset B `vehicle_number` frequency
  - `× violation_incident_timing_divergence` (how misaligned the hour-of-day distribution of violations is from the hour-of-day distribution of incidents at that station — computed purely from `created_datetime` and `start_datetime` hour buckets, not from staffing or patrol-hours data, which does not exist in either dataset)
  - `÷ device_coverage` (count of distinct `device_id` per station — verified computable, ranges from ~247 devices in Cubbon Park to ~36 in Devanahalli Airport)
- Ranked leaderboard of all 54 stations — top 10 "most parking-pressured" and bottom 10 "best-managed"
- Presented as a named, defensible metric we can explain end-to-end — every term traces to a specific field and computation

**Data:** Both datasets — all fields from Features 1–3

---

### Feature 5 — Predictive Hotspot Forecast
**Answers:** *"Detect illegal parking hotspots"* (forward-looking)

- Lightweight ML model (XGBoost / LightGBM) trained on 298K records
- Features: `hour_of_day`, `day_of_week`, `month`, `police_station`, `vehicle_type`
- Target: violation count per station per time window
- Output: **"Tomorrow's Top 5 Hotspots"** — a predicted ranking of which stations will see the most violations in the next 24h
- 5 months of data with clear temporal cycles (overnight peaks, weekday/weekend) is sufficient for credible time-series forecasting
- Model evaluated with train/test split — show RMSE and feature importance in the UI
- **Framing note:** In the demo, describe this as *pattern-based forecasting from historical hour/day-of-week trends*. It does not incorporate live conditions (weather, real-time event feeds, that day's actual incidents) — there is no real-time data feed available. Do not imply otherwise.

**Data:** Dataset B — `created_datetime`, `police_station`, `vehicle_type`

---

### Feature 6 — Hardware Health Monitor
**Answers:** System reliability (operational credibility)

- Per-device breakdown: total captures, approval rate, rejection rate, duplicate rate
- Flag devices with rejection rate > 15% or duplicate rate > 10% as "needs recalibration"
- Map showing device locations with health status indicators
- **Why judges care:** shows we understand the enforcement pipeline, not just the data

**Data:** Dataset B — `device_id`, `validation_status`

---

### Feature 7 — Chronic Offender Tracker
**Answers:** *"Enable targeted enforcement"*

- 3,489 vehicles with 5+ violations identified
- Heatmap of where repeat offenders cluster geographically
- Vehicle type distribution among chronic offenders
- Time-of-day patterns for repeat violations
- **Enforcement recommendation:** "These 1.5% of vehicles account for X% of all violations — targeted enforcement here has outsized impact"

**Data:** Dataset B — `vehicle_number`, `latitude`, `longitude`, `violation_type`

---

### Feature 8 — Junction Coverage Gap Map
**Answers:** Meta-insight for BTP data quality improvement

- 49.5% of violations tagged `"No Junction"` — map these spatially
- Overlay with known junction locations to identify where enforcement data has the weakest spatial resolution
- **Recommendation to BTP:** "Adding junction tagging in these areas would improve your intelligence quality"
- Low effort, high credibility — shows we looked beyond the surface

**Data:** Dataset B — `junction_name`, `latitude`, `longitude`

---

## 5. Deliberately Excluded

| Idea | Why Excluded |
|---|---|
| Computer vision / image detection | Zero image data exists in either dataset — cannot demo |
| Invented capacity/ripple formulas | No field measures lane capacity or recovery time — collapses under judge questioning |
| Planned event forecasting | Only 84 records — presenting a lookup table as "AI forecasting" is dishonest |
| Native Android app | Unnecessary scope — a web prototype demos faster and is equally impressive |
| NLP on description fields | 16.6% fill rate, multilingual, free-text — unreliable feature extraction |

---

## 6. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | Next.js + Leaflet/Mapbox (maps) + Recharts (charts) | Fast to build, beautiful maps, interactive charts |
| Backend | Python (FastAPI) | Data processing, model serving, CSV → API |
| ML | scikit-learn / XGBoost | Lightweight, sufficient for temporal forecasting |
| Data Processing | Pandas | Both CSVs fit comfortably in memory |
| Deployment | Local demo | Hackathon prototype — no cloud infra needed |

---

## 7. Build Order (Priority-Ranked)

| # | Feature | Est. Time | Impact | Why This Order |
|---|---|---|---|---|
| 1 | Parking Hotspot Heatmap | 3–4h | 🟢 Critical | First "wow" visual — proves the data is real and geo-coded |
| 2 | Congestion Correlation Engine | 2–3h | 🟢 Critical | The cross-dataset fusion story — this is what no other team has |
| 3 | Enforcement Gap Analysis | 2h | 🟢 Critical | Direct answer to "enable targeted enforcement" — actionable output |
| 4 | Parking Pressure Score | 2h | 🟡 High | Original metric, ranked leaderboard — strong visual and narrative |
| 5 | Predictive Hotspot Forecast | 3–4h | 🟡 High | ML model adds "AI" credibility — judges expect some modeling |
| 6 | Hardware Health Monitor | 1h | 🟡 Medium | Quick build, operational depth — shows system-level thinking |
| 7 | Chronic Offender Tracker | 1–2h | 🟡 Medium | Enforcement feature — adds actionable intelligence |
| 8 | Junction Coverage Gap Map | 1h | 🟡 Medium | Meta-insight — shows intellectual honesty about data quality |

**Minimum viable demo:** Features 1–3 (~7–9h)
**Strong demo:** Features 1–5 (~12–15h)
**Full prototype:** All 8 features (~16–20h)

---

## 8. Demo Narrative (3-Minute Pitch Structure)

1. **Problem** (30s): "Bengaluru Traffic Police generates 300K enforcement records per year but has no system to connect parking violations to their actual congestion impact."

2. **The Data Story** (30s): "We fused two real BTP datasets — 298K parking violations and 8K traffic incidents — using the one key that actually connects them: police station. Most teams simulate. We used real data."

3. **Live Demo** (90s): Walk through Features 1→2→3 — hotspot map, then correlation view ("see how HAL Old Airport has both high parking violations AND high accidents"), then timing mismatch ("enforcement peaks at 3 AM but accidents peak at 11 PM — here's where to shift patrols").

4. **The AI Layer** (20s): Show Feature 5 — "Tomorrow's predicted top 5 hotspots" with model accuracy metrics.

5. **Impact** (10s): "Every recommendation traces to a real number. Every hotspot is a real location. Every insight is actionable tomorrow."

---

## 9. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| "Where's the AI?" — judges expect ML | Feature 5 (XGBoost prediction) + Feature 4 (composite scoring) cover this |
| "This is just a dashboard" | The correlation engine (Feature 2) and enforcement recommendations (Feature 3) are analytical outputs, not just visualizations |
| "Can this work in production?" | Explicitly built on real BTP data fields at near-100% fill rates — no synthetic data or assumptions |
| "Why not computer vision?" | Honest answer: "No image data exists in the provided datasets. We built on what's real." This honesty scores points. |
| Cross-dataset join is coarse (police station level, not junction) | Acknowledge openly, present Junction Coverage Gap (Feature 8) as a recommendation to BTP for improving future data quality |

---

## 10. Win Conditions

This project wins because:

1. **Real data, real numbers.** Every claim traces back to a specific row count or statistic that can be recomputed live during the demo. No invented formulas, no simulated data.

2. **Genuine multi-dataset fusion.** The `police_station` join is the only reliable bridge between these two datasets, and we're the team that found and validated it. The correlation between parking violations and traffic incidents is a real, novel finding.

3. **Directly answers Theme 1.** Every feature maps to one of the three requirements: detect hotspots, quantify impact, enable enforcement. No feature is off-theme.

4. **Actionable for BTP.** We don't just show where the problems are — we tell them what to do (shift patrol windows, recalibrate devices, focus on repeat offenders). The Flipkart Gridlock hackathon explicitly values solutions with "real-world implementation" potential.

5. **Intellectually honest.** We excluded CV (no data), event forecasting (insufficient sample), and invented metrics (no supporting fields). Judges reward teams that know the limits of their data.