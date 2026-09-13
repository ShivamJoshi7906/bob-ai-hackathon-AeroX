# IBM Bob Integration Architecture: MissionGuard AI

**Team:** AeroX  
**Challenge:** D1 — Mission Readiness & Predictive Maintenance Copilot  

---

## 1. Load-Bearing Copilot Design

In MissionGuard AI, **IBM Bob is not an optional decorative chatbot**. Bob functions as the **operational reasoning copilot** connecting non-technical commanders and maintenance chiefs to complex telemetry data, machine learning predictions, and scheduling databases.

```
                  USER COMMANDER
                        ↓
            [ IBM Bob Natural Language Interface ]
                        ↓
       [ Bob Tool Orchestrator & Intent Classifier ]
                        ↓
         [ MissionGuard Structured MCP Tools ]
                        ↓
      [ FastAPI Services + ML Models + SQLite DB ]
                        ↓
             [ Structured Grounded Evidence ]
                        ↓
         [ Bob Evidence Synthesis & Actionable Plan ]
                        ↓
                  DECISION DELIVERED
```

---

## 2. The 9 MissionGuard Decision Tools

Bob interacts with MissionGuard via 9 strictly defined, typed tools:

| Tool Name | Arguments | Returns | Purpose |
|---|---|---|---|
| `get_fleet_summary` | None | Asset counts by readiness, critical risk count | Provides big-picture fleet readiness overview |
| `get_not_ready_assets` | None | List of non-ready assets with RUL & buffer | Filters to assets requiring immediate intervention |
| `get_asset_status` | `asset_id` | Current cycle, status, criticality | Retrieves core operational telemetry specs |
| `get_asset_prediction` | `asset_id` | Predicted RUL, degradation stage, key sensors | Fetches ML regression outputs |
| `get_asset_risk` | `asset_id` | Risk level, 30-cycle failure probability | Evaluates failure severity |
| `get_asset_sensor_trends` | `asset_id` | Recent temperature and speed trends | Extracts physical degradation indicators |
| `get_upcoming_mission` | `asset_id` | Window dates, required cycles, buffer | Assesses mission timeline feasibility |
| `get_maintenance_recommendations` | None | Ranked P1–P3 maintenance action queue | Delivers prioritized maintenance workflow |
| `search_maintenance_knowledge` | `query` | Matching repair procedures from logs | Recommends proven repair actions |

---

## 3. The 3 Mandatory Hackathon Queries

MissionGuard is specifically evaluated on its ability to answer three core operational questions:

### Query 1: *"Which assets are not ready?"*
- **Execution Flow**: Bob invokes `get_not_ready_assets()` to fetch all engines where predicted RUL is less than upcoming mission duration or where degradation risk is `CRITICAL`.
- **Response**: A clean, structured list detailing each non-ready engine, its predicted RUL, the negative buffer margin against its scheduled mission, and an immediate holding recommendation.

### Query 2: *"Why is AC-003 not ready?"*
- **Execution Flow**: Bob invokes `get_asset_status`, `get_asset_prediction`, and `get_upcoming_mission`.
- **Response**: A transparent explanation breakdown:
  1. *Mission Timeline*: Predicted RUL is below the mission requirement.
  2. *Sensor Evidence*: Specific physical indicators (e.g. HPC outlet temperature $s_2$ drift and core speed $s_9$ drop).
  3. *Risk Score*: Elevated failure-within-30-cycles probability.
  4. *Action Plan*: Immediate grounded inspection.

### Query 3: *"What should maintenance do first?"*
- **Execution Flow**: Bob invokes `get_maintenance_recommendations()` to retrieve the priority queue.
- **Response**: A ranked action brief separating P1 (Critical), P2 (Urgent), and P3 (Scheduled) items, explaining why the top asset is ranked first and citing relevant maintenance procedures.

---

## 4. Zero Hallucination Guarantee

Bob is strictly constrained to **grounded responses**:
- If an asset is not found, Bob reports an explicit missing asset error.
- All RUL values, risk levels, and sensor drift percentages are pulled directly from the ML and database layer.
- Maintenance actions derived from public logbooks include transparent provenance disclaimers.
