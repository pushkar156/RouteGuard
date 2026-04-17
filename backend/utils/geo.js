/**
 * Calculates the great-circle distance between two points on the Earth's surface.
 * 
 * @param {number} lat1 Latitude of first point
 * @param {number} lng1 Longitude of first point
 * @param {number} lat2 Latitude of second point
 * @param {number} lng2 Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const haversine = (lat1, lng1, lat2, lng2) => {
  const toRad = x => (x * Math.PI) / 180;
  const R = 6371; // Earth's radius in km

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
};

/**
 * Checks if a risk event intersects with any part of a shipment's route.
 * 
 * @param {Object} event The risk event containing lat/lng
 * @param {Object} shipment The shipment containing an array of coords
 * @param {number} radiusKm The critical radius for impact (default 200km)
 * @returns {Object} { affected: boolean, distance: number, waypoint: Array }
 */
export const getShipmentImpact = (event, shipment, radiusKm = 200) => {
  if (!event.lat || !event.lng || !shipment.coords) {
    return { affected: false, distance: null, waypoint: null };
  }

  let closestDistance = Infinity;
  let closestWaypoint = null;

  for (const waypoint of shipment.coords) {
    const dist = haversine(event.lat, event.lng, waypoint[0], waypoint[1]);
    if (dist < closestDistance) {
      closestDistance = dist;
      closestWaypoint = waypoint;
    }
  }

  return {
    affected: closestDistance <= radiusKm,
    distance: closestDistance,
    waypoint: closestWaypoint
  };
};
