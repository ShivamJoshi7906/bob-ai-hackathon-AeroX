# Task Specification: Member 4 — IBM Bob Copilot, DevOps & Submission Lead

**Git Branch:** `feat/bob-devops-lead`  
**Rubric Points Targeted:** IBM Bob Integration (10/10 pts) + Documentation & Reproducibility (10/10 pts) + Problem Depth & Vision (5/15 pts)  
**Primary Responsibilities:** IBM Bob integration, documentation suite, slide deck, repository validation, and orchestrating branch merges.

---

## 1. Role Overview & Objective

You are the team lead, copilot architect, and technical writer. You are responsible for:
1. Implementing **IBM Bob Copilot reasoning engine** and the **9 decision-support tools** connecting Bob directly to Member 2's backend services and Member 1's ML predictions.
2. Answering the **3 mandatory hackathon questions** with live evidence, clear structure, and zero hallucinations:
   - *"Which assets are not ready?"*
   - *"Why is AC-003 not ready?"* (or any specified asset)
   - *"What should maintenance do first?"*
3. Authoring the complete official documentation suite in `docs/`.
4. Generating `presentation/slides.pdf` and setting up the `demo/` folder.
5. Populating `submission.yaml` with 100% complete data (no bracketed placeholders).
6. Leading the sequential git merge of all 4 branches into `main` and verifying the GitHub Actions `validate.yml` workflow passes GREEN.

---

## 2. Directory & File Ownership

You own and edit **ONLY** these files:
```
submission.yaml                         # Structured metadata - READ BY EVALUATORS FIRST
README.md                               # Project front-page (zero placeholders!)
CONTRIBUTING.md                         # Required submission instructions
.gitignore                              # Excludes .env, node_modules, build artifacts
.github/workflows/validate.yml          # Automated submission validator

src/
├── .env.example                        # Template for environment variables
├── README.md                           # Overview of src/ layout
└── backend/app/
    ├── services/bob_service.py         # IBM Bob Copilot reasoning and intent engine
    ├── routes/bob.py                   # POST /api/bob/query endpoint
    └── bob_tools/                      # 9 tool declarations matching MCP standard
        ├── __init__.py
        ├── fleet_tools.py
        ├── asset_tools.py
        └── maintenance_tools.py

docs/
├── problem-statement.md                # Target users, pain points, calendar vs predictive
├── solution-overview.md                # Core mechanism, differentiation, workflow
├── architecture.md                     # Mermaid diagram, component table, security
├── setup-guide.md                      # Prerequisites, install, run, troubleshooting table
├── bob-integration.md                  # Bob architecture, MCP tools, sample queries
└── hackathon-score-audit.md            # Realistic self-audit targeting 85+ score

demo/
├── demo-video-link.txt                 # Working Loom/YouTube link
├── live-demo-url.txt                   # Deployed URL or "NOT DEPLOYED"
├── README.md                           # Guide to screenshots and video walkthrough
└── screenshots/                        # At least 3 real app screenshots
    ├── 01-fleet-dashboard.png
    ├── 02-asset-details-readiness.png
    └── 03-bob-copilot-reasoning.png

presentation/
└── slides.pdf                          # Professional presentation deck

tests/
└── test_bob.py                         # Pytest suite for Bob tools and response queries
```

---

## 3. IBM Bob Copilot Architecture & 9 Tools

Bob is a **load-bearing decision-support assistant**. Bob does not merely chat; Bob invokes structured tools:

### Tool Definitions (`src/backend/app/bob_tools/`)
1. `get_fleet_summary()`: Returns total asset counts, readiness distribution, critical risk assets.
2. `get_not_ready_assets()`: Returns all assets currently classified as `NOT READY` or `NEEDS INSPECTION`.
3. `get_asset_status(asset_id: str)`: Returns current cycle, criticality, readiness score, and risk.
4. `get_asset_prediction(asset_id: str)`: Returns predicted RUL, degradation stage, dominant sensors.
5. `get_asset_risk(asset_id: str)`: Returns risk category, failure-within-30-cycle probability.
6. `get_asset_sensor_trends(asset_id: str)`: Returns recent trends for temperature and vibration channels.
7. `get_upcoming_mission(asset_id: str)`: Returns next mission window, cycles required, buffer margin.
8. `get_maintenance_recommendations()`: Returns ranked P1-P3 maintenance queue.
9. `search_maintenance_knowledge(query: str)`: Searches public maintenance logbook for proven actions.

### 3 Mandatory Hackathon Questions Handled by Bob (`POST /api/bob/query`)

