import pandas as pd
import numpy as np
import os
import joblib

class MissionGuardPredictor:
    def __init__(self, model_dir: str = None):
        if model_dir is None:
            # Default to the expected models_artifacts directory
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
            self.model_dir = os.path.join(base_dir, 'src', 'backend', 'models_artifacts')
        else:
            self.model_dir = model_dir
            
        # Load the artifacts
        self.rul_model = joblib.load(os.path.join(self.model_dir, 'rul_model.joblib'))
        self.classifier_model = joblib.load(os.path.join(self.model_dir, 'classifier_model.joblib'))
        self.feature_cols = joblib.load(os.path.join(self.model_dir, 'feature_cols.joblib'))
        
    def predict_asset(self, sensor_history_df: pd.DataFrame) -> dict:
        """
        Takes the historical sensor telemetry DataFrame for a single asset up to the current cycle.
        """
        # Ensure we don't mutate the original DataFrame
        df = sensor_history_df.copy()
        
        # In a real environment, we would use the exact same feature extraction logic from src.ml.features
        # But we must ensure it's imported correctly.
        from src.ml.features import extract_features
        features_df = extract_features(df)
        
        # We only want to predict for the latest cycle
        latest_features = features_df.iloc[-1:]
        X = latest_features[self.feature_cols]
        
        # Predict RUL
        predicted_rul = float(self.rul_model.predict(X)[0])
        predicted_rul = max(0.0, predicted_rul) # Ensure non-negative
        predicted_rul_rounded = int(round(predicted_rul))
        
        # Predict Probability of Failure within 30 cycles
        failure_prob = float(self.classifier_model.predict_proba(X)[0][1])
        
        # Determine degradation stage
        if failure_prob > 0.8:
            degradation_stage = 'critical'
        elif failure_prob > 0.4:
            degradation_stage = 'degraded'
        else:
            degradation_stage = 'healthy'
            
        # Identify dominant sensor indicators
        # Here we just pick the ones with highest rolling deltas, 
        # normally you would use model feature importances (e.g., SHAP).
        delta_cols = [c for c in self.feature_cols if 'delta' in c]
        if delta_cols:
            latest_deltas = X[delta_cols].iloc[0].abs()
            top_deltas = latest_deltas.nlargest(3)
            dominant_sensors = [col.split('_')[0] for col in top_deltas.index]
        else:
            dominant_sensors = []
            
        return {
            "predicted_rul": round(predicted_rul, 2),
            "predicted_rul_rounded": predicted_rul_rounded,
            "failure_within_30_prob": round(failure_prob, 4),
            "degradation_stage": degradation_stage,
            "dominant_sensor_indicators": dominant_sensors
        }
