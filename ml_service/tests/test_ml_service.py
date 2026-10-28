"""
Pytest unit and integration tests for the ML Service
"""

import pytest
import os
import sys

# Add ml_service to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app, map_urgency, explain_factors, DonorCandidate
from data.generate_dataset import generate_synthetic_donor_data

client = TestClient(app)

def test_dataset_generation():
    df = generate_synthetic_donor_data(n_samples=50)
    assert len(df) == 50
    assert 'distance_km' in df.columns
    assert 'suitability_score' in df.columns
    assert df['suitability_score'].min() >= 0.0
    assert df['suitability_score'].max() <= 100.0

def test_urgency_mapping():
    assert map_urgency("CRITICAL") == 3
    assert map_urgency("High") == 2
    assert map_urgency("NORMAL") == 1
    assert map_urgency("unknown") == 1

def test_explain_factors():
    candidate = DonorCandidate(
        donor_id="test_1",
        distance_km=3.2,
        days_since_last_donation=90,
        is_available=1,
        historical_response_rate=0.9,
        compatibility_level=1.0
    )
    factors = explain_factors(candidate, 85.0, "CRITICAL")
    assert any("proximity" in f.lower() for f in factors)
    assert any("optimal" in f.lower() or "recovery" in f.lower() for f in factors)
    assert any("critical" in f.lower() for f in factors)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert "metrics" in data

def test_rank_donors_endpoint():
    payload = {
        "request_urgency": "CRITICAL",
        "candidates": [
            {
                "donor_id": "donor_close",
                "distance_km": 2.5,
                "days_since_last_donation": 90,
                "is_available": 1,
                "historical_response_rate": 0.95,
                "compatibility_level": 1.0
            },
            {
                "donor_id": "donor_far",
                "distance_km": 60.0,
                "days_since_last_donation": 20,
                "is_available": 0,
                "historical_response_rate": 0.2,
                "compatibility_level": 0.85
            }
        ]
    }

    response = client.post("/rank-donors", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_evaluated"] == 2
    ranked = data["ranked_donors"]
    assert len(ranked) == 2
    # The close, recovered, available donor should rank first
    assert ranked[0]["donor_id"] == "donor_close"
    assert ranked[0]["suitability_score"] > ranked[1]["suitability_score"]
    assert ranked[0]["rank"] == 1
