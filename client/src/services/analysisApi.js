/**
 * client/src/services/analysisApi.js
 * ─────────────────────────────────────────────────────
 * API service class for interacting with the backend analysis endpoints.
 *
 * Responsibilities:
 *   - Convert base64 data URL images to binary Blobs.
 *   - Package request fields into a multipart FormData request.
 *   - Send POST /api/analyze to the backend.
 *
 * How it connects to other files:
 *   - Used by hooks/useGeminiAnalysis.js to run the analysis network call.
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Utility to convert a base64 string into a Blob.
 *
 * @param {string} base64DataUrl - Base64 Data URL.
 * @returns {Blob} Binary blob representing the image.
 */
const base64ToBlob = (base64DataUrl) => {
  const parts = base64DataUrl.split(",");
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const byteString = atob(parts[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeType });
};

/**
 * Sends farmer report details to backend using Multipart Form Data.
 *
 * @param {object} payload - Farmer data
 * @param {string} payload.image - Base64 data URL representing the image
 * @param {string} payload.crop - Selected crop type
 * @param {string} payload.damageType - Selected damage type
 * @param {number} payload.area - Reported affected area in acres
 * @param {object} [payload.gps] - Geolocation metadata
 * @param {object} [payload.weather] - Weather metadata
 * @param {AbortSignal} [signal] - Optional abort signal for request cancellation
 * @returns {Promise<object>} Parsed JSON response from backend.
 */
export const analyzeReport = async (payload, signal) => {
  const { image, crop, damageType, area, gps, weather } = payload;

  const formData = new FormData();
  
  // Convert base64 image data-url back to binary Blob for actual file upload
  const imageBlob = base64ToBlob(image);
  formData.append("image", imageBlob, "evidence.jpg");
  
  formData.append("crop", crop);
  formData.append("damageType", damageType);
  formData.append("area", area);

  if (gps) {
    formData.append("gps", JSON.stringify(gps));
  }
  
  if (weather) {
    formData.append("weather", JSON.stringify(weather));
  }

  const response = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    body: formData, // Fetch automatically sets correct multipart headers and boundary
    signal,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to analyze crop damage.");
  }

  return data;
};
