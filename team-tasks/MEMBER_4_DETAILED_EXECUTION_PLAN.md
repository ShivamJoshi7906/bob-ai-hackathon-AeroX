# Member 4 (IBM Bob Copilot, DevOps & Lead) — Detailed Work Plan

**Role:** IBM Bob Copilot Architect, DevOps & Submission Lead  
**Git Branch:** `feat/bob-devops-lead`  
**Target Points:** IBM Bob Integration (10/10) + Documentation & Reproducibility (10/10) + Problem Depth (5/15) = **25 Rubric Points**  
**Guiding Principle:** Build the load-bearing Bob decision copilot independently using locked API contracts, ensure complete submission compliance, and lead the final merge to achieve a green GitHub Actions check.

---

## Phase Overview

```
PHASE 1: Branch Setup & Environment
    ↓
PHASE 2: 9 IBM Bob Decision Tools (MCP Standard)
    ↓
PHASE 3: Bob Reasoning & Intent Engine (3 Mandatory Queries)
    ↓
PHASE 4: FastAPI Bob Router (POST /api/bob/query)
    ↓
PHASE 5: Automated Pytest Suite (tests/test_bob.py)
    ↓
PHASE 6: Documentation & Submission Compliance Verification
    ↓
PHASE 7: Final Sequential Merge & GitHub Actions Green Light
```

---

## Phase 1: Git Branch Setup & Isolation

1. Check out your dedicated branch:
   ```bash
   git checkout -b feat/bob-devops-lead
   ```
2. Verify you are writing only to your designated files:
   - `src/backend/app/bob_tools/`
   - `src/backend/app/services/bob_service.py`
   - `src/backend/app/routes/bob.py`
   - `tests/test_bob.py`
   - `submission.yaml`, `docs/`, `demo/`, `presentation/`

---

## Phase 2: Implement the 9 IBM Bob Decision Tools

**Target Directory:** `src/backend/app/bob_tools/`

Bob is evaluated on being **load-bearing**, meaning Bob reasons by calling tools that query real telemetry and decision logic. Implement these 9 tools:

1. **`get_fleet_summary()`**:
   - Returns: Total assets (38), breakdown by readiness (`READY`, `MONITORING`, `INSPECTION`, `NOT READY`), critical risk count, upcoming missions.
2. **`get_not_ready_assets()`**:
   - Returns: All assets currently non-ready (`NOT READY` or `NEEDS INSPECTION`), their predicted RUL, and negative buffer against their upcoming mission.
3. **`get_asset_status(asset_id: str)`**:
   - Returns: Asset type, current cycle, mission criticality, operating hours, last maintenance cycle.
4. **`get_asset_prediction(asset_id: str)`**:
   - Returns: Predicted RUL (cycles), degradation stage (`healthy`/`degraded`/`severe`), 30-cycle early-warning failure probability.
5. **`get_asset_risk(asset_id: str)`**:
   - Returns: Risk level (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), failure probability, dominant degrading sensors.
6. **`get_asset_sensor_trends(asset_id: str)`**:
   - Returns: Recent telemetry trends for HPC outlet temp ($s_2$), combustor temp ($s_3$), core speed ($s_9$), and static pressure ($s_{11}$).
7. **`get_upcoming_mission(asset_id: str)`**:
   - Returns: Next mission window dates, required cycles, calculated buffer margin ($\pm$ cycles).
8. **`get_maintenance_recommendations()`**:
   - Returns: Prioritized queue (P1 Critical, P2 Urgent, P3 Scheduled) with issue descriptions and mission impacts.
9. **`search_maintenance_knowledge(query: str)`**:
   - Returns: Relevant repair procedures from the 74 maintenance records matching problem/component keywords.

*Adapter Design*: Build these tools to query the database or fallback gracefully to the verified dataset if Member 2 is still working, allowing you to test immediately without waiting!

---

## Phase 3: Bob Reasoning & Intent Engine

**Target File:** `src/backend/app/services/bob_service.py`

Implement the conversational intelligence that handles user queries, invokes tools, and structures evidence. Specifically, guarantee perfect responses for the **3 Mandatory Hackathon Questions**:

### 1. "Which assets are not ready?"
- **Action**: Call `get_not_ready_assets()`.
- **Response Structure**:
  - Direct answer: State the total count of non-ready assets.
  - Asset breakdown: For each non-ready engine, show:
    - Asset ID (e.g. `AC-003`)
    - Predicted RUL vs Mission Requirement (e.g. `18 cycles vs 30 required`)
    - Buffer shortfall (e.g. `-12 cycle deficit`)
    - Risk category (`CRITICAL`)
  - Commander action: Immediate recommendation to withhold from flight roster and schedule P1 inspection.

