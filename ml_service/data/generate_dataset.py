"""
Synthetic Dataset Generator for Smart Blood Donor System
Generates labeled donor match scenarios with clinical and logistical features.
"""

import numpy as np
import pandas as pd
import os

def generate_synthetic_donor_data(n_samples=2500, random_seed=42):
    np.random.seed(random_seed)
    
    # 1. Distance in kilometers (majority between 1 and 40 km, some further)
    distance_km = np.random.exponential(scale=15.0, size=n_samples)
    distance_km = np.clip(distance_km, 0.5, 75.0)
    
    # 2. Days since last donation (0 to 365 days)
    # Whole blood minimum donation interval is generally 56 days
    days_since_donation = np.random.randint(0, 365, size=n_samples)
    
    # 3. Donor availability toggle (1 = available, 0 = temporarily unavailable)
    # ~85% available
    is_available = np.random.choice([1, 0], size=n_samples, p=[0.85, 0.15])
    
    # 4. Historical response rate (percentage of requests the donor responded to)
    historical_response_rate = np.random.beta(a=5, b=2, size=n_samples) # Skewed towards higher engagement
    
    # 5. Request urgency level (1 = Normal, 2 = High, 3 = Critical)
    request_urgency = np.random.choice([1, 2, 3], size=n_samples, p=[0.4, 0.35, 0.25])
    
    # 6. Compatibility level (1.0 = exact type match, 0.85 = compatible alternative)
    compatibility_level = np.random.choice([1.0, 0.85], size=n_samples, p=[0.7, 0.3])

    # Compute realistic suitability score (0 - 100)
    suitability_scores = []
    for i in range(n_samples):
        dist = distance_km[i]
        days = days_since_donation[i]
        avail = is_available[i]
        resp_rate = historical_response_rate[i]
        urgency = request_urgency[i]
        compat = compatibility_level[i]
        
        # Medical eligibility factor (>= 56 days required for full points)
        if days < 56:
            eligibility_factor = (days / 56.0) * 0.4 # Significant penalty if too recent
        elif days <= 120:
            eligibility_factor = 1.0 # Optimal recovery window
        else:
            eligibility_factor = 0.95 # Fully eligible, slight decay if long inactive
            
        # Distance score (inverse distance, weighted by urgency)
        # In critical situations, distance matters much more
        urgency_multiplier = 1.0 + (urgency - 1) * 0.4
        dist_score = max(0.0, 100.0 - (dist * 1.5 * urgency_multiplier))
        
        # Response reliability
        reliability_score = resp_rate * 100.0
        
        # Availability multiplier
        avail_mult = 1.0 if avail == 1 else 0.2
        
        # Weighted aggregate base score
        raw_score = (
            dist_score * 0.35 +
            (eligibility_factor * 100.0) * 0.30 +
            reliability_score * 0.20 +
            (compat * 100.0) * 0.15
        ) * avail_mult
        
        # Add realistic noise
        noise = np.random.normal(0, 2.5)
        final_score = np.clip(raw_score + noise, 0.0, 100.0)
        suitability_scores.append(round(final_score, 2))
        
    df = pd.DataFrame({
        'distance_km': np.round(distance_km, 2),
        'days_since_last_donation': days_since_donation,
        'is_available': is_available,
        'historical_response_rate': np.round(historical_response_rate, 4),
        'request_urgency_score': request_urgency,
        'compatibility_level': compatibility_level,
        'suitability_score': suitability_scores
    })
    
    return df

if __name__ == '__main__':
    data_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(data_dir, 'donor_dataset.csv')
    df = generate_synthetic_donor_data()
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} synthetic records saved to {output_path}")
    print(df.head())
