# Machine Learning Methodology: MissionGuard AI

**Team:** AeroX  
**Challenge:** D1 — Mission Readiness & Predictive Maintenance Copilot  

---

## 1. Problem Formulation: RUL Regression as the Primary Task

A foundational principle of MissionGuard is **Data Honesty**:
- In the NASA C-MAPSS FD001 dataset, all 38 assets in the training set are run-to-failure by construction. Therefore, every single asset trajectory ends in a failure event (`failure_events.failure_label = 1`).
- **Why binary classification on `failure_label` is invalid**: With 100% positive failure labels at the asset level, there are zero legitimate negative instances. A binary classifier trained on `failure_label` would be learning trivial or invalid correlations.
- **The Correct Formulation**: 
  1. **Primary Task: Remaining Useful Life (RUL) Regression**. We predict the exact number of operating cycles remaining until failure from historical sensor readings and rolling trends:
     $$\text{RUL} = \text{Total Operating Hours for Asset} - \text{Current Operating Cycle}$$
  2. **Secondary Task: 30-Cycle Early Warning Classification**. We predict whether $\text{RUL} \le 30$ operating cycles (`failure_within_30_cycles`), providing a realistic, balanced per-cycle warning label (~14.4% positive / 85.6% negative).

---

## 2. Leakage Prevention Protocol

Data leakage is the most prevalent flaw in predictive maintenance benchmarks. MissionGuard implements three strict anti-leakage safeguards:
1. **Asset-Level Partitioning**: Assets are split at the engine entity level, never by random row sampling:
   - **Train**: 27 assets (71%)
   - **Validation**: 6 assets (16%)
   - **Test**: 5 assets (13%)
   - *Zero asset overlap*: No asset in the test set has ever been seen in training or validation.
2. **Causal Backward-Looking Features**: Feature extraction uses only backward-looking rolling statistics. At cycle $t$, statistics are calculated over $[t-W+1, t]$. No future cycles ($t+1, t+2, \dots$) are ever observed.
3. **Reproducible Preprocessing**: Imputation and feature scalers are fitted strictly on the training split and applied to validation/test.

---

## 3. Feature Engineering Pipeline

From the 21 C-MAPSS sensors, 13 non-constant, degradation-informative channels are selected:
- **Temperatures**: $s_2$ (HPC Outlet Temp), $s_3$ (Combustor Outlet Temp), $s_4$ (LPT Outlet Temp)
- **Pressures & Speeds**: $s_7$ (HPC Pressure), $s_8$ (Fan Speed), $s_9$ (Core Speed), $s_{11}$ (Static Pressure)
- **Ratios & Enthalpy**: $s_{12}$ (Fuel Ratio), $s_{14}$ (Bypass Ratio), $s_{15}$ (Bleed Enthalpy), $s_{17}$ (HPT Speed)
- **Coolant Flows**: $s_{20}$ (HPT Coolant Bleed), $s_{21}$ (LPT Coolant Bleed)
- **Operational Settings**: `operational_setting_1`, `operational_setting_2`

### Engineered Feature Transformations
For each sensor channel $s_i$:
- **Rolling Mean**: $\mu_{W}(s_i)$ for windows $W \in \{5, 10, 20\}$ cycles.
- **Rolling Standard Deviation**: $\sigma_{W}(s_i)$ for windows $W \in \{5, 10, 20\}$ cycles.
- **Rate-of-Change / Delta**: $\Delta_W(s_i) = s_i(t) - \mu_W(s_i)$.
- **Cumulative Cycle Count**: Represents mechanical duty duration.

---

## 4. Models & Algorithms

We benchmarked two robust gradient ensemble algorithms:
1. **HistGradientBoostingRegressor / Classifier**: Highly efficient histogram-based gradient boosting capable of capturing non-linear wear curves.
2. **RandomForestRegressor / Classifier**: 100 decision trees with bootstrap aggregation providing explainable feature importances and low variance.

The model is trained, serialized with `joblib`, and stored in `src/backend/models_artifacts/rul_model.joblib`.

---

## 5. Evaluation & Verification

Metrics are evaluated **strictly on the 5 held-out test assets** and saved directly to `src/ml/metrics.json`:
- **RUL Regression**: Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), and Coefficient of Determination ($R^2$).
- **Early Warning Classification**: Precision, Recall, F1-Score, and ROC-AUC.
- Metrics are calculated automatically during pipeline runs and never hardcoded.