### 2. "Why is AC-003 not ready?" (or any specified asset)
- **Action**: Call `get_asset_status`, `get_asset_prediction`, `get_upcoming_mission`, and `get_asset_sensor_trends`.
- **Response Structure**:
  - Readiness category and score (`NOT READY`, Score: 42/100).
  - **Evidence 1 (Mission Gap)**: Predicted RUL (18.4 cycles) provides insufficient margin for Mission MSN-0001 (requires 30 cycles).
  - **Evidence 2 (Failure Risk)**: 30-cycle early-warning failure probability is 88.0% (Risk: CRITICAL).
  - **Evidence 3 (Physical Telemetry Drift)**: HPC outlet temperature ($s_2$) and core speed ($s_9$) show sustained thermal and friction degradation over the recent 20 cycles.
  - **Recommended Maintenance Action**: Ground asset; perform immediate teardown/overhaul of HPC module.

### 3. "What should maintenance do first?"
- **Action**: Call `get_maintenance_recommendations()`.
- **Response Structure**:
  - **P1 — CRITICAL**: Top asset requiring immediate intervention, explaining the mission failure risk and citing proven logbook repair procedures.
  - **P2 — URGENT**: Next assets requiring targeted inspection before upcoming mission windows.
  - **P3 — SCHEDULED**: Monitoring tasks for assets with sufficient buffer.

---

## Phase 4: FastAPI Bob Router

**Target File:** `src/backend/app/routes/bob.py`

Expose the locked endpoint for Member 3's frontend:
- **Endpoint**: `POST /api/bob/query`
- **Request Body**:
  ```json
  {
    "query": "Why is AC-003 not ready?",
    "asset_id": "AC-003"
  }
  ```
- **Response Body**:
  ```json
  {
    "query": "Why is AC-003 not ready?",
    "answer": "Asset AC-003 is currently classified as NOT READY...",
    "evidence": {
      "asset_id": "AC-003",
      "predicted_rul": 18.4,
      "mission_cycles_required": 30,
      "buffer_cycles": -11.6,
      "risk_level": "CRITICAL",
      "readiness_category": "NOT READY",
      "recommended_action": "Ground asset and overhaul HPC rotor assembly."
    },
    "tools_called": ["get_asset_status", "get_asset_prediction", "get_upcoming_mission", "get_asset_sensor_trends"],
    "timestamp": "2026-09-13T16:15:00Z"
  }
  ```

---

## Phase 5: Automated Testing

**Target File:** `tests/test_bob.py`

Write Pytest unit tests to verify your implementation:
1. `test_bob_tools_exist_and_return_data()`: Asserts that each of the 9 tools executes and returns valid types.
2. `test_bob_query_not_ready_assets()`: Tests Question 1 and verifies non-ready assets are returned with negative buffers.
3. `test_bob_query_why_asset_not_ready()`: Tests Question 2 and verifies RUL, mission gap, and sensor evidence are present.
4. `test_bob_query_maintenance_priorities()`: Tests Question 3 and verifies P1/P2/P3 rankings exist.
5. Run tests:
   ```bash
   pytest tests/test_bob.py -v
   ```

---

## Phase 6: Submission & Documentation Verification

1. Verify `submission.yaml`: Ensure team name is `AeroX`, lead is `Shivam Joshi`, track is `AI`, and all required fields are populated without brackets.
2. Verify `docs/`: All 8 documentation files are in place.
3. Verify `demo/`: `demo-video-link.txt` is updated.
4. Verify GitHub Actions locally: Check that all checks in `.github/workflows/validate.yml` pass.

---

## Phase 7: Final Sequential Merge Protocol

Once Members 1, 2, and 3 push their branches, you as Lead execute the clean merges into `main`:

```bash
# 1. Fetch updates
git fetch origin

# 2. Merge Member 1 (ML Pipeline)
git checkout main
git merge origin/feat/ml-pipeline --no-ff -m "merge: feat/ml-pipeline"

# 3. Merge Member 2 (Backend & Decision Engines)
git merge origin/feat/backend-api --no-ff -m "merge: feat/backend-api"

# 4. Merge Member 3 (Frontend Operations Dashboard)
git merge origin/feat/frontend-dashboard --no-ff -m "merge: feat/frontend-dashboard"

# 5. Merge Member 4 (IBM Bob & Submission)
git merge feat/bob-devops-lead --no-ff -m "merge: feat/bob-devops-lead"

# 6. Run full verification and push
pytest tests/
git push origin main
```
Confirm the GitHub Actions **Validate Submission** workflow turns **GREEN** on GitHub!
