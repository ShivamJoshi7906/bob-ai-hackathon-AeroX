# Task Specification: Member 2 — Backend & Decision Engine Engineer

**Git Branch:** `feat/backend-api`  
**Rubric Points Targeted:** Technical Implementation Quality (13/25 pts) + Problem Depth & Vision (10/15 pts)  
**Primary Peer Collaborators:**  
- Member 1 (Provides `rul_model.joblib` and `src/ml/predict.py`)  
- Member 3 (Consumes your REST API for the React dashboard)  
- Member 4 (Calls your service functions for IBM Bob tools)

---

## 1. Role Overview & Objective

You are responsible for:
1. Setting up the FastAPI backend, SQLAlchemy ORM models, SQLite database connection, and Pydantic validation schemas.
2. Building the **Failure Risk Engine** (LOW, MEDIUM, HIGH, CRITICAL).
3. Building the **Mission Readiness Engine** (0–100 score, 4 readiness categories, explainable evidence generation).
4. Building the **Maintenance Prioritization Engine** (P1 Critical, P2 Urgent, P3 Scheduled ranking with knowledge-base recommendations).
5. Exposing all locked REST API endpoints with clean JSON responses, error handling, and CORS enabled.
6. Writing automated backend integration tests (`tests/test_backend.py`).

---

## 2. Directory & File Ownership

You own and edit **ONLY** these files:
```
src/backend/app/
├── __init__.py
├── main.py                     # FastAPI application factory, CORS middleware, route registration
├── config.py                   # Pydantic Settings, DB paths, CORS origins
├── database.py                 # SQLAlchemy engine, SessionLocal, Base, get_db dependency
├── models/                     # SQLAlchemy ORM definitions
│   ├── __init__.py
│   ├── asset.py
│   ├── sensor.py
│   ├── maintenance.py
│   ├── mission.py
│   └── failure.py
├── schemas/                    # Pydantic request/response schemas (LOCKED CONTRACT)
│   ├── __init__.py
│   ├── asset_schema.py
│   ├── sensor_schema.py
│   ├── prediction_schema.py
│   ├── readiness_schema.py
│   ├── maintenance_schema.py
│   └── mission_schema.py
├── services/                   # Business & Decision logic
│   ├── __init__.py
│   ├── asset_service.py
│   ├── sensor_service.py
│   ├── prediction_service.py   # Loads Member 1's model artifact via MissionGuardPredictor
│   ├── readiness_service.py    # Mission-readiness & explanation engine
│   ├── maintenance_service.py  # Maintenance prioritization engine
│   └── mission_service.py      # Mission window evaluation
└── routes/                     # FastAPI route controllers
    ├── __init__.py
    ├── assets.py
    ├── sensors.py
    ├── predictions.py
    ├── readiness.py
    ├── maintenance.py
    └── missions.py

tests/
└── test_backend.py             # pytest suite for all endpoints and decision logic
```
*(Note: Member 4 owns `routes/bob.py` and `services/bob_service.py` to avoid merge conflicts!)*

---

## 3. Decision Logic & Engines (Core Hackathon Differentiation)

### 3.1 Failure Risk Scoring Engine (`services/prediction_service.py`)
Combine predicted RUL, early-warning probability, and sensor anomaly scores:
- **CRITICAL**: Predicted RUL $\le 20$ cycles OR `failure_within_30_prob` $\ge 0.70$
- **HIGH**: Predicted RUL between 21 and 40 cycles OR `failure_within_30_prob` $\ge 0.40$
- **MEDIUM**: Predicted RUL between 41 and 80 cycles
- **LOW**: Predicted RUL $> 80$ cycles

### 3.2 Mission Readiness Engine (`services/readiness_service.py`)
Compare asset predicted RUL against the synthetic mission window requirement (`mission_windows.csv`):
- Let $\Delta = \text{Predicted RUL} - \text{Mission Required Cycles}$.
- Calculate Readiness Score (0 to 100):
  - Base Score derived from RUL margin: if $\Delta \ge 30$, score is 95+; if $\Delta < 0$, score is below 50.
- **Readiness Categories**:
  - `READY` (Score 90–100): Healthy asset, RUL far exceeds mission window + buffer.
  - `READY WITH MONITORING` (Score 70–89): Asset can perform mission, but telemetry shows early degradation; alert crew.
  - `NEEDS INSPECTION` (Score 50–69): Buffer is narrow ($\Delta < 15$ cycles) or sensor anomalies rising; physical check required before sign-off.
  - `NOT READY` (Score 0–49): Predicted failure expected before or during mission window.
- **Evidence Generator (No Hallucinations)**:
  Generate structured bullet points based strictly on data:
  1. RUL vs Mission Delta: `"Predicted RUL ({rul} cycles) provides only {buffer} cycle buffer over mission requirement ({req} cycles)."`
  2. Sensor trend anomalies: `"HPC Outlet Temperature (s2) and Core Speed (s9) exhibit negative drift over recent 20 cycles."`
  3. Failure probability: `"30-cycle early-warning failure probability is elevated at {prob}%."`

### 3.3 Maintenance Prioritization Engine (`services/maintenance_service.py`)
Rank assets into 3 actionable tiers:
1. **P1 — CRITICAL**: Assets classified as `NOT READY` or with `CRITICAL` risk scheduled for mission within 30 days. Action: *"Ground asset; immediate teardown/overhaul of HPC module."*
2. **P2 — URGENT**: Assets in `NEEDS INSPECTION` or `HIGH` risk. Action: *"Borescope inspection of compressor blades; calibrate fuel flow stand-off."*
3. **P3 — SCHEDULED**: Assets in `READY WITH MONITORING` or `MEDIUM` risk. Action: *"Scheduled servicing at next turnaround; monitor vibration telemetry."*

