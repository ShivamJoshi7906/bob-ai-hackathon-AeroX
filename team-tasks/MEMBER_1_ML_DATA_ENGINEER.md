# Task Specification: Member 1 — ML & Data Pipeline Engineer

**Git Branch:** `feat/ml-pipeline`  
**Rubric Points Targeted:** Technical Implementation Quality (12/25 pts) + Innovation & Differentiation (10/25 pts)  
**Primary Peer Collaborator:** Member 2 (Backend Engineer who loads your model artifact and feature pipeline)

---

## 1. Role Overview & Objective

You are responsible for:
1. Ingesting and validating the finalized MissionGuard dataset (NASA C-MAPSS FD001 turbofan sensor telemetry, maintenance logs, failure events, mission windows, and component health).
2. Building a 100% data-leakage-free feature engineering pipeline.
3. Training a high-performing, explainable **Remaining Useful Life (RUL) regression model** and a secondary **failure-within-30-cycles classifier**.
4. Saving the trained model artifacts to `src/backend/models_artifacts/` for Member 2's backend to load on startup.
5. Computing and logging **real, un-faked evaluation metrics** (MAE, RMSE, $R^2$, F1, Precision, Recall) to `src/ml/metrics.json`.
6. Writing automated tests for dataset schema integrity and model inference.

---

## 2. Directory & File Ownership

You own and edit **ONLY** these files:
```
data/
├── raw/                              # Source data files from missionguard-data-extracted
├── processed/                        # 6 verified CSV files
│   ├── assets.csv
│   ├── sensor_readings.csv
│   ├── maintenance_records.csv
│   ├── failure_events.csv
│   ├── mission_windows.csv
│   └── component_health.csv
├── splits/                           # train_assets.csv, validation_assets.csv, test_assets.csv
└── load_data.py                      # Data validation and database seeding script

src/ml/
├── __init__.py
├── features.py                       # Leakage-proof feature extraction (rolling backward stats)
├── train.py                          # Model training script
├── evaluate.py                       # Evaluation on unseen test split (calculates real metrics)
├── predict.py                        # Model inference wrapper for backend
└── metrics.json                      # Real test set metrics

src/backend/models_artifacts/          # Output model artifacts for Member 2
├── rul_model.joblib                  # Trained RUL Regressor
└── classifier_model.joblib           # Trained 30-cycle early-warning classifier

tests/
├── test_data.py                      # Data schema, nulls, split separation tests
└── test_ml.py                        # Training, inference shapes, and metric validity tests

docs/
├── ml-methodology.md                 # Detailed ML methodology doc
└── data-provenance.md                # Data provenance and honesty doc
```

---

## 3. Dataset Constraints & Provenance Rules (MANDATORY)

- **Do NOT invent or fake data**: All source data is already prepared in `missionguard-data-extracted/missionguard-data/`. Copy these into `data/`.
- **Dataset Specs**:
  - `assets.csv`: 38 assets (`AC-003` to `AC-100`). `asset_status` is `pending_model`.
  - `sensor_readings.csv`: 8,169 rows, 13 degradation sensors (`s2, s3, s4, s7, s8, s9, s11, s12, s14, s15, s17, s20, s21`) + 3 operational settings.
  - `failure_events.csv`: 38 rows. **CRITICAL:** `failure_label` is 1 for all rows (run-to-failure). **DO NOT** train a binary classifier on `failure_label`.
  - `component_health.csv`: Exact source-derived `remaining_useful_life` (`total_operating_hours - cycle`) and balanced `failure_within_30_cycles` (14.4% positive / 85.6% negative).
  - `maintenance_records.csv`: 74 records with `synthetic_asset_linkage=True`.
  - `mission_windows.csv`: 38 future-facing windows (`data_origin="synthetic"`).
- **Split Separation**:
  - Train: 27 assets (`splits/train_assets.csv`)
  - Validation: 6 assets (`splits/validation_assets.csv`)
  - Test: 5 assets (`splits/test_assets.csv`)
  - **Zero asset overlap**: Ensure no asset from train appears in validation or test!

---

## 4. Feature Engineering Specs (`src/ml/features.py`)

