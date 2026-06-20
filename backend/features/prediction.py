import pandas as pd
import numpy as np
from datetime import timedelta
from sklearn.metrics import mean_squared_error, r2_score
from xgboost import XGBRegressor
from data_loader import DATASET_LAST_DATE, OVERLAPPING_STATIONS

def compute(violations_df, events_df):
    TODAY = DATASET_LAST_DATE
    TOMORROW = TODAY + timedelta(days=1)
    
    v_df = violations_df[violations_df['police_station'].isin(OVERLAPPING_STATIONS)]
    
    agg = v_df.groupby(['police_station', 'date', 'hour']).size().reset_index(name='count')
    agg['date'] = pd.to_datetime(agg['date'])
    
    station_map = {s: i for i, s in enumerate(OVERLAPPING_STATIONS)}
    
    agg['day_of_week'] = agg['date'].dt.dayofweek
    agg['month'] = agg['date'].dt.month
    agg['station_encoded'] = agg['police_station'].map(station_map)
    agg['is_weekend'] = agg['day_of_week'].isin([5, 6]).astype(int)
    
    split_date = pd.to_datetime(TODAY) - timedelta(days=13)
    train_df = agg[agg['date'] < split_date]
    test_df = agg[agg['date'] >= split_date]
    
    features = ['hour', 'day_of_week', 'month', 'station_encoded', 'is_weekend']
    target = 'count'
    
    X_train, y_train = train_df[features], train_df[target]
    X_test, y_test = test_df[features], test_df[target]
    
    model = XGBRegressor(n_estimators=200, max_depth=6, learning_rate=0.1, random_state=42)
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    rmse = float(np.sqrt(mean_squared_error(y_test, preds)))
    r2 = float(r2_score(y_test, preds))
    
    feat_imp = {f: float(imp) for f, imp in zip(features, model.feature_importances_)}
    
    pred_rows = []
    t_dow = TOMORROW.weekday()
    t_month = TOMORROW.month
    t_weekend = 1 if t_dow in [5, 6] else 0
    
    for s in OVERLAPPING_STATIONS:
        for h in range(24):
            pred_rows.append({
                'police_station': s,
                'hour': h,
                'day_of_week': t_dow,
                'month': t_month,
                'station_encoded': station_map[s],
                'is_weekend': t_weekend
            })
    
    pred_df = pd.DataFrame(pred_rows)
    pred_df['pred_count'] = np.maximum(0, model.predict(pred_df[features]))
    
    predictions = []
    for s in OVERLAPPING_STATIONS:
        s_preds = pred_df[pred_df['police_station'] == s]
        total = s_preds['pred_count'].sum()
        peak_hours = s_preds.nlargest(3, 'pred_count')['hour'].tolist()
        predictions.append({
            "station": s,
            "predicted_total": int(round(total)),
            "peak_hours": [int(h) for h in peak_hours]
        })
        
    predictions.sort(key=lambda x: x['predicted_total'], reverse=True)
    
    return {
        "forecast_date": TOMORROW.strftime("%Y-%m-%d"),
        "predictions": predictions[:5],
        "model_metrics": {
            "rmse": rmse,
            "r2": r2,
            "feature_importance": feat_imp
        }
    }
