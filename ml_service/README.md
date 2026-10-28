# Smart Blood Donor System - Machine Learning Service

This service provides intelligent donor suitability ranking and logistical prioritization for incoming hospital blood requests.

## Architecture

- **Framework**: FastAPI (asynchronous REST API)
- **Model Engine**: Scikit-Learn Random Forest Regressor within a StandardScaler Pipeline
- **Dataset**: Documented synthetic dataset (`data/donor_dataset.csv`) generated with clinical eligibility parameters (56-day whole blood recovery minimum, distance sensitivity scaled with urgency, availability status, historical responsiveness, and blood group compatibility level).
- **Serialization**: Joblib pipeline (`model/donor_ranker.joblib`)

## Evaluation Metrics

- **R² Score**: ~0.986
- **Mean Absolute Error (MAE)**: ~2.33
- **Root Mean Squared Error (RMSE)**: ~2.96

## Key Feature Importances

1. `is_available` (78.8%): Paramount operational availability filter.
2. `distance_km` (10.4%): Proximity in kilometers, heavily amplified during CRITICAL requests.
3. `days_since_last_donation` (8.3%): Recovery interval (medical guidance recommends >= 56 days for whole blood).
4. `historical_response_rate` (1.7%): Reliability and engagement track record.
5. `request_urgency_score` (0.7%): Urgency level weighting (Normal=1, High=2, Critical=3).
6. `compatibility_level` (0.1%): Prioritizes exact matches while supporting compatible alternates.

## API Endpoints

- `GET /health`: Health check and model performance metrics.
- `POST /rank-donors`: Accepts request urgency and list of eligible donor candidate metrics; returns sorted candidates with suitability score (0-100), priority tier (HIGH/MEDIUM/LOW), and clinical/logistical contributing factor explanations.

## Setup & Running

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Train model
python model/train.py

# 3. Start service
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
