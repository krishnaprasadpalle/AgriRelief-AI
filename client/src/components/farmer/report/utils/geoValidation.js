/**
 * geoValidation.js
 * Compares the farmer's registered district/village with the
 * GPS-derived address and returns a verification status.
 */

/**
 * Normalize strings for comparison:
 * lowercase, trim, remove extra spaces.
 */
const normalize = (str) =>
  (str || "").toLowerCase().trim().replace(/\s+/g, " ");

/**
 * Fuzzy match: check if one string contains the other.
 */
const looseMatch = (a, b) => {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return false;
  return na.includes(nb) || nb.includes(na);
};

/**
 * @param {object} registeredFarmer  - farmer object from localStorage
 * @param {object} geoAddress        - result from reverseGeocode()
 * @returns {{ status: string, districtMatch: boolean, villageMatch: boolean, message: string }}
 */
export const validateGeoLocation = (registeredFarmer, geoAddress) => {
  if (!registeredFarmer || !geoAddress) {
    return {
      status: "UNVERIFIED",
      districtMatch: false,
      villageMatch: false,
      message: "Location verification pending.",
    };
  }

  const districtMatch = looseMatch(
    registeredFarmer.district,
    geoAddress.district
  );
  const villageMatch = looseMatch(
    registeredFarmer.village,
    geoAddress.village
  );

  if (districtMatch && villageMatch) {
    return {
      status: "VERIFIED",
      districtMatch: true,
      villageMatch: true,
      message: "Location matches your registered village and district.",
    };
  }

  if (districtMatch && !villageMatch) {
    return {
      status: "PARTIAL",
      districtMatch: true,
      villageMatch: false,
      message:
        "District matches, but this location differs from your registered village.",
    };
  }

  return {
    status: "DIFFERENT",
    districtMatch: false,
    villageMatch: false,
    message:
      "This location differs from your registered village. Claim may require additional verification.",
  };
};

/**
 * GPS Accuracy rating.
 * @param {number|null} accuracy - accuracy in meters
 * @returns {{ label: string, color: string, warning: boolean }}
 */
export const getAccuracyRating = (accuracy) => {
  if (accuracy === null || accuracy === undefined) {
    return { label: "Unknown", color: "gray", warning: false };
  }
  if (accuracy <= 10) {
    return { label: "Excellent", color: "green", warning: false };
  }
  if (accuracy <= 20) {
    return { label: "Good", color: "blue", warning: false };
  }
  if (accuracy <= 50) {
    return { label: "Average", color: "amber", warning: false };
  }
  return {
    label: "Poor",
    color: "orange",
    warning: true,
    hint: "Move to open sky for better GPS accuracy.",
  };
};
