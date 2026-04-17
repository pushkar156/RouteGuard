import { getShipmentImpact } from '../utils/geo.js';

// Base weights for different types of risk
const RISK_WEIGHTS = {
  piracy: 1.5,
  political: 1.4,
  weather: 1.0,
  cyclone: 1.2,
  port_strike: 1.2,
  congestion: 0.8,
  infrastructure: 0.9,
  engineering: 0.9,
  customs: 0.7,
  environmental: 1.0,
  unknown: 1.0
};

// Translates the qualitative string or 1-5 integer to a 0-20 base points scale
const getSeverityPoints = (severity) => {
  if (typeof severity === 'number') {
    return severity * 4; // 1-5 scale maps to 4-20
  }
  
  switch (String(severity).toLowerCase()) {
    case 'critical': return 20;
    case 'high': return 16;
    case 'medium': return 12;
    case 'low': return 8;
    case 'minor': return 4;
    default: return 10;
  }
};

/**
 * Recalculates the dynamic risk score for a single shipment based on all active events.
 *
 * Design: If events are affecting this shipment, the score is driven entirely by the
 * event math (0-100 scale). The baseRiskScore is only used as a floor when no
 * events are nearby, preventing silent no-event shipments from always showing 0.
 */
export const recalculateShipmentScore = (shipment, activeEvents) => {
  // ✅ Bug #2 Fixed: scoreAccumulator is normalised to 0-100 range
  // Each event contributes: severity (4-20) × weight (0.5-1.5) × proximity (0.1-1.0)
  // Max single event raw score: 20 * 1.5 * 1.0 = 30
  // We scale the total accumulator to 0-100 by multiplying by a normalisation factor
  const SCALE_FACTOR = 3.5; // Tuned so a max-severity close event hits ~100

  let scoreAccumulator = 0;
  let matchingEvents = [];

  for (const event of activeEvents) {
    const impact = getShipmentImpact(event, shipment, 300); // 300km critical radius

    if (impact.affected) {
      // 1. Base Severity Points (severity 1-5 → 4-20 points)
      const basePoints = getSeverityPoints(event.severity);

      // 2. Risk Type Multiplier
      const typeWeight = RISK_WEIGHTS[event.type?.toLowerCase()] || 1.0;

      // 3. Proximity Factor (1.0 at epicentre, 0.1 at edge of radius)
      const proximityFactor = Math.max(0.1, 1 - (impact.distance / 300));

      const eventScore = basePoints * typeWeight * proximityFactor;
      scoreAccumulator += eventScore;

      matchingEvents.push({
        ...event,
        percent: Math.min(100, Math.round(eventScore * SCALE_FACTOR))
      });
    }
  }

  // ✅ If events are affecting this ship, let the math drive the score
  //    If no events, fall back to the static baseRiskScore
  const finalDynamicScore = matchingEvents.length > 0
    ? Math.min(100, Math.round(scoreAccumulator * SCALE_FACTOR))
    : shipment.baseRiskScore;

  return {
    ...shipment,
    riskScore: finalDynamicScore,
    events: matchingEvents,
  };
};

/**
 * Updates all shipments iteratively against new/existing events.
 */
export const updateAllShipmentScores = (shipments, events) => {
  return shipments.map(shipment => recalculateShipmentScore(shipment, events));
};
