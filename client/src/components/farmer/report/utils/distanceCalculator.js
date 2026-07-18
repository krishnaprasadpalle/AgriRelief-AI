/**
 * distanceCalculator.js
 * Calculates the Haversine distance between two GPS coordinates.
 * Used to detect if the farmer has moved >50m and trigger re-verification.
 */

const EARTH_RADIUS_METERS = 6371000;

/**
 * Calculate distance between two GPS points in meters.
 * Uses the Haversine formula.
 *
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} Distance in meters
 */
export const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
};

/**
 * Returns true if farmer has moved more than the given threshold (default: 50m).
 *
 * @param {{ latitude: number, longitude: number }} prev
 * @param {{ latitude: number, longitude: number }} next
 * @param {number} thresholdMeters
 * @returns {boolean}
 */
export const hasMovedSignificantly = (prev, next, thresholdMeters = 50) => {
  if (!prev || !next) return false;
  const distance = getDistanceInMeters(
    prev.latitude,
    prev.longitude,
    next.latitude,
    next.longitude
  );
  return distance > thresholdMeters;
};
