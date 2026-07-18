/**
 * imageValidator.js
 * ─────────────────────────────────────────────────────
 * Validates uploaded images BEFORE they reach the AI service.
 *
 * Checks:
 *   1. At least one image exists
 *   2. No more than maxImages
 *   3. Each file is an allowed MIME type
 *   4. Each file is under the size limit
 *
 * Connections:
 *   → called by  controllers/analysisController.js
 *   → reads limits from  config/geminiConfig.js
 */

const geminiConfig = require("../config/geminiConfig");

/**
 * Validate an array of base64 image strings.
 *
 * @param {string[]} images — base64 data-URL strings
 * @returns {{ valid: boolean, message?: string }}
 */
const validateImages = (images) => {
  // 1. Existence check
  if (!images || !Array.isArray(images) || images.length === 0) {
    return { valid: false, message: "At least one image is required for analysis." };
  }

  // 2. Count check
  if (images.length > geminiConfig.maxImages) {
    return {
      valid: false,
      message: `Maximum ${geminiConfig.maxImages} images allowed. You sent ${images.length}.`,
    };
  }

  // 3. Per-image checks
  for (let i = 0; i < images.length; i++) {
    const img = images[i];

    // Must be a data URL string
    if (typeof img !== "string" || !img.startsWith("data:image/")) {
      return {
        valid: false,
        message: `Image #${i + 1} is not a valid image data URL.`,
      };
    }

    // Extract MIME type  e.g. "data:image/jpeg;base64,..."
    const mimeMatch = img.match(/^data:(image\/[a-z+]+);base64,/i);
    if (!mimeMatch) {
      return {
        valid: false,
        message: `Image #${i + 1} has an unrecognised format.`,
      };
    }

    const mime = mimeMatch[1].toLowerCase();
    if (!geminiConfig.allowedMimeTypes.includes(mime)) {
      return {
        valid: false,
        message: `Image #${i + 1} type "${mime}" is not supported. Use JPEG, PNG, or WebP.`,
      };
    }

    // Approximate byte size of base64 payload
    const base64Data = img.split(",")[1] || "";
    const byteSize = Math.ceil((base64Data.length * 3) / 4);
    if (byteSize > geminiConfig.maxImageSize) {
      const maxMB = (geminiConfig.maxImageSize / (1024 * 1024)).toFixed(0);
      return {
        valid: false,
        message: `Image #${i + 1} exceeds the ${maxMB} MB size limit.`,
      };
    }
  }

  return { valid: true };
};

module.exports = { validateImages };
