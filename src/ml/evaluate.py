import pandas as pd
import numpy as np
import os
import json
import joblib
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
from src.ml.features import extract_features

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    data_dir = os.path.join(base_dir, 'data', 'processed')
    splits_dir = os.path.join(base_dir, 'data', 'splits')
    models_dir = os.path.join(base_dir, 'src', 'backend', 'models_artifacts')
    
    # Load Models
    rul_model = joblib.load(os.path.join(models_dir, "rul_model.joblib"))
    classifier_model = joblib.load(os.path.join(models_dir, "classifier_model.joblib"))
    feature_cols = joblib.load(os.path.join(models_dir, "feature_cols.joblib"))
    
    # Load test data
    sensor_df = pd.read_csv(os.path.join(data_dir, "sensor_readings.csv"))
    health_df = pd.read_csv(os.path.join(data_dir, "component_health.csv"))
    test_assets = pd.read_csv(os.path.join(splits_dir, "test_assets.csv"))['asset_id'].tolist()
    
    # Feature Extraction
    features_df = extract_features(sensor_df)
    
    # Merge and filter for test assets
    df = features_df.merge(health_df[['asset_id', 'cycle', 'remaining_useful_life', 'failure_within_30_cycles']], 
                           on=['asset_id', 'cycle'], how='inner')
    test_df = df[df['asset_id'].isin(test_assets)]
    
    X_test = test_df[feature_cols]
    y_test_rul = test_df['remaining_useful_life']
    y_test_class = test_df['failure_within_30_cycles']
    
    # Predictions
    y_pred_rul = rul_model.predict(X_test)
    y_pred_class = classifier_model.predict(X_test)
    y_prob_class = classifier_model.predict_proba(X_test)[:, 1]
    
    # Regression Metrics
    mae = float(mean_absolute_error(y_test_rul, y_pred_rul))
    rmse = float(np.sqrt(mean_squared_error(y_test_rul, y_pred_rul)))
    r2 = float(r2_score(y_test_rul, y_pred_rul))
    
    # Classification Metrics
    precision = float(precision_score(y_test_class, y_pred_class, zero_division=0))
    recall = float(recall_score(y_test_class, y_pred_class, zero_division=0))
    f1 = float(f1_score(y_test_class, y_pred_class, zero_division=0))
    roc_auc = float(roc_auc_score(y_test_class, y_prob_class))
    
    metrics = {
        "test_assets_count": len(test_assets),
        "rul_regression": {
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "r2": round(r2, 4)
        },
        "failure_within_30_classification": {
            "f1_score": round(f1, 4),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "roc_auc": round(roc_auc, 4)
        }
    }
    
    metrics_path = os.path.join(base_dir, 'src', 'ml', 'metrics.json')
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=2)
        
    print(f"Metrics saved to {metrics_path}")
    print(json.dumps(metrics, indent=2))

if __name__ == "__main__":
    main()
