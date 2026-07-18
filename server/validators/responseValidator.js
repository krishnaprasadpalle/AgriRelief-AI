/**
 * server/validators/responseValidator.js
 * ─────────────────────────────────────────────────────
 * Validates the Gemini response to ensure strict format compliance.
 *
 * Responsibilities:
 *   - Parse response text to JSON.
 *   - Check for required fields.
 *   - Validate confidence is in the range 0-100.
 *   - Validate severity matches allowed enum values.
 *
 * How it connects to other files:
 *   - Called by services/geminiVisionService.js to validate the API output.
 */

const ALLOWED_SEVERITIES = ["Low", "Medium", "High", "Critical", "Unknown"];

/**
 * Validates the parsed Gemini response.
 *
 * @param {string} responseText - Raw text response from Gemini.
 * @returns {object} Validated response object.
 * @throws {Error} If validation fails.
 */
const validateResponse = (responseText) => {
  if (!responseText) {
    throw new Error("Empty response from Gemini API.");
  }

  let data;
  try {
    // Strip markdown code fences if Gemini ignores prompt instructions
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "");
    }
    data = JSON.parse(cleanedText);
  } catch (e) {
    throw new Error("Failed to parse Gemini response as JSON: " + e.message);
  }

  // Check required fields
  const requiredFields = [
    "isAgricultureField",
    "cropDetected",
    "cropType",
    "damageDetected",
    "damageType",
    "affectedPercentage",
    "severity",
    "confidence",
    "recommendation",
    "reason",
  ];

  const missingFields = requiredFields.filter((field) => !(field in data));
  if (missingFields.length > 0) {
    throw new Error(`Gemini response is missing required fields: ${missingFields.join(", ")}`);
  }

  // Validate types and constraints
  if (typeof data.isAgricultureField !== "boolean") {
    throw new Error("isAgricultureField must be a boolean.");
  }
  if (typeof data.cropDetected !== "boolean") {
    throw new Error("cropDetected must be a boolean.");
  }
  if (typeof data.damageDetected !== "boolean") {
    throw new Error("damageDetected must be a boolean.");
  }

  // Confidence constraints
  const confidence = Number(data.confidence);
  if (isNaN(confidence) || confidence < 0 || confidence > 100) {
    throw new Error(`Invalid confidence value: ${data.confidence}. Must be a number between 0 and 100.`);
  }
  data.confidence = confidence;

  // Severity constraints
  if (!ALLOWED_SEVERITIES.includes(data.severity)) {
    throw new Error(`Invalid severity value: "${data.severity}". Must be one of: ${ALLOWED_SEVERITIES.join(", ")}`);
  }

  // Affected percentage constraints
  const pct = Number(data.affectedPercentage);
  if (isNaN(pct) || pct < 0 || pct > 100) {
    throw new Error(`Invalid affectedPercentage value: ${data.affectedPercentage}. Must be between 0 and 100.`);
  }
  data.affectedPercentage = pct;

  return data;
};

module.exports = {
  validateResponse,
};
