# Data Provenance & Safety Constraints: MissionGuard AI

**Team:** AeroX  
**Challenge:** D1 — Mission Readiness & Predictive Maintenance Copilot  

---

## 1. Dataset Source & Provenance Inventory

The core telemetry dataset is derived from the NASA C-MAPSS FD001 turbofan engine degradation simulation dataset (public domain, US Government work). It contains multivariate sensor telemetry simulating run-to-failure trajectories for aircraft engines under sea-level operating conditions.

MissionGuard is built with complete transparency regarding data origins and synthetic demo linkages:

| Dataset / Table | Primary Source | License / Origin | Type | Usage in MissionGuard |
|---|---|---|---|---|
| `sensor_readings.csv` | NASA C-MAPSS FD001 Turbofan Simulation | Public Domain (US Govt / NASA PCoE) | **SOURCE DATA** | 8,169 cycles of multi-channel sensor telemetry across 38 engines. |
| `failure_events.csv` | NASA C-MAPSS FD001 | Public Domain | **SOURCE DATA** | Records end-of-life cycle for each run-to-failure trajectory (HPC fault). |
| `component_health.remaining_useful_life` | Computed from C-MAPSS failure cycle | Source-Derived | **SOURCE-DERIVED** | Exact cycle count: $\text{failure\_cycle} - \text{current\_cycle}$. Ground truth for RUL regression. |
| `component_health.failure_within_30_cycles` | Computed from RUL | Source-Derived | **SOURCE-DERIVED** | Balanced binary label: $1$ if $\text{RUL} \le 30$, else $0$ (~14.4% positive / 85.6% negative). |
| `maintenance_records.csv` | Annotated Maintenance Logbook (Zenodo 10.5281/zenodo.17903357) | CC BY 4.0 (Naghdipour, 2025) | **SOURCE DATA + SYNTHETIC LINKAGE** | Real aviation log problem/action texts. **Linkage to C-MAPSS engines is synthetic** (`synthetic_asset_linkage=True`). |
| `mission_windows.csv` | Synthetically Generated Scenarios | Synthetic Application Data | **SYNTHETIC** | Future-facing mission schedules after 2026-09-13 (`data_origin="synthetic"`). |
| `assets.csv` | Derived from C-MAPSS engine IDs | Synthetic Application Data | **SYNTHETIC / DERIVED** | Synthetic IDs (`AC-003` to `AC-100`), service age, and criticality metadata. `asset_status` is `pending_model`. |

---

## 2. Asset and Split Separation (Zero Data Leakage)

We process 38 total engines split into mutually exclusive sets:
- **Train**: 27 assets (71%)
- **Validation**: 6 assets (16%)
- **Test**: 5 assets (13%)

This separation strictly ensures zero data leakage, as no asset from the training set appears in the validation or test sets.

---

## 3. Target Variables & Data Honesty

- `remaining_useful_life`: Calculated exactly as `total_operating_hours - cycle`.
- `failure_within_30_cycles`: A derived per-cycle binary label that is `1` if `remaining_useful_life <= 30` and `0` otherwise.
- **Important**: We strictly avoid training any binary classification models on `failure_events.csv`, as it only contains run-to-failure endpoints (all labels are 1).

---

## 4. Safety & Operational Disclaimer

- **Prototype Only**: MissionGuard AI is a software decision-support prototype. It is NOT a certified military system.
- **No Physical Control**: The system does NOT interact with physical aircraft controls, flight computers, weapons systems, or operational military communications.
- **No Real Military History**: The maintenance logbook and NASA engine telemetry originate from separate, independent open datasets. We make NO claim that any specific aircraft tail number historically experienced the listed maintenance event.
- **No Certification Claimed**: Readiness scores and risk levels are application decision metrics designed for demonstration, not official military airworthiness certifications.
