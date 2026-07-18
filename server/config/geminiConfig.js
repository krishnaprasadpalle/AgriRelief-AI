/**
 * geminiConfig.js
 * ─────────────────────────────────────────────────────
 * Centralised Gemini API configuration.
 *
 * When the real API key is added, only THIS file changes.
 * Every other service reads from here.
 *
 * Connections:
 *   → consumed by  services/geminiAnalysisService.js
 */

const geminiConfig = {
  // Read from .env — GEMINI_API_KEYS (matches the key name in server/.env)
  apiKey: process.env.GEMINI_API_KEYS || "",

  // Gemini model to use for vision analysis
  model: "gemini-2.5-flash",

  // Whether to use the real Gemini API or return mock data
  // API key is now configured — live mode enabled
  useLiveApi: true,

  // Maximum images per analysis request
  maxImages: 5,

  // Maximum single image size in bytes (5 MB)
  maxImageSize: 5 * 1024 * 1024,

  // Allowed MIME types
  allowedMimeTypes: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ],

  // API timeout in milliseconds
  timeout: 30000,
};

module.exports = geminiConfig;
