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
 */
export const recalculateShipmentScore = (shipment, activeEvents) => {
  let scoreAccumulator = 0;
  let matchingEvents = [];

  for (const event of activeEvents) {
    const impact = getShipmentImpact(event, shipment, 300); // 300km critical radius
    
    if (impact.affected) {
      // 1. Base Severity Points
      const basePoints = getSeverityPoints(event.severity);
      
      // 2. Risk Type Multiplier
      const typeWeight = RISK_WEIGHTS[event.type?.toLowerCase()] || 1.0;
      
      // 3. Proximity Factor (closer = higher multiplier, from 1.0 down to 0.1)
      const proximityFactor = Math.max(0.1, 1 - (impact.distance / 300));
      
      // Optional: 4. Freshness Factor (temporal decay) could go here if events had timestamps

      const eventScore = basePoints * typeWeight * proximityFactor;
      scoreAccumulator += eventScore;

      matchingEvents.push({
        ...event,
        percent: Math.min(100, Math.round(eventScore * 5)) // Rough scaling for UI mapping
      });
    }
  }

  // Cap the dynamic added score at 100, add to base score, then cap total at 100
  const finalDynamicScore = Math.min(100, shipment.baseRiskScore + scoreAccumulator);

  return {
    ...shipment,
    riskScore: Math.round(finalDynamicScore),
    events: matchingEvents // Update the shipment's active events
  };
};

/**
 * Updates all shipments iteratively against new/existing events.
 */
export const updateAllShipmentScores = (shipments, events) => {
  return shipments.map(shipment => recalculateShipmentScore(shipment, events));
};
