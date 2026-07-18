/**
 * server/services/geminiVisionService.js
 * ─────────────────────────────────────────────────────
 * Handles communication with Google Gemini Generative AI (Vision API).
 *
 * Responsibilities:
 *   - Convert the uploaded binary file buffer into Gemini inline data.
 *   - Call the Gemini Vision model.
 *   - Retrieve the response text.
 *   - Validate using responseValidator.
 *
 * How it connects to other files:
 *   - Called by controllers/analysisController.js.
 *   - Uses config/gemini.js for model configuration and promptBuilder.js for the prompt.
 *   - Uses validators/responseValidator.js to check the API response.
 */

const { genAI, modelName, apiKey } = require("../config/gemini");
const { buildAnalysisPrompt } = require("./promptBuilder");
const { validateResponse } = require("../validators/responseValidator");

/**
 * Converts a buffer to a format required by the Google Gen AI SDK.
 *
 * @param {Buffer} buffer - File buffer.
 * @param {string} mimeType - File MIME type.
 * @returns {object} Inline data object.
 */
const bufferToGenerativePart = (buffer, mimeType) => {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType,
    },
  };
};

/**
 * Sends image and report metadata to Gemini Vision API for analysis.
 *
 * @param {Buffer} fileBuffer - Image file buffer.
 * @param {string} mimeType - Image MIME type (e.g. image/jpeg).
 * @param {object} metadata - Farmer crop/damage/location reports.
 * @returns {Promise<object>} Parsed and validated analysis JSON.
 */
const analyzeImageWithGemini = async (fileBuffer, mimeType, metadata) => {
  // If the API key is not configured, we cannot call Gemini. Throw a clean error.
  if (!apiKey || apiKey === "DUMMY_KEY") {
    throw new Error("Gemini API key is not configured. Please define GEMINI_API_KEY in the server env.");
  }

  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const prompt = buildAnalysisPrompt(metadata);
    const imagePart = bufferToGenerativePart(fileBuffer, mimeType);

    // Call Gemini API with a timeout
    const apiCallPromise = model.generateContent([prompt, imagePart]);
    
    // 30 seconds timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Gemini API request timed out after 30 seconds.")), 30000)
    );

    const result = await Promise.race([apiCallPromise, timeoutPromise]);
    const response = await result.response;
    const text = response.text();

    // Parse and validate the response JSON
    const validatedData = validateResponse(text);
    return validatedData;
  } catch (error) {
    console.error("Error in Gemini Vision Service:", error.message || error);
    throw new Error(error.message || "Failed to analyze image using Gemini Vision API.");
  }
};

module.exports = {
  analyzeImageWithGemini,
};
