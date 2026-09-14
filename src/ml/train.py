import pandas as pd
import numpy as np
import os
import joblib
from sklearn.ensemble import HistGradientBoostingRegressor, HistGradientBoostingClassifier
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
from src.ml.features import extract_features

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    data_dir = os.path.join(base_dir, 'data', 'processed')
    splits_dir = os.path.join(base_dir, 'data', 'splits')
    models_dir = os.path.join(base_dir, 'src', 'backend', 'models_artifacts')
    os.makedirs(models_dir, exist_ok=True)
    
    print("Loading data...")
    sensor_df = pd.read_csv(os.path.join(data_dir, "sensor_readings.csv"))
    health_df = pd.read_csv(os.path.join(data_dir, "component_health.csv"))
    train_assets = pd.read_csv(os.path.join(splits_dir, "train_assets.csv"))['asset_id'].tolist()
    
    # Feature extraction
    print("Extracting features...")
    features_df = extract_features(sensor_df)
    
    # Merge with target labels
    df = features_df.merge(health_df[['asset_id', 'cycle', 'remaining_useful_life', 'failure_within_30_cycles']], 
                           on=['asset_id', 'cycle'], how='inner')
    
    # Filter for training set
    train_df = df[df['asset_id'].isin(train_assets)]
    
    # Prepare X and Y
    feature_cols = [c for c in train_df.columns if c not in ['asset_id', 'cycle', 'remaining_useful_life', 'failure_within_30_cycles']]
    X_train = train_df[feature_cols]
    y_train_rul = train_df['remaining_useful_life']
    y_train_class = train_df['failure_within_30_cycles']
    
    # Train RUL Regressor
    print("Training RUL Regressor...")
    rul_model = HistGradientBoostingRegressor(random_state=42)
    rul_model.fit(X_train, y_train_rul)
    
    # Train Classifier
    print("Training 30-cycle Classifier...")
    # class_weight='balanced' is not directly supported in HistGradientBoostingClassifier without sample_weights,
    # so we'll compute sample weights
    from sklearn.utils.class_weight import compute_sample_weight
    sample_weight = compute_sample_weight(class_weight='balanced', y=y_train_class)
    classifier_model = HistGradientBoostingClassifier(random_state=42)
    classifier_model.fit(X_train, y_train_class, sample_weight=sample_weight)
    
    # Save artifacts
    print("Saving models...")
    # In a real scenario, we might save a Pipeline including the feature extractor.
    # Here we just save the estimator and expect predict.py to call extract_features.
    joblib.dump(rul_model, os.path.join(models_dir, "rul_model.joblib"))
    joblib.dump(classifier_model, os.path.join(models_dir, "classifier_model.joblib"))
    
    # We also need to save feature_cols to ensure consistent ordering during inference
    joblib.dump(feature_cols, os.path.join(models_dir, "feature_cols.joblib"))
    print("Training completed successfully.")

if __name__ == "__main__":
    main()
