const axios = require('axios');
const config = require('../config');

/**
 * Deterministic fallback scoring heuristic when ML service is unavailable.
 */
function fallbackRank(requestUrgency, candidates) {
  const urgencyMap = { CRITICAL: 3, HIGH: 2, NORMAL: 1 };
  const u = urgencyMap[requestUrgency?.toUpperCase()] || 1;

  const scored = candidates.map(c => {
    // 1. Distance penalty
    const urgencyMultiplier = 1.0 + (u - 1) * 0.4;
    const distScore = Math.max(0, 100 - (c.distance_km * 1.5 * urgencyMultiplier));

    // 2. Recovery factor (>= 56 days)
    let eligibilityFactor = 1.0;
    if (c.days_since_last_donation < 56) {
      eligibilityFactor = (c.days_since_last_donation / 56.0) * 0.4;
    }

    // 3. Availability multiplier
    const availMult = c.is_available === 1 ? 1.0 : 0.2;

    // 4. Response rate
    const respScore = (c.historical_response_rate || 0.8) * 100;

    // 5. Compatibility
    const compatScore = (c.compatibility_level || 1.0) * 100;

    const rawScore = (
      distScore * 0.35 +
      (eligibilityFactor * 100) * 0.30 +
      respScore * 0.20 +
      compatScore * 0.15
    ) * availMult;

    const score = Math.round(Math.min(100, Math.max(0, rawScore)) * 100) / 100;

    let priorityTier = 'LOW PRIORITY';
    if (score >= 75) priorityTier = 'HIGH PRIORITY';
    else if (score >= 50) priorityTier = 'MEDIUM PRIORITY';

    const factors = [];
    if (c.distance_km <= 5) factors.push(`Very close proximity (${c.distance_km.toFixed(1)} km)`);
    else if (c.distance_km <= 15) factors.push(`Convenient distance (${c.distance_km.toFixed(1)} km)`);
    else factors.push(`Travel distance (${c.distance_km.toFixed(1)} km)`);

    if (c.days_since_last_donation < 56) {
      factors.push(`Recent donation (${c.days_since_last_donation} days; 56-day rest recommended)`);
    } else {
      factors.push(`Eligible donation interval (${c.days_since_last_donation} days)`);
    }

    if (c.is_available === 1) factors.push('Donor currently available');
    else factors.push('Donor marked unavailable');

    if (u === 3) factors.push('Evaluated for Critical urgency');

    return {
      donor_id: c.donor_id,
      suitability_score: score,
      priority_tier: priorityTier,
      contributing_factors: factors,
      is_fallback: true
    };
  });

  scored.sort((a, b) => b.suitability_score - a.suitability_score);
  return scored.map((item, idx) => ({ ...item, rank: idx + 1 }));
}

/**
 * Calls FastAPI ML service with automatic graceful fallback
 */
async function rankDonors(requestUrgency, candidates) {
  if (!candidates || candidates.length === 0) {
    return [];
  }

  try {
    const response = await axios.post(
      `${config.mlServiceUrl}/rank-donors`,
      {
        request_urgency: requestUrgency,
        candidates
      },
      { timeout: 4000 }
    );

    if (response.data && response.data.ranked_donors) {
      return response.data.ranked_donors.map(d => ({
        ...d,
        is_fallback: false
      }));
    }
  } catch (error) {
    console.warn(`[ML Service Warning] ML endpoint unreachable (${error.message}). Falling back to rule-based prioritization.`);
  }

  // Graceful rule-based ranking fallback
  return fallbackRank(requestUrgency, candidates);
}

module.exports = {
  rankDonors,
  fallbackRank
};
