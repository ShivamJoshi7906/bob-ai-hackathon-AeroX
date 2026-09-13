# MissionGuard AI — Team Workflow & Git Merge Strategy
**BOB AI Hackathon 2026 — Challenge D1: Mission Readiness & Predictive Maintenance Copilot**

---

## 1. Overview & Objective

To maximize efficiency and score **85+ / 100** on the evaluation rubric without stepping on each other's toes, the project is divided into **4 distinct roles with mutually exclusive directory and file ownership**.

Following this protocol guarantees:
1. **Parallel Execution**: All 4 members can build and test their modules simultaneously.
2. **Deterministic Interfaces**: Every API endpoint, payload, schema, and file path is locked in advance.
3. **Zero Merge Conflicts**: Since file boundaries are strictly isolated, merging branches into `main` will be automatic and cleanly fast-forwarded or trivial.

---

## 2. Team Role Distribution & Points Contribution

| Member | Role | Git Branch | Core Responsibilities | Target Rubric Points |
|---|---|---|---|---|
| **Member 1** | **ML & Data Pipeline Engineer** | `feat/ml-pipeline` | Dataset ingestion, feature engineering, RUL regression model, classification model, real metrics generation, test splits. | **Technical Implementation (12/25)** + **Innovation (10/25)** |
| **Member 2** | **Backend & Decision Engineer** | `feat/backend-api` | SQLite database, SQLAlchemy ORM, FastAPI REST API, Failure Risk Engine, Mission Readiness Engine, Maintenance Prioritization Engine. | **Technical Implementation (13/25)** + **Problem Depth (10/15)** |
| **Member 3** | **Frontend UI/UX Engineer** | `feat/frontend-dashboard` | React + TypeScript + Vite + Tailwind CSS dashboard (Fleet, Asset Details, Sensors, Maintenance, Missions, Bob UI). | **Working Demo (15/15)** + **Innovation (5/25)** |
| **Member 4** | **IBM Bob, DevOps & Submission Lead** | `feat/bob-devops-lead` | IBM Bob reasoning copilot, MCP/REST tools, GitHub Actions validation, documentation suite, slide deck, final merge lead. | **IBM Bob (10/10)** + **Documentation (10/10)** + **Problem Depth (5/15)** |

---

## 3. Strict File & Directory Ownership Map (Zero-Conflict Guarantee)

Each member writes **ONLY** inside their designated folders/files. Do not edit other members' files!

