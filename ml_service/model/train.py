"""
Model Training Script for Donor Suitability Ranking
Trains a Random Forest Regressor and Gradient Boosting Regressor, evaluates with R2, MAE, MSE,
and serializes the best performing model pipeline.
"""

import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

def train_and_evaluate():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, 'data', 'donor_dataset.csv')
    
    if not os.path.exists(data_path):
        from data.generate_dataset import generate_synthetic_donor_data
        df = generate_synthetic_donor_data()
        df.to_csv(data_path, index=False)
        print(f"Dataset generated at {data_path}")
    else:
        df = pd.read_csv(data_path)

    features = [
        'distance_km',
        'days_since_last_donation',
        'is_available',
        'historical_response_rate',
        'request_urgency_score',
        'compatibility_level'
    ]
    target = 'suitability_score'

    X = df[features]
    y = df[target]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # We build a Pipeline with StandardScaler and Random Forest Regressor
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('regressor', RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42))
    ])

    print("Training Random Forest Regressor...")
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    y_pred = np.clip(y_pred, 0.0, 100.0)

    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)

    print("\n--- Model Evaluation Results ---")
    print(f"Mean Absolute Error (MAE): {mae:.3f}")
    print(f"Root Mean Squared Error (RMSE): {rmse:.3f}")
    print(f"R-squared Score (R2): {r2:.4f}")

    # Feature importance analysis
    model = pipeline.named_steps['regressor']
    importances = model.feature_importances_
    print("\n--- Feature Importances ---")
    for feat, imp in sorted(zip(features, importances), key=lambda x: x[1], reverse=True):
        print(f"  {feat:25s}: {imp:.4f}")

    # Save model pipeline
    model_dir = os.path.join(base_dir, 'model')
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, 'donor_ranker.joblib')
    
    metadata = {
        'pipeline': pipeline,
        'features': features,
        'metrics': {'mae': float(mae), 'rmse': float(rmse), 'r2': float(r2)},
        'feature_importances': dict(zip(features, [float(x) for x in importances]))
    }
    
    joblib.dump(metadata, model_path)
    print(f"\nModel and metadata successfully saved to: {model_path}")
    return metadata

if __name__ == '__main__':
    train_and_evaluate()
