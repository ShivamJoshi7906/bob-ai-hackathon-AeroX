import pytest
import pandas as pd
import os

def test_data_integrity():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    data_dir = os.path.join(base_dir, 'data', 'processed')
    splits_dir = os.path.join(base_dir, 'data', 'splits')

    assets_df = pd.read_csv(os.path.join(data_dir, "assets.csv"))
    assert len(assets_df) == 38, "Expected 38 assets"

    sensor_df = pd.read_csv(os.path.join(data_dir, "sensor_readings.csv"))
    assert len(sensor_df) == 8169, "Expected 8169 sensor readings"
    assert sensor_df.isnull().sum().sum() == 0, "No missing values allowed in sensor data"

    train_assets = set(pd.read_csv(os.path.join(splits_dir, "train_assets.csv"))['asset_id'])
    val_assets = set(pd.read_csv(os.path.join(splits_dir, "validation_assets.csv"))['asset_id'])
    test_assets = set(pd.read_csv(os.path.join(splits_dir, "test_assets.csv"))['asset_id'])

    assert len(train_assets.intersection(val_assets)) == 0, "Overlap found between train/val"
    assert len(train_assets.intersection(test_assets)) == 0, "Overlap found between train/test"
    assert len(val_assets.intersection(test_assets)) == 0, "Overlap found between val/test"

    health_df = pd.read_csv(os.path.join(data_dir, "component_health.csv"))
    for asset, group in health_df.groupby('asset_id'):
        rul_vals = group['remaining_useful_life'].tolist()
        for i in range(1, len(rul_vals)):
            assert rul_vals[i] < rul_vals[i-1], f"RUL must be monotonic decreasing. Failed on {asset}"
        assert rul_vals[-1] == 0, f"RUL must end at 0. Failed on {asset}"
