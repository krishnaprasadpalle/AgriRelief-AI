/**
 * reverseGeocode.js
 * Calls OpenStreetMap Nominatim to convert GPS coordinates
 * into a human-readable address. No API key required.
 */

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

/**
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<object>} Address object
 */
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const url = `${NOMINATIM_URL}?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        // Nominatim requires a valid User-Agent
        "Accept-Language": "en",
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();
    const addr = data.address || {};

    return {
      fullAddress: data.display_name || "Address unavailable",
      village:
        addr.village ||
        addr.hamlet ||
        addr.neighbourhood ||
        addr.suburb ||
        addr.town ||
        addr.city_district ||
        "",
      mandal:
        addr.suburb ||
        addr.city_district ||
        addr.county ||
        addr.state_district ||
        "",
      district:
        addr.county ||
        addr.state_district ||
        addr.district ||
        "",
      state: addr.state || "",
      country: addr.country || "",
      postcode: addr.postcode || "",
      raw: addr,
    };
  } catch (error) {
    console.warn("Reverse geocoding failed:", error.message);
    // Return a graceful fallback — GPS still works, address just unavailable
    return {
      fullAddress: "Address unavailable (offline or API error)",
      village: "",
      mandal: "",
      district: "",
      state: "",
      country: "",
      postcode: "",
      raw: {},
      error: true,
    };
  }
};