Feature extraction must be strictly **backward-looking** (temporal causality):
1. **Raw Sensors**: `s2, s3, s4, s7, s8, s9, s11, s12, s14, s15, s17, s20, s21` and `operational_setting_1, operational_setting_2`.
2. **Rolling Backward Statistics**:
   - Rolling Mean over windows `W = [5, 10, 20]` cycles.
   - Rolling Std over windows `W = [5, 10, 20]` cycles.
   - Sensor Delta / Rate of Change: `sensor_t - rolling_mean_W`.
3. **Cycle Indicator**: Current operating cycle.
4. **Handling Initial Cycles**: Use `min_periods=1` for early cycles so no NaNs are produced.
5. Export a reusable function:
   ```python
   def extract_features(df: pd.DataFrame) -> pd.DataFrame:
       """Accepts sensor readings sorted by asset_id and cycle. Returns feature matrix."""
   ```

---

## 5. Model Training & Evaluation Specs (`src/ml/train.py` & `evaluate.py`)

1. **Primary Model**: RUL Regressor
   - Recommended algorithm: `HistGradientBoostingRegressor` or `RandomForestRegressor(n_estimators=100, random_state=42)`.
   - Target: `component_health.remaining_useful_life`.
2. **Secondary Model**: Early-Warning Classifier
   - Algorithm: `HistGradientBoostingClassifier` or `RandomForestClassifier(class_weight='balanced', random_state=42)`.
   - Target: `component_health.failure_within_30_cycles`.
3. **Save Artifacts**:
   ```python
   import joblib
   joblib.dump(rul_pipeline, "src/backend/models_artifacts/rul_model.joblib")
   joblib.dump(classifier_pipeline, "src/backend/models_artifacts/classifier_model.joblib")
   ```
4. **Evaluation on 5 Test Assets** (calculate real metrics, NEVER hardcode):
   - Regression: Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), $R^2$ score.
   - Classification: Precision, Recall, F1 Score, ROC-AUC.
   - Save directly to `src/ml/metrics.json`:
     ```json
     {
       "test_assets_count": 5,
       "rul_regression": {
         "mae": 14.2,
         "rmse": 18.7,
         "r2": 0.86
       },
       "failure_within_30_classification": {
         "f1_score": 0.89,
         "precision": 0.87,
         "recall": 0.91,
         "roc_auc": 0.95
       }
     }
     ```

---

## 6. Inference Contract for Member 2 (`src/ml/predict.py`)

Member 2's backend services will call your prediction helper directly. You must provide:
```python
class MissionGuardPredictor:
    def __init__(self, model_dir: str = "src/backend/models_artifacts"):
        ...
        
    def predict_asset(self, sensor_history_df: pd.DataFrame) -> dict:
        """
        Takes the historical sensor telemetry DataFrame for a single asset up to the current cycle.
        Returns:
        {
            "predicted_rul": float,         # e.g. 42.5
            "predicted_rul_rounded": int,   # e.g. 43
            "failure_within_30_prob": float,# e.g. 0.18
            "degradation_stage": str,       # 'healthy' | 'degraded' | 'critical'
            "dominant_sensor_indicators": list[str] # Top 3 degrading sensor channels, e.g. ['s2', 's11', 's4']
        }
        """
```

---

## 7. Automated Tests (`tests/test_data.py` & `tests/test_ml.py`)

1. `tests/test_data.py`:
   - Assert all 38 assets are loaded.
   - Assert 8,169 sensor readings exist with zero missing values.
   - Assert train/val/test splits have 0 asset overlap.
   - Assert RUL decrements monotonically by 1 per cycle and ends at 0.
2. `tests/test_ml.py`:
   - Assert `rul_model.joblib` exists and loads without error.
   - Assert `predict_asset` returns valid non-negative RUL and probability in `[0, 1]`.
   - Assert metrics in `src/ml/metrics.json` are positive and realistic.

---

## 8. Step-by-Step Git Commands

```bash
# 1. Checkout your branch
git checkout -b feat/ml-pipeline

# 2. Develop and run your scripts
python data/load_data.py
python src/ml/train.py
python src/ml/evaluate.py
pytest tests/test_data.py tests/test_ml.py

# 3. Commit and push
git add data/ src/ml/ src/backend/models_artifacts/ tests/test_data.py tests/test_ml.py docs/ml-methodology.md docs/data-provenance.md
git commit -m "feat(ml): complete feature engineering, RUL model training, evaluation, and inference wrapper"
git push -u origin feat/ml-pipeline
```
Notify **Member 4** once pushed so they can initiate the merge!
