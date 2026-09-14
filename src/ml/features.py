import pandas as pd
import numpy as np

def extract_features(df: pd.DataFrame) -> pd.DataFrame:
    """Accepts sensor readings sorted by asset_id and cycle. Returns feature matrix."""
    df = df.copy()
    df.sort_values(by=['asset_id', 'cycle'], inplace=True)
    
    # Sensors to use
    sensors = ['s2', 's3', 's4', 's7', 's8', 's9', 's11', 's12', 's14', 's15', 's17', 's20', 's21']
    settings = ['operational_setting_1', 'operational_setting_2']
    
    # Calculate rolling statistics
    windows = [5, 10, 20]
    
    for w in windows:
        for s in sensors:
            # Rolling Mean
            df[f'{s}_rolling_mean_{w}'] = df.groupby('asset_id')[s].transform(
                lambda x: x.rolling(window=w, min_periods=1).mean()
            )
            # Rolling Std
            df[f'{s}_rolling_std_{w}'] = df.groupby('asset_id')[s].transform(
                lambda x: x.rolling(window=w, min_periods=1).std().fillna(0)
            )
            # Sensor Delta (Rate of Change)
            df[f'{s}_delta_{w}'] = df[s] - df[f'{s}_rolling_mean_{w}']
            
    # The current operating cycle is inherently included if we keep the 'cycle' column.
    
    # Select only relevant columns
    cols_to_keep = ['asset_id', 'cycle'] + sensors + settings
    for w in windows:
        for s in sensors:
            cols_to_keep.append(f'{s}_rolling_mean_{w}')
            cols_to_keep.append(f'{s}_rolling_std_{w}')
            cols_to_keep.append(f'{s}_delta_{w}')
            
    return df[cols_to_keep]
