# Data Provenance & Safety Constraints: MissionGuard AI

**Team:** AeroX  
**Challenge:** D1 — Mission Readiness & Predictive Maintenance Copilot  

---

## 1. Provenance Inventory

MissionGuard is built with complete transparency regarding data origins and synthetic demo linkages:

| Dataset / Table | Primary Source | License / Origin | Type | Usage in MissionGuard |
|---|---|---|---|---|
| `sensor_readings.csv` | NASA C-MAPSS FD001 Turbofan Simulation | Public Domain (US Govt / NASA PCoE) | **SOURCE DATA** | 8,169 cycles of multi-channel sensor telemetry across 38 engines. |
| `failure_events.csv` | NASA C-MAPSS FD001 | Public Domain | **SOURCE DATA** | Records end-of-life cycle for each run-to-failure trajectory (HPC fault). |
| `component_health.remaining_useful_life` | Computed from C-MAPSS failure cycle | Source-Derived | **SOURCE-DERIVED** | Exact cycle count: $\text{failure\_cycle} - \text{current\_cycle}$. Ground truth for RUL regression. |
| `component_health.failure_within_30_cycles` | Computed from RUL | Source-Derived | **SOURCE-DERIVED** | Balanced binary label: $1$ if $\text{RUL} \le 30$, else $0$. |
| `maintenance_records.csv` | Annotated Maintenance Logbook (Zenodo 10.5281/zenodo.17903357) | CC BY 4.0 (Naghdipour, 2025) | **SOURCE DATA + SYNTHETIC LINKAGE** | Real aviation log problem/action texts. **Linkage to C-MAPSS engines is synthetic** (`synthetic_asset_linkage=True`). |
| `mission_windows.csv` | Synthetically Generated Scenarios | Synthetic Application Data | **SYNTHETIC** | Future-facing mission schedules after 2026-09-13 (`data_origin="synthetic"`). |
| `assets.csv` | Derived from C-MAPSS engine IDs | Synthetic Application Data | **SYNTHETIC / DERIVED** | Synthetic IDs (`AC-003` to `AC-100`), service age, and criticality metadata. `asset_status` is `pending_model`. |

---

## 2. Safety & Operational Disclaimer

- **Prototype Only**: MissionGuard AI is a software decision-support prototype. It is NOT a certified military system.
- **No Physical Control**: The system does NOT interact with physical aircraft controls, flight computers, weapons systems, or operational military communications.
- **No Real Military History**: The maintenance logbook and NASA engine telemetry originate from separate, independent open datasets. We make NO claim that any specific aircraft tail number historically experienced the listed maintenance event.
- **No Certification Claimed**: Readiness scores and risk levels are application decision metrics designed for demonstration, not official military airworthiness certifications.
