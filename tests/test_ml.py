import pytest
import pandas as pd
import os
import json
from src.ml.predict import MissionGuardPredictor

def test_ml_artifacts_and_inference():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    data_dir = os.path.join(base_dir, 'data', 'processed')
    models_dir = os.path.join(base_dir, 'src', 'backend', 'models_artifacts')
    
    assert os.path.exists(os.path.join(models_dir, "rul_model.joblib")), "RUL model artifact missing"
    assert os.path.exists(os.path.join(models_dir, "classifier_model.joblib")), "Classifier model artifact missing"
    
    predictor = MissionGuardPredictor(model_dir=models_dir)
    
    sensor_df = pd.read_csv(os.path.join(data_dir, "sensor_readings.csv"))
    asset_history = sensor_df[sensor_df['asset_id'] == 'AC-003']
    
    result = predictor.predict_asset(asset_history)
    
    assert 'predicted_rul' in result
    assert result['predicted_rul'] >= 0, "RUL cannot be negative"
    assert 'predicted_rul_rounded' in result
    assert 0 <= result['failure_within_30_prob'] <= 1, "Probability must be between 0 and 1"
    assert result['degradation_stage'] in ['healthy', 'degraded', 'critical']
    assert isinstance(result['dominant_sensor_indicators'], list)

def test_metrics_validity():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    metrics_path = os.path.join(base_dir, 'src', 'ml', 'metrics.json')
    
    assert os.path.exists(metrics_path), "Metrics file is missing"
    with open(metrics_path, 'r') as f:
        metrics = json.load(f)
        
    assert metrics['test_assets_count'] == 5
    assert metrics['rul_regression']['mae'] > 0
    assert metrics['failure_within_30_classification']['f1_score'] > 0