**Knowledge Retrieval**: Match issue keywords with `maintenance_records.csv` to suggest proven repair actions, tagging response with `"synthetic_linkage_note": "Recommended action derived from public maintenance log knowledge base."`

---

## 4. Locked REST API Endpoints & Response Contracts

Every endpoint below is consumed by Member 3 (Frontend) and Member 4 (IBM Bob). **Do not rename fields!**

### `GET /api/fleet/summary`
```json
{
  "total_assets": 38,
  "ready_count": 18,
  "monitoring_count": 9,
  "inspection_count": 6,
  "not_ready_count": 5,
  "critical_risk_count": 4,
  "high_risk_count": 7,
  "upcoming_missions_30d": 12,
  "urgent_maintenance_p1": 4
}
```

### `GET /api/assets`
Query params: `status` (optional), `risk` (optional), `search` (optional)
```json
[
  {
    "asset_id": "AC-003",
    "asset_type": "Turbofan-A",
    "total_operating_hours": 179,
    "mission_criticality": "high",
    "predicted_rul": 18.4,
    "risk_level": "CRITICAL",
    "readiness_score": 42.0,
    "readiness_category": "NOT READY",
    "next_mission_date": "2026-10-31",
    "next_mission_priority": "critical"
  }
]
```

### `GET /api/assets/{asset_id}`
```json
{
  "asset_id": "AC-003",
  "source_asset_id": 3,
  "asset_type": "Turbofan-A",
  "mission_criticality": "high",
  "service_age": 7,
  "total_operating_hours": 179,
  "maintenance_count": 1,
  "last_maintenance_cycle": 89,
  "latest_cycle": 179,
  "operational_setting_1": 0.0008,
  "operational_setting_2": 0.0005,
  "operational_setting_3": 100.0
}
```

### `GET /api/assets/{asset_id}/sensors`
Query param: `recent_cycles` (default: 50)
```json
{
  "asset_id": "AC-003",
  "cycles_count": 50,
  "readings": [
    {
      "cycle": 130,
      "s2": 642.5,
      "s3": 1588.2,
      "s4": 1404.1,
      "s7": 553.8,
      "s8": 2388.1,
      "s9": 9054.2,
      "s11": 47.4,
      "s12": 521.8,
      "s14": 8139.1,
      "s15": 8.43,
      "s17": 392,
      "s20": 38.8,
      "s21": 23.35
    }
  ]
}
```

### `GET /api/assets/{asset_id}/prediction`
```json
{
  "asset_id": "AC-003",
  "current_cycle": 179,
  "predicted_rul": 18.4,
  "confidence_interval": [15.2, 21.6],
  "failure_within_30_prob": 0.88,
  "degradation_stage": "severe",
  "dominant_sensors": ["s2", "s11", "s4"]
}
```

### `GET /api/assets/{asset_id}/readiness`
```json
{
  "asset_id": "AC-003",
  "readiness_score": 42.0,
  "readiness_category": "NOT READY",
  "mission_id": "MSN-0001",
  "mission_window_start": "2026-10-31",
  "mission_window_end": "2026-11-05",
  "required_readiness_threshold": 0.85,
  "mission_cycles_required": 30,
  "predicted_rul": 18.4,
  "buffer_cycles": -11.6,
  "risk_level": "CRITICAL",
  "evidence_reasons": [
    "Predicted RUL (18.4 cycles) is 11.6 cycles below the upcoming mission requirement (30 cycles).",
    "Failure-within-30-cycles risk probability is critical at 88.0%.",
    "HPC outlet temperature (s2) trend shows continuous thermal degradation over the past 20 cycles."
  ],
  "recommended_action": "Ground asset immediately and perform comprehensive High Pressure Compressor overhaul."
}
```

### `GET /api/maintenance/priorities`
```json
[
  {
    "priority": "P1",
    "priority_label": "CRITICAL",
    "asset_id": "AC-003",
    "risk_level": "CRITICAL",
    "predicted_rul": 18.4,
    "readiness_category": "NOT READY",
    "issue": "Severe HPC degradation with imminent mission failure",
    "mission_impact": "Will fail during upcoming mission MSN-0001 (requires 30 cycles)",
    "recommended_action": "Immediate teardown and replacement of HPC rotor assembly",
    "knowledge_base_match": {
      "relevant_component": "INTAKE GASKET / COMPRESSOR",
      "action_type": "REMOVED & REPLACED",
      "action_taken": "REMOVED & REPLACED HPC GASKET AND VERIFIED CLEARANCES",
      "synthetic_linkage_note": "Derived from public aircraft maintenance knowledge base"
    }
  }
]
```

---

## 5. Startup Sequence & Model Loading (`main.py`)

1. Load `src/backend/models_artifacts/rul_model.joblib` into memory once during FastAPI lifespan startup.
2. Initialize SQLite database and verify all 38 assets are present.
3. Configure CORS:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

---

## 6. Step-by-Step Git Commands

```bash
# 1. Checkout your branch
git checkout -b feat/backend-api

# 2. Develop and run backend
uvicorn src.backend.app.main:app --reload --port 8000

# 3. Run automated tests
pytest tests/test_backend.py

# 4. Commit and push
git add src/backend/app/ tests/test_backend.py
git commit -m "feat(backend): complete SQLAlchemy models, decision engines, and FastAPI REST endpoints"
git push -u origin feat/backend-api
```
Notify **Member 4** once pushed!
