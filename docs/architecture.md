# Technical Architecture: MissionGuard AI

**Team:** AeroX  
**Challenge:** D1 — Mission Readiness & Predictive Maintenance Copilot  

---

## 1. System Architecture Diagram

```mermaid
graph TD
    subgraph Data Tier
        RAW[NASA C-MAPSS FD001 + Maintenance Logs] --> SEED[Data Loader & Ingestion Script]
        SEED --> SQLITE[(SQLite Relational DB)]
    end

    subgraph Machine Learning Tier
        SQLITE --> FEAT[Feature Extractor: 13 Sensors + Rolling Stats]
        FEAT --> TRAIN[Model Trainer: GradientBoosting & RandomForest]
        TRAIN --> ARTIFACT[Model Artifact: rul_model.joblib]
        TRAIN --> METRICS[Real Test Metrics: metrics.json]
    end

    subgraph Backend & Decision Tier - FastAPI
        ARTIFACT --> PRED_SRV[Prediction Service]
        SQLITE --> ASSET_SRV[Asset & Sensor Service]
        PRED_SRV & SQLITE --> RISK_ENG[Failure Risk Engine]
        RISK_ENG & SQLITE --> READY_ENG[Mission Readiness Engine]
        READY_ENG & SQLITE --> MAINT_ENG[Maintenance Prioritization Engine]
        
        PRED_SRV & ASSET_SRV & READY_ENG & MAINT_ENG --> REST_API[FastAPI REST Router]
    end

    subgraph IBM Bob Decision Copilot Tier
        REST_API --> BOB_TOOLS[Bob 9 MCP Tools Registry]
        BOB_TOOLS --> BOB_REASON[Bob Reasoning & Intent Engine]
        BOB_REASON --> BOB_API[POST /api/bob/query]
    end

    subgraph Frontend Tier - React 18 & TypeScript
        REST_API --> UI_FLEET[1. Fleet Dashboard]
        REST_API --> UI_ASSET[2. Asset Details & RUL]
        REST_API --> UI_SENSORS[3. Sensor Analytics Recharts]
        REST_API --> UI_MAINT[4. Maintenance Center]
        REST_API --> UI_MISSIONS[5. Mission Windows Scenarios]
        BOB_API --> UI_BOB[6. IBM Bob Copilot Terminal]
    end
```

---

## 2. Component Inventory & Responsibilities

| Component | Tech Stack | Primary Responsibility |
|---|---|---|
| **Data Layer** | SQLite, SQLAlchemy ORM | Manages tables for assets, sensor readings (8,169 cycles), maintenance records, failure events, mission windows, and component health. |
| **ML Pipeline** | Python, scikit-learn, joblib | Anti-leakage rolling feature extraction, RUL regression modeling, 30-cycle early warning classification, offline evaluation on 5 unseen test engines. |
| **Backend REST API** | FastAPI, Pydantic, Uvicorn | Exposes typed REST endpoints for fleet summaries, asset telemetry, RUL predictions, readiness evaluations, and maintenance rankings. |
| **Decision Engines** | Python services | Evaluates risk tiers (`LOW` to `CRITICAL`), computes mission compatibility (0–100 score + 4 categories), and prioritizes maintenance (P1–P3). |
| **IBM Bob Copilot** | Python, MCP Tools, REST | Structured reasoning agent equipped with 9 domain tools to explain non-ready assets, sensor evidence, and immediate maintenance actions. |
| **Frontend Dashboard** | React 18, TypeScript, Vite, Tailwind CSS, Recharts | High-density aerospace command console providing 6 operational views, responsive degradation charts, and an interactive Bob copilot chat. |

---

## 3. Data Flow End-to-End

1. **Telemetry Ingestion**: HUMS sensor readings ($s_2$ through $s_{21}$) are recorded per operating cycle.
2. **Feature Computation**: Rolling backward statistics (mean, std, delta over 5, 10, 20 cycles) are computed without future cycle visibility.
3. **Model Inference**: The trained `rul_model.joblib` predicts remaining useful life cycles.
4. **Mission Evaluation**: The system fetches the next scheduled mission window and compares required operating cycles against the predicted RUL.
5. **Readiness & Evidence**: If $\text{RUL} < \text{Mission Requirement} + \text{Safety Buffer}$, the asset is classified as `NOT READY` or `NEEDS INSPECTION`, and explicit physical telemetry drift reasons are generated.
6. **Maintenance Prioritization**: The asset is placed into the P1 Critical queue with recommended maintenance procedures from the knowledge base.
7. **Bob Copilot Action**: Commanders query Bob in natural language, and Bob invokes domain tools to present the readiness status and next steps.
