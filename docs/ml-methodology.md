# ML Methodology

## Feature Engineering
To prevent data leakage, our feature engineering pipeline strictly relies on backward-looking statistics.
We extract the following features for each of the 13 chosen sensor channels (`s2`, `s3`, `s4`, etc.) and operational settings:
- **Rolling Mean**: over windows of 5, 10, and 20 cycles.
- **Rolling Standard Deviation**: over windows of 5, 10, and 20 cycles.
- **Sensor Delta**: the difference between the current sensor reading and its rolling mean, capturing the immediate rate of change.

The `min_periods=1` parameter ensures we don't introduce `NaN` values during the initial cycles of an asset's life.

## Models
1. **RUL Regressor**: We use a `HistGradientBoostingRegressor` to predict the Remaining Useful Life (RUL). This model natively handles unscaled data and is robust to non-linear degradation curves.
2. **Failure Classifier**: We use a `HistGradientBoostingClassifier` to predict the probability of failure within the next 30 cycles. We address class imbalance by computing balanced sample weights.

## Inference
The `MissionGuardPredictor` provides a unified interface for the backend, outputting predicted RUL, failure probabilities, and deriving a categorical `degradation_stage` (`healthy`, `degraded`, `critical`). It also isolates the top 3 dominant sensor indicators based on the most significant current deltas.
