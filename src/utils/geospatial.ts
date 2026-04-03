// ============================================
// AeroRoute — Geospatial Engineering Engine
// ============================================

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Waypoint extends Coordinates {
  id: string;
  distanceFromOriginKm: number;
  estimatedTimeOfArrivalUnix: number; // Predicted time aircraft reaches here
}

/**
 * Converts degrees to radians.
 */
export const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Converts radians to degrees.
 */
export const toDegrees = (radians: number): number => {
  return radians * (180 / Math.PI);
};

/**
 * Calculates the Great Circle distance between two points on the Earth's surface
 * using the Haversine formula. Returns distance in kilometers.
 */
export const calculateHaversineDistance = (p1: Coordinates, p2: Coordinates): number => {
  const R = 6371; // Earth's mean radius in km
  const dLat = toRadians(p2.lat - p1.lat);
  const dLon = toRadians(p2.lon - p1.lon);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(p1.lat)) * Math.cos(toRadians(p2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Calculates the initial bearing (forward azimuth) from point 1 to point 2.
 * Returns bearing in degrees (0-360).
 */
export const calculateBearing = (p1: Coordinates, p2: Coordinates): number => {
  const lat1 = toRadians(p1.lat);
  const lat2 = toRadians(p2.lat);
  const dLon = toRadians(p2.lon - p1.lon);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  let bearing = toDegrees(Math.atan2(y, x));
  return (bearing + 360) % 360;
};

/**
 * Finds a point halfway (or at a specific fraction) along the Great Circle path.
 * Used for waypoint interpolation.
 */
export const interpolateGreatCircle = (p1: Coordinates, p2: Coordinates, fraction: number): Coordinates => {
  const lat1 = toRadians(p1.lat);
  const lon1 = toRadians(p1.lon);
  const lat2 = toRadians(p2.lat);
  const lon2 = toRadians(p2.lon);

  const d = calculateHaversineDistance(p1, p2) / 6371; // Angular distance

  const a = Math.sin((1 - fraction) * d) / Math.sin(d);
  const b = Math.sin(fraction * d) / Math.sin(d);

  const x = a * Math.cos(lat1) * Math.cos(lon1) + b * Math.cos(lat2) * Math.cos(lon2);
  const y = a * Math.cos(lat1) * Math.sin(lon1) + b * Math.cos(lat2) * Math.sin(lon2);
  const z = a * Math.sin(lat1) + b * Math.sin(lat2);

  const lat3 = Math.atan2(z, Math.sqrt(x * x + y * y));
  const lon3 = Math.atan2(y, x);

  return {
    lat: toDegrees(lat3),
    lon: toDegrees(lon3),
  };
};

/**
 * Generates an array of waypoints along a flight path.
 * Determines where the aircraft will be and at exactly what time.
 */
export const generateFlightPlan = (
  origin: Coordinates,
  destination: Coordinates,
  groundSpeedKnots: number,
  departureTimeUnix: number = Math.floor(Date.now() / 1000),
  numberOfWaypoints: number = 5
): Waypoint[] => {
  const totalDistanceKm = calculateHaversineDistance(origin, destination);
  const speedKmPerSec = (groundSpeedKnots * 1.852) / 3600; // Convert knots to km/s
  const totalFlightTimeSeconds = totalDistanceKm / speedKmPerSec;

  const waypoints: Waypoint[] = [];

  for (let i = 0; i <= numberOfWaypoints; i++) {
    const fraction = i / numberOfWaypoints;
    const interpolatedPoint = interpolateGreatCircle(origin, destination, fraction);
    const distanceFromOriginKm = totalDistanceKm * fraction;
    
    // Crucial mapping: We map the position to the predicted future time
    const timeOffsetSeconds = totalFlightTimeSeconds * fraction;
    const estimatedTimeOfArrivalUnix = Math.floor(departureTimeUnix + timeOffsetSeconds);

    waypoints.push({
      ...interpolatedPoint,
      id: `WP-${i}`,
      distanceFromOriginKm,
      estimatedTimeOfArrivalUnix,
    });
  }

  return waypoints;
};

/**
 * Calculates aviation wind components (headwind and crosswind)
 * relative to a runway heading or flight path bearing.
 */
export const calculateWindComponents = (
  windSpeed: number, 
  windDirectionDegrees: number, 
  bearingDegrees: number
): { headwind: number, crosswind: number } => {
  // Angle difference between wind coming FROM and aircraft going TO
  // e.g. aircraft going 090 (East), wind from 090 (East) = 0 deg diff (pure headwind)
  let angleDiff = windDirectionDegrees - bearingDegrees;
  
  // Normalize to -180 to +180
  angleDiff = (angleDiff + 540) % 360 - 180;
  const angleRad = toRadians(angleDiff);

  // Cos for headwind component, Sin for crosswind component
  const headwind = windSpeed * Math.cos(angleRad);
  const crosswind = Math.abs(windSpeed * Math.sin(angleRad)); // Magnitude of crosswind

  return {
    headwind: Math.round(headwind * 10) / 10,
    crosswind: Math.round(crosswind * 10) / 10
  };
};
