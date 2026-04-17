import { generateReroutingSuggestions } from './gemini.js';

/**
 * Checks all shipments and generates alerts for those that exceed risk thresholds.
 * 
 * @param {Array} shipments The array of all active shipments (already scored)
 * @param {Array} existingAlerts The current active alerts (to prevent duplicates)
 * @returns {Object} { newAlerts: Array, updatedAlertsList: Array }
 */
export const evaluateShipmentAlerts = async (shipments, existingAlerts) => {
  const newAlerts = [];
  const updatedAlertsList = [...existingAlerts];

  for (const shipment of shipments) {
    // Only care about shipments with dynamic risk events that push score > 40
    if (shipment.riskScore >= 40 && shipment.events && shipment.events.length > 0) {
      
      // Grab the most severe event affecting this shipment
      const primaryEvent = shipment.events.sort((a, b) => b.percent - a.percent)[0];
      
      // Prevent duplicate alerts for the exact same event + shipment combo
      const alertExists = updatedAlertsList.some(a => 
        a.shipmentId === shipment.id && a.eventId === primaryEvent.id && !a.resolved
      );

      if (!alertExists) {
        let alertMessage = `Score threshold exceeded (${shipment.riskScore}/100) due to ${primaryEvent.type}.`;
        
        // Critical Tier Alert (Score > 70) triggers AI Actionable Intelligence!
        if (shipment.riskScore >= 70) {
          console.log(`🚨 CRITICAL RISK on ${shipment.id}. Asking AI for rerouting...`);
          const aiAdvice = await generateReroutingSuggestions(shipment, primaryEvent);
          
          if (aiAdvice && aiAdvice.length > 0) {
            alertMessage += ` AI SUGGESTS: ${aiAdvice[0].route_name} (+${aiAdvice[0].estimated_delay_hours}h). Reasoning: ${aiAdvice[0].reasoning}`;
          }
        }

        const alert = {
          id: `A-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          shipmentId: shipment.id,
          eventId: primaryEvent.id,
          title: `Action Required: ${primaryEvent.title || 'Risk Detected'}`,
          score: shipment.riskScore,
          timestamp: 'Just now',
          resolved: false,
          message: alertMessage
        };

        newAlerts.push(alert);
        updatedAlertsList.unshift(alert); // Add to beginning of active list
        
        console.log(`⚠️ New Alert Generated for ${shipment.name}: ${shipment.riskScore >= 70 ? 'CRITICAL' : 'WARNING'}`);
      }
    }
  }

  return {
    newAlerts,
    updatedAlertsList
  };
};
