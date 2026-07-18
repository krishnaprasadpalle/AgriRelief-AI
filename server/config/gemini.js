/**
 * server/config/gemini.js
 * ─────────────────────────────────────────────────────
 * Configures the Google Gemini Client with the API key
 * loaded from environment variables.
 *
 * Responsibilities:
 *   - Load API key from process.env.GEMINI_API_KEY or GEMINI_API_KEYS
 *   - Configure default parameters (model name, options)
 *
 * How it connects to other files:
 *   - Imported by services/geminiVisionService.js to instantiate the SDK.
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Read from GEMINI_API_KEY or GEMINI_API_KEYS (since user .env uses GEMINI_API_KEYS)
const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEYS;

if (!apiKey) {
  console.warn("⚠️ WARNING: GEMINI_API_KEY is not defined in the environment variables!");
}

const genAI = new GoogleGenerativeAI(apiKey || "DUMMY_KEY");

module.exports = {
  genAI,
  modelName: "gemini-2.5-flash", // Use 2.5-flash as requested
  apiKey,
};