#### Question 1: *"Which assets are not ready?"*
- **Invokes**: `get_not_ready_assets()`
- **Response Format**:
  ```text
  Currently, 5 assets in the fleet are classified as NOT READY:
  • AC-003: Predicted RUL is 18 cycles (buffer: -12 cycles vs mission MSN-0001). Risk: CRITICAL.
  • AC-013: Predicted RUL is 22 cycles (buffer: -8 cycles vs mission MSN-0006). Risk: CRITICAL.
  • AC-027: Predicted RUL is 24 cycles (buffer: -6 cycles vs mission MSN-0011). Risk: HIGH.
  • AC-029: Predicted RUL is 19 cycles (buffer: -11 cycles vs mission MSN-0012). Risk: CRITICAL.
  • AC-042: Predicted RUL is 26 cycles (buffer: -4 cycles vs mission MSN-0018). Risk: HIGH.

  Immediate Recommendation: Hold these 5 assets from mission assignment and trigger P1 maintenance work orders.
  ```

#### Question 2: *"Why is AC-003 not ready?"*
- **Invokes**: `get_asset_status("AC-003")`, `get_asset_prediction("AC-003")`, `get_upcoming_mission("AC-003")`
- **Response Format**:
  ```text
  Asset AC-003 is currently classified as NOT READY (Readiness Score: 42/100).

  Main Reasons:
  1. Insufficient Mission Buffer: Predicted RUL is 18.4 cycles, which is 11.6 cycles below upcoming mission requirement (30 cycles for MSN-0001 starting 2026-10-31).
  2. Imminent Failure Risk: 30-cycle failure probability is 88.0% (Risk: CRITICAL).
  3. Sensor Degradation Evidence: HPC outlet temperature (s2) and core speed (s9) exhibit persistent thermal and friction degradation over the last 20 operating cycles.

  Recommended Maintenance Action:
  Ground asset; perform immediate teardown and replacement of HPC rotor assembly before any mission deployment.
  (Guidance derived from public aviation maintenance knowledge base).
  ```

#### Question 3: *"What should maintenance do first?"*
- **Invokes**: `get_maintenance_recommendations()`
- **Response Format**:
  ```text
  Maintenance Priority Ranking (Immediate Actions):

  [P1 - CRITICAL] Asset AC-003
  • Issue: Severe HPC degradation with mission shortfall (buffer: -11.6 cycles).
  • Recommended Action: Immediate teardown and replacement of HPC rotor assembly.
  • Knowledge Base Reference: Routine gasket/compressor overhaul procedure (Logbook MX-0006).

  [P1 - CRITICAL] Asset AC-029
  • Issue: Imminent turbine blade wear before mission MSN-0012.
  • Recommended Action: Borescope inspection and high-pressure stage clearance check.

  [P2 - URGENT] Asset AC-013
  • Issue: Rapid degradation acceleration over recent 15 cycles.
  • Recommended Action: Fuel nozzle stand-off clamp inspection.
  ```

---

## 4. Submission & Documentation Deliverables

1. **`submission.yaml`**: Ensure all `# REQUIRED` fields are populated without any leftover brackets or dummy placeholders.
2. **`README.md`**: Complete, compelling front-page covering problem, solution, architecture, ML results, Bob integration, and quickstart commands.
3. **`docs/` Suite**:
   - `problem-statement.md`: Defense & Aerospace Challenge D1 context.
   - `solution-overview.md`: Condition-based readiness workflow.
   - `architecture.md`: Clean Mermaid diagram and component inventory.
   - `setup-guide.md`: Foolproof installation and local run instructions.
   - `bob-integration.md`: Bob reasoning architecture and tool API specs.
   - `hackathon-score-audit.md`: Explicit 85+ score evidence ledger.
4. **`presentation/slides.pdf`**: Generate an 8-slide presentation PDF using Python's `reportlab` covering Problem, Solution, System Architecture, ML Methodology, IBM Bob Integration, Demo Story, and Impact.

---

## 5. Master Merge Lead & Protocol

When Members 1, 2, and 3 push their branches, you execute the sequential merge:

```bash
# 1. Fetch all branches
git fetch origin

# 2. Merge Member 1 (ML Pipeline)
git checkout main
git merge origin/feat/ml-pipeline --no-ff -m "merge: feat/ml-pipeline (ML pipeline and trained models)"

# 3. Merge Member 2 (Backend & Decision Engine)
git merge origin/feat/backend-api --no-ff -m "merge: feat/backend-api (FastAPI backend and decision engines)"

# 4. Merge Member 3 (Frontend Operations Dashboard)
git merge origin/feat/frontend-dashboard --no-ff -m "merge: feat/frontend-dashboard (React operations dashboard)"

# 5. Merge your own branch (feat/bob-devops-lead)
git merge feat/bob-devops-lead --no-ff -m "merge: feat/bob-devops-lead (IBM Bob copilot, docs, and submission artifacts)"

# 6. Run full verification suite
pytest tests/
python -m unittest discover tests/
npm --prefix src/frontend run build

# 7. Push main and verify GitHub Actions
git push origin main
```
Confirm the GitHub Actions **Validate Submission** workflow turns **GREEN**!
