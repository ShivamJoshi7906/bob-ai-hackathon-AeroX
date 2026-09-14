# Data Provenance

## Dataset Source
The core dataset is derived from the NASA C-MAPSS FD001 turbofan degradation dataset. It contains multi-variate sensor telemetry simulating run-to-failure trajectories for various aircraft engines (assets).

## Asset and Split Separation
We process 38 total assets split into mutually exclusive sets:
- **Train**: 27 assets
- **Validation**: 6 assets
- **Test**: 5 assets
This separation strictly ensures zero data leakage, as no asset from the training set appears in the validation or test sets.

## Target Variables
- `remaining_useful_life`: Calculated exactly as `total_operating_hours - cycle`.
- `failure_within_30_cycles`: A derived binary label that is `1` if `remaining_useful_life <= 30` and `0` otherwise. Note: We strictly avoid training any classification models on `failure_events.csv`, as it only contains run-to-failure endpoints (all labels are 1).

## Synthetic Linkages
Maintenance logs and mission windows represent synthetic, plausible future scenarios designed for the MissionGuard prototype.
