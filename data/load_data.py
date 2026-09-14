import pandas as pd
import os
import sys

def load_and_validate():
    data_dir = os.path.dirname(os.path.abspath(__file__))
    processed_dir = os.path.join(data_dir, "processed")
    splits_dir = os.path.join(data_dir, "splits")

    # Load assets
    assets = pd.read_csv(os.path.join(processed_dir, "assets.csv"))
    assert len(assets) == 38, f"Expected 38 assets, found {len(assets)}"
    print("[OK] Successfully loaded 38 assets.")

    # Load sensor readings
    sensors = pd.read_csv(os.path.join(processed_dir, "sensor_readings.csv"))
    assert len(sensors) == 8169, f"Expected 8169 sensor readings, found {len(sensors)}"
    assert sensors.isnull().sum().sum() == 0, "Expected 0 missing values in sensor readings"
    print("[OK] Successfully loaded 8,169 sensor readings with 0 missing values.")

    # Load splits
    train_assets = pd.read_csv(os.path.join(splits_dir, "train_assets.csv"))['asset_id'].tolist()
    val_assets = pd.read_csv(os.path.join(splits_dir, "validation_assets.csv"))['asset_id'].tolist()
    test_assets = pd.read_csv(os.path.join(splits_dir, "test_assets.csv"))['asset_id'].tolist()

    # Validate split separation
    assert len(set(train_assets).intersection(set(val_assets))) == 0, "Overlap found between train and validation assets"
    assert len(set(train_assets).intersection(set(test_assets))) == 0, "Overlap found between train and test assets"
    assert len(set(val_assets).intersection(set(test_assets))) == 0, "Overlap found between validation and test assets"
    print("[OK] Successfully verified 0 asset overlap between train, val, and test splits.")

    print("Data validation completed successfully.")

if __name__ == "__main__":
    load_and_validate()
