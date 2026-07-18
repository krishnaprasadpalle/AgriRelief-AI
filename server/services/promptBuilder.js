/**
 * server/services/promptBuilder.js
 * ─────────────────────────────────────────────────────
 * Generates prompt strings dynamically for Gemini.
 *
 * Responsibilities:
 *   - Assemble system instructions and user parameters into a structured prompt.
 *   - Instruct Gemini to return a strict JSON output matching the required schema.
 *
 * How it connects to other files:
 *   - Called by services/geminiVisionService.js before calling the Gemini API.
 */

/**
 * Builds the analysis prompt based on user-supplied metadata.
 *
 * @param {object} metadata - Farmer input metadata
 * @param {string} metadata.crop - Crop type reported by farmer
 * @param {string} metadata.damageType - Damage cause reported by farmer
 * @param {number} [metadata.area] - Affected area in acres
 * @param {object} [metadata.gps] - Geolocation metadata
 * @param {object} [metadata.weather] - Weather metadata
 * @returns {string} Prompt string for Gemini
 */
const buildAnalysisPrompt = ({ crop, damageType, area, gps, weather }) => {
  return `You are acting as:
- An Agricultural Crop Damage Assessment Expert
- A Government Disaster Relief Inspector
- A Computer Vision Specialist

STRICT INSTRUCTIONS:
1. Never guess.
2. Never hallucinate.
3. If you are unsure of any value, return "Unknown" or the default fallback.
4. If the image does not show an agricultural field, set "isAgricultureField": false and set relevant fallback values.
5. If a crop is present but cannot be identified, set "cropDetected": false and "cropType": "Unknown".
6. Never invent crop names outside of [Paddy, Cotton, Groundnut, Sugarcane, Maize, Chilli, Unknown].
7. Never invent damage types. Supported values: [Flood, Drought, Cyclone, Pest, Disease, Healthy Crop, Unknown].
8. Return JSON ONLY. Do NOT wrap the JSON in markdown code blocks (e.g. do NOT use \`\`\`json). Do NOT write any explanations or text around the JSON.

METADATA FROM FARMER REPORT:
- Reported Crop: ${crop}
- Reported Damage Type: ${damageType}
${area ? `- Reported Affected Area (Acres): ${area}` : ""}
${gps ? `- GPS Coordinates: Lat ${gps.latitude}, Lon ${gps.longitude}` : ""}
${weather ? `- Weather: Temp ${weather.temperature}°C, Humidity ${weather.humidity}%, Condition ${weather.description}` : ""}

ANALYSIS STEPS:
1. Determine if the uploaded image contains an agricultural field (farm field, crops, soil, etc.).
2. If it is NOT an agricultural field, return:
{
  "isAgricultureField": false,
  "cropDetected": false,
  "cropType": "Unknown",
  "damageDetected": false,
  "damageType": "Unknown",
  "affectedPercentage": 0,
  "severity": "Unknown",
  "confidence": 99,
  "recommendation": null,
  "reason": "The uploaded image is not an agricultural field.",
  "indicators": {
    "standingWater": false,
    "siltDeposit": false,
    "lodging": false,
    "rottingDecay": false
  },
  "sdrfEligibility": "NOT_ELIGIBLE"
}
3. If it IS an agricultural field:
   a. Detect the crop. Supported crops: Paddy, Cotton, Groundnut, Sugarcane, Maize, Chilli, Unknown.
   b. Detect damage. Supported damage: Flood, Drought, Cyclone, Pest, Disease, Healthy Crop, Unknown.
   c. Check for physical flood / disaster indicators:
      - standingWater (boolean): is there standing water or flooding in the field?
      - siltDeposit (boolean): are leaves/crops coated with mud or silt?
      - lodging (boolean): are crop stems flattened or bent?
      - rottingDecay (boolean): are crops showing visible signs of decay or rot due to flooding/excess water?
   d. Estimate the percentage of visible area affected (0-100).
   e. Set the sdrfEligibility category based on the estimated damage percentage:
      - "NOT_ELIGIBLE" (under 33% damage)
      - "ELIGIBLE_MODERATE" (33% to 50% damage)
      - "ELIGIBLE_SEVERE" (51% to 75% damage)
      - "ELIGIBLE_TOTAL_LOSS" (above 75% damage)
   f. Estimate severity: Low, Medium, High, Critical.
   g. Estimate your confidence in this analysis (0-100).
   h. Generate a professional recommendation for relief/remediation (e.g. fungicide spray, drain field, re-sowing).

STRICT JSON OUTPUT FORMAT (Example for valid image):
{
  "isAgricultureField": true,
  "cropDetected": true,
  "cropType": "Paddy",
  "damageDetected": true,
  "damageType": "Flood",
  "affectedPercentage": 72,
  "severity": "High",
  "confidence": 91,
  "recommendation": "Drain standing water immediately. Apply copper-based fungicide to prevent root rot. Eligible for SDRF relief fund.",
  "reason": null,
  "indicators": {
    "standingWater": true,
    "siltDeposit": true,
    "lodging": false,
    "rottingDecay": true
  },
  "sdrfEligibility": "ELIGIBLE_SEVERE"
}

Generate the JSON response now:`;
};

module.exports = {
  buildAnalysisPrompt,
};

