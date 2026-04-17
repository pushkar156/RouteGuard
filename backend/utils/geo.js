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
 * Generates intermediate points between two coordinates for fine-grained path checking.
 * @param {Array} start [lat, lng]
 * @param {Array} end [lat, lng]
 * @param {number} intervalKm Number of km between points
 */
export const interpolatePath = (start, end, intervalKm = 100) => {
    const totalDist = haversine(start[0], start[1], end[0], end[1]);
    const steps = Math.max(1, Math.floor(totalDist / intervalKm));
    const points = [start];

    for (let i = 1; i <= steps; i++) {
        const ratio = i / steps;
        const lat = start[0] + (end[0] - start[0]) * ratio;
        const lng = start[1] + (end[1] - start[1]) * ratio;
        points.push([lat, lng]);
    }
    
    points.push(end);
    return points;
};

/**
 * Checks if a risk event intersects with any part of a shipment's route.
 * 
 * @param {Object} event The risk event containing lat/lng
 * @param {Object} shipment The shipment containing an array of coords
 * @param {number} radiusKm The critical radius for impact (default 500km)
 * @returns {Object} { affected: boolean, distance: number, waypoint: Array }
 */
export const getShipmentImpact = (event, shipment, radiusKm = 500) => {
  if (!event.lat || !event.lng || !shipment.coords) {
    return { affected: false, distance: null, waypoint: null };
  }

  let closestDistance = Infinity;
  let closestWaypoint = null;

  // For every segment of the route, interpolate points for deep scanning
  for (let i = 0; i < shipment.coords.length - 1; i++) {
    const start = shipment.coords[i];
    const end = shipment.coords[i + 1];
    
    // Scan the path breadcrumbs
    const pathPoints = interpolatePath(start, end, 100); 
    
    for (const point of pathPoints) {
        const dist = haversine(event.lat, event.lng, point[0], point[1]);
        if (dist < closestDistance) {
            closestDistance = dist;
            closestWaypoint = point;
        }
    }
  }

  return {
    affected: closestDistance <= radiusKm,
    distance: closestDistance,
    waypoint: closestWaypoint
  };
};
