"""
FastAPI ML Inference Service for Smart Blood Donor System
Provides endpoints for health checks, model metadata, and donor ranking/prioritization.
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="Smart Blood Donor ML Prioritization Service",
    version="1.0.0",
    description="ML service providing donor suitability ranking and logistical prioritization."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model pipeline on startup
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, 'model', 'donor_ranker.joblib')

model_metadata = None

def get_model():
    global model_metadata
    if model_metadata is None:
        if not os.path.exists(MODEL_PATH):
            # Train on startup if missing
            from model.train import train_and_evaluate
            print(f"Model not found at {MODEL_PATH}. Initiating automatic training...")
            model_metadata = train_and_evaluate()
        else:
            model_metadata = joblib.load(MODEL_PATH)
    return model_metadata

# Pydantic Schemas
class DonorCandidate(BaseModel):
    donor_id: str
    distance_km: float = Field(..., ge=0.0, description="Distance from hospital in kilometers")
    days_since_last_donation: int = Field(..., ge=0, description="Days since last blood donation")
    is_available: int = Field(..., ge=0, le=1, description="1 if available, 0 if unavailable")
    historical_response_rate: float = Field(default=0.8, ge=0.0, le=1.0, description="Historical engagement rate")
    compatibility_level: float = Field(default=1.0, ge=0.0, le=1.0, description="1.0 for exact, 0.85 for compatible")

class RankRequest(BaseModel):
    request_urgency: str = Field(..., description="NORMAL, HIGH, or CRITICAL")
    candidates: List[DonorCandidate]

class RankedDonor(BaseModel):
    donor_id: str
    suitability_score: float
    priority_tier: str
    rank: int
    contributing_factors: List[str]

class RankResponse(BaseModel):
    request_urgency: str
    total_evaluated: int
    ranked_donors: List[RankedDonor]

@app.on_event("startup")
def startup_event():
    try:
        get_model()
        print("ML Model loaded successfully.")
    except Exception as e:
        print(f"Warning: Model could not be loaded at startup: {e}")

@app.get("/")
def root():
    return {
        "service": "Smart Blood Donor ML Prioritization API",
        "status": "operational",
        "docs": "/docs"
    }

@app.get("/health")
def health():
    try:
        meta = get_model()
        return {
            "status": "healthy",
            "model_loaded": True,
            "metrics": meta.get("metrics", {}),
            "feature_importances": meta.get("feature_importances", {})
        }
    except Exception as e:
        return {
            "status": "degraded",
            "model_loaded": False,
            "error": str(e)
        }

def map_urgency(urgency_str: str) -> int:
    u = urgency_str.strip().upper()
    if u == "CRITICAL":
        return 3
    elif u == "HIGH":
        return 2
    return 1 # NORMAL

def explain_factors(candidate: DonorCandidate, score: float, urgency_str: str) -> List[str]:
    factors = []
    
    # Distance explanation
    if candidate.distance_km <= 5.0:
        factors.append(f"Very close proximity ({candidate.distance_km:.1f} km)")
    elif candidate.distance_km <= 15.0:
        factors.append(f"Convenient distance ({candidate.distance_km:.1f} km)")
    elif candidate.distance_km <= 35.0:
        factors.append(f"Moderate transit distance ({candidate.distance_km:.1f} km)")
    else:
        factors.append(f"Extended travel distance ({candidate.distance_km:.1f} km)")

    # Donation interval
    if candidate.days_since_last_donation < 56:
        factors.append(f"Recent donation interval ({candidate.days_since_last_donation} days; 56-day rest advised)")
    elif candidate.days_since_last_donation <= 120:
        factors.append(f"Optimal recovery interval ({candidate.days_since_last_donation} days)")
    else:
        factors.append(f"Fully recovered ({candidate.days_since_last_donation} days since last donation)")

    # Availability
    if candidate.is_available == 1:
        factors.append("Active donor availability confirmed")
    else:
        factors.append("Donor marked unavailable / resting")

    # Reliability
    if candidate.historical_response_rate >= 0.8:
        factors.append(f"High historical responsiveness ({int(candidate.historical_response_rate * 100)}%)")

    # Urgency alignment
    if urgency_str.upper() == "CRITICAL":
        factors.append("Prioritized for Critical hospital request")

    return factors

@app.post("/rank-donors", response_model=RankResponse)
def rank_donors(payload: RankRequest):
    if not payload.candidates:
        return RankResponse(
            request_urgency=payload.request_urgency,
            total_evaluated=0,
            ranked_donors=[]
        )

    try:
        meta = get_model()
        pipeline = meta['pipeline']
        features = meta['features']
        
        urgency_score = map_urgency(payload.request_urgency)
        
        rows = []
        for c in payload.candidates:
            rows.append({
                'distance_km': c.distance_km,
                'days_since_last_donation': c.days_since_last_donation,
                'is_available': c.is_available,
                'historical_response_rate': c.historical_response_rate,
                'request_urgency_score': urgency_score,
                'compatibility_level': c.compatibility_level
            })
            
        df = pd.DataFrame(rows)[features]
        scores = pipeline.predict(df)
        scores = np.clip(scores, 0.0, 100.0)

        # Build results
        donor_results = []
        for i, c in enumerate(payload.candidates):
            score = round(float(scores[i]), 2)
            if score >= 75.0:
                tier = "HIGH PRIORITY"
            elif score >= 50.0:
                tier = "MEDIUM PRIORITY"
            else:
                tier = "LOW PRIORITY"

            factors = explain_factors(c, score, payload.request_urgency)
            donor_results.append({
                'donor_id': c.donor_id,
                'suitability_score': score,
                'priority_tier': tier,
                'factors': factors
            })

        # Sort descending by score
        donor_results.sort(key=lambda x: x['suitability_score'], reverse=True)

        ranked = []
        for idx, item in enumerate(donor_results):
            ranked.append(RankedDonor(
                donor_id=item['donor_id'],
                suitability_score=item['suitability_score'],
                priority_tier=item['priority_tier'],
                rank=idx + 1,
                contributing_factors=item['factors']
            ))

        return RankResponse(
            request_urgency=payload.request_urgency,
            total_evaluated=len(payload.candidates),
            ranked_donors=ranked
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")