```
MissionGuard/
│
├── [MEMBER 4] submission.yaml
├── [MEMBER 4] README.md
├── [MEMBER 4] CONTRIBUTING.md
├── [MEMBER 4] .gitignore
├── [MEMBER 4] TEAM_WORKFLOW_AND_GIT_GUIDE.md
├── [MEMBER 4] team-tasks/  (all 4 member specs)
│
├── .github/workflows/
│   └── [MEMBER 4] validate.yml
│
├── data/
│   └── [MEMBER 1] raw/ & processed/ CSVs & load_data.py
│
├── src/
│   ├── [MEMBER 4] .env.example
│   ├── [MEMBER 4] README.md
│   │
│   ├── ml/                                 <-- [MEMBER 1 ONLY]
│   │   ├── __init__.py
│   │   ├── features.py
│   │   ├── train.py
│   │   ├── evaluate.py
│   │   ├── predict.py
│   │   └── metrics.json
│   │
│   ├── backend/                            <-- [MEMBER 2 & 4]
│   │   ├── models_artifacts/               <-- [MEMBER 1 saves rul_model.joblib here]
│   │   │   ├── rul_model.joblib
│   │   │   └── classifier_model.joblib
│   │   └── app/
│   │       ├── main.py                     <-- [MEMBER 2]
│   │       ├── config.py                   <-- [MEMBER 2]
│   │       ├── database.py                 <-- [MEMBER 2]
│   │       ├── models/                     <-- [MEMBER 2] (ORM tables)
│   │       ├── schemas/                    <-- [MEMBER 2] (Pydantic models)
│   │       ├── services/
│   │       │   ├── asset_service.py        <-- [MEMBER 2]
│   │       │   ├── sensor_service.py       <-- [MEMBER 2]
│   │       │   ├── prediction_service.py   <-- [MEMBER 2]
│   │       │   ├── readiness_service.py    <-- [MEMBER 2]
│   │       │   ├── maintenance_service.py  <-- [MEMBER 2]
│   │       │   ├── mission_service.py      <-- [MEMBER 2]
│   │       │   └── bob_service.py          <-- [MEMBER 4 ONLY]
│   │       └── routes/
│   │           ├── assets.py               <-- [MEMBER 2]
│   │           ├── sensors.py              <-- [MEMBER 2]
│   │           ├── predictions.py          <-- [MEMBER 2]
│   │           ├── readiness.py            <-- [MEMBER 2]
│   │           ├── maintenance.py          <-- [MEMBER 2]
│   │           ├── missions.py             <-- [MEMBER 2]
│   │           └── bob.py                  <-- [MEMBER 4 ONLY]
│   │
│   └── frontend/                           <-- [MEMBER 3 ONLY]
│       ├── package.json
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       ├── src/
│       │   ├── api/
│       │   ├── types/
│       │   ├── components/
│       │   └── pages/
│       └── ...
│
├── docs/                                   <-- [MEMBER 4 with inputs from 1,2,3]
│   ├── problem-statement.md
│   ├── solution-overview.md
│   ├── architecture.md
│   ├── setup-guide.md
│   ├── ml-methodology.md
│   ├── bob-integration.md
│   ├── data-provenance.md
│   └── hackathon-score-audit.md
│
├── demo/                                   <-- [MEMBER 4]
│   ├── demo-video-link.txt
│   ├── live-demo-url.txt
│   ├── screenshots/
│   └── README.md
│
├── presentation/                           <-- [MEMBER 4]
│   └── slides.pdf
│
└── tests/
    ├── test_data.py                        <-- [MEMBER 1]
    ├── test_ml.py                          <-- [MEMBER 1]
    ├── test_backend.py                     <-- [MEMBER 2]
    └── test_bob.py                         <-- [MEMBER 4]
```

---

## 4. Git Branching & Step-by-Step Workflow

### Step 1: Initial Setup on Main Branch
1. Remote repository linked: `https://github.com/ShivamJoshi7906/bob-ai-hackathon-AeroX`
2. Commit initial skeleton (`main` branch) including this workflow guide and `team-tasks/`.
3. Push to `main`:
   ```bash
   git add .
   git commit -m "chore: initial project structure and task specifications for Team AeroX"
   git push -u origin main
   ```

### Step 2: Each Member Clones and Creates Their Dedicated Branch
All members clone the repo and immediately branch off `main`:
```bash
# Clone the team repository:
git clone https://github.com/ShivamJoshi7906/bob-ai-hackathon-AeroX.git
cd bob-ai-hackathon-AeroX
```

Then switch to your designated branch:
- **Member 1 (ML & Data Pipeline)**:
  ```bash
  git checkout -b feat/ml-pipeline
  ```
- **Member 2 (Backend & Decision Engines)**:
  ```bash
  git checkout -b feat/backend-api
  ```
- **Member 3 (Frontend Operations Dashboard)**:
  ```bash
  git checkout -b feat/frontend-dashboard
  ```
- **Member 4 (IBM Bob, DevOps & Submission Lead)**:
  ```bash
  git checkout -b feat/bob-devops-lead
  ```

### Step 3: Independent Development & Local Testing
- Work according to your individual task specification in `team-tasks/MEMBER_X_*.md`.
- Run tests locally in your branch.
- Commit regularly to your own branch:
  ```bash
  git add <your-owned-files>
  git commit -m "feat(module): description of completed feature"
  git push -u origin <your-branch-name>
  ```

### Step 4: The Clean Sequential Merge Protocol (Managed by Member 4)
When everyone is done, Member 4 performs the merges into `main` in the following sequence:

1. **Merge Member 1 (`feat/ml-pipeline`) first**:
   - Ingests verified dataset and builds the ML model artifact (`rul_model.joblib`).
   ```bash
   git checkout main
   git merge feat/ml-pipeline --no-ff -m "merge: feat/ml-pipeline (ML pipeline and trained models)"
   git push origin main
   ```

