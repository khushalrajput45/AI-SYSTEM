import { CampusZone } from '../models/CampusZone.js';

/**
 * Checks if a point (lat, lng) is inside a polygon using the Ray-Casting algorithm
 * @param {number} latitude 
 * @param {number} longitude 
 * @param {Array<{latitude: number, longitude: number}>} polygon 
 * @returns {boolean}
 */
export function isPointInPolygon(latitude, longitude, polygon) {
  if (!polygon || polygon.length < 3) return false;

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].longitude;
    const yi = polygon[i].latitude;
    const xj = polygon[j].longitude;
    const yj = polygon[j].latitude;

    const intersect =
      yi > latitude !== yj > latitude &&
      longitude < ((xj - xi) * (latitude - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Calculates Haversine distance in meters between two lat/lng points
 */
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Resolves which Campus Zone a GPS coordinate belongs to
 */
export async function resolveCampusZone(latitude, longitude) {
  const zones = await CampusZone.find({});
  if (!zones || zones.length === 0) {
    return {
      isInsideCampus: true,
      zone: null,
      zoneName: 'Main Campus',
      distanceToCenter: 0,
    };
  }

  // 1. First check polygon containment
  for (const zone of zones) {
    if (zone.polygon && zone.polygon.length >= 3) {
      if (isPointInPolygon(latitude, longitude, zone.polygon)) {
        return {
          isInsideCampus: true,
          zone,
          zoneName: zone.name,
          distanceToCenter: calculateDistanceMeters(
            latitude,
            longitude,
            zone.center.latitude,
            zone.center.longitude
          ),
        };
      }
    }
  }

  // 2. Second check radius from center
  let closestZone = null;
  let minDistance = Infinity;

  for (const zone of zones) {
    const dist = calculateDistanceMeters(
      latitude,
      longitude,
      zone.center.latitude,
      zone.center.longitude
    );

    if (dist <= zone.radiusMeters) {
      return {
        isInsideCampus: true,
        zone,
        zoneName: zone.name,
        distanceToCenter: dist,
      };
    }

    if (dist < minDistance) {
      minDistance = dist;
      closestZone = zone;
    }
  }

  // If within 1500 meters of closest zone center, consider inside campus bounds
  const isInside = minDistance < 1500;

  return {
    isInsideCampus: isInside,
    zone: closestZone,
    zoneName: closestZone ? closestZone.name : 'Unknown Campus Area',
    distanceToCenter: minDistance,
  };
}