2. **Merge Member 2 (`feat/backend-api`) second**:
   - Integrates database, FastAPI routes, and decision engines (which load Member 1's model artifact).
   ```bash
   git checkout main
   git merge feat/backend-api --no-ff -m "merge: feat/backend-api (FastAPI backend and decision engines)"
   git push origin main
   ```

3. **Merge Member 3 (`feat/frontend-dashboard`) third**:
   - Merges the entire `src/frontend/` dashboard (isolated in its own folder).
   ```bash
   git checkout main
   git merge feat/frontend-dashboard --no-ff -m "merge: feat/frontend-dashboard (React operations dashboard)"
   git push origin main
   ```

4. **Merge Member 4 (`feat/bob-devops-lead`) last**:
   - Merges Bob Copilot service, routes, docs, demo artifacts, and `submission.yaml`.
   ```bash
   git checkout main
   git merge feat/bob-devops-lead --no-ff -m "merge: feat/bob-devops-lead (Bob Copilot, docs, and submission)"
   git push origin main
   ```

5. **Final End-to-End Sanity Check**:
   ```bash
   # Run automated test suite
   pytest tests/
   # Check GitHub Action status
   # Actions tab -> Confirm 'Validate Submission' is GREEN!
   ```

---

## 5. Master Contract: Locked API Endpoints & Interfaces

All members must use these exact signatures. **Do not alter these URLs, query params, or field names!**

| Endpoint | Method | Params / Body | Description | Consumer |
|---|---|---|---|---|
| `/api/fleet/summary` | GET | None | Total assets, readiness counts, risk counts, urgent maintenance count | Member 3 (Dashboard) & Member 4 (Bob) |
| `/api/assets` | GET | `?status=&risk=&search=` | List of all 38 assets with current status, RUL, risk, and criticality | Member 3 (Asset Table) |
| `/api/assets/{asset_id}` | GET | Path: `asset_id` (e.g. `AC-003`) | Detailed asset information, operational specs, and lifetime | Member 3 (Asset Detail) |
| `/api/assets/{asset_id}/sensors` | GET | `?recent_cycles=50` | Telemetry history (s2, s3, s4, s7, s8, s9, s11, s12, s14, s15, s17, s20, s21) | Member 3 (Sensor Analytics) |
| `/api/assets/{asset_id}/prediction` | GET | None | Predicted RUL, confidence bounds, failure-within-30 prob, degradation stage | Member 3 & Member 4 |
| `/api/assets/{asset_id}/readiness` | GET | None | Score (0-100), category, mission buffer, evidence bullet points, recommended action | Member 3 & Member 4 |
| `/api/assets/{asset_id}/maintenance` | GET | None | Synthetic linked maintenance records and recommended procedures from knowledge base | Member 3 & Member 4 |
| `/api/assets/{asset_id}/mission` | GET | None | Next mission window start/end, priority, required RUL, buffer margin | Member 3 & Member 4 |
| `/api/maintenance/priorities` | GET | `?priority=P1` | Ranked maintenance recommendations (P1 Critical, P2 Urgent, P3 Scheduled) | Member 3 & Member 4 |
| `/api/missions/upcoming` | GET | None | All synthetic upcoming mission scenarios with asset readiness compatibility | Member 3 (Missions Page) |
| `/api/bob/query` | POST | `{"query": string, "asset_id": optional string}` | Natural language decision copilot returning structured answer + evidence + tools used | Member 3 (Bob Chat UI) |

---

## 6. Shared Data Provenance & Safety Rules

1. **Synthetic Linkage Rule**:
   - Maintenance log records are public aviation logs linked to assets synthetically (`synthetic_asset_linkage: true`).
   - Never say: *"AC-104 historically had this repair."*
   - Always say: *"Relevant maintenance action from the maintenance knowledge base for this issue."*
2. **Mission Windows**:
   - `data_origin = 'synthetic'` — Always future-facing after 2026-09-13.
3. **No Fabricated Labels**:
   - Do NOT train a classifier on `failure_events.failure_label` (all 38 are 1).
   - Use `component_health.remaining_useful_life` (regression) and `failure_within_30_cycles` (per-cycle binary target).
4. **Safety Disclaimer**:
   - This is a software decision-support prototype. It does not control physical aircraft.
