/**
 * server/controllers/analysisController.js
 * ─────────────────────────────────────────────────────
 * Handles requests for image damage analysis.
 *
 * Responsibilities:
 *   - Extract upload file and metadata from multipart form request.
 *   - Parse stringified JSON fields (gps, weather) if needed.
 *   - Validate file exists, size is under 5MB, and type is allowed.
 *   - Validate crop and damageType fields.
 *   - Invoke services/geminiVisionService.js to perform analysis.
 *   - Catch and return clean validation/API error responses.
 *
 * How it connects to other files:
 *   - Imported by routes/analysisRoutes.js.
 *   - Calls services/geminiVisionService.js.
 */

const { analyzeImageWithGemini } = require("../services/geminiVisionService");

// Allowed MIME types
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Endpoint: POST /api/analyze
 */
const analyzeHandler = async (req, res, next) => {
  try {
    // 1. File existence validation
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded. Please capture crop evidence.",
      });
    }

    const { buffer, mimetype, size } = req.file;

    // 2. File type validation
    if (!ALLOWED_MIME_TYPES.includes(mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image format. Supported formats: JPEG, PNG, WebP.",
      });
    }

    // 3. File size validation
    if (size > MAX_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        message: "Image size exceeds the 5MB limit. Please capture a lower resolution image.",
      });
    }

    // 4. Input metadata extraction
    const { crop, damageType, area } = req.body;

    if (!crop || crop.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Crop type is required.",
      });
    }

    if (!damageType || damageType.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Damage cause is required.",
      });
    }

    // 5. Parse GPS and Weather from stringified values (as multipart sends fields as string)
    let gps = null;
    if (req.body.gps) {
      try {
        gps = typeof req.body.gps === "string" ? JSON.parse(req.body.gps) : req.body.gps;
      } catch (e) {
        console.warn("Failed to parse gps field as JSON:", req.body.gps);
      }
    }

    if (!gps && (req.body.latitude || req.body.longitude)) {
      gps = {
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude),
        timestamp: req.body.timestamp || new Date().toISOString(),
      };
    }

    let weather = null;
    if (req.body.weather) {
      try {
        weather = typeof req.body.weather === "string" ? JSON.parse(req.body.weather) : req.body.weather;
      } catch (e) {
        console.warn("Failed to parse weather field as JSON:", req.body.weather);
      }
    }

    // 6. Perform Gemini Vision analysis
    console.log(`[AnalysisController] Dispatching analysis for crop ${crop}, damage ${damageType}`);
    const analysisResult = await analyzeImageWithGemini(buffer, mimetype, {
      crop,
      damageType,
      area,
      gps,
      weather,
    });

    // 7. Return strict standard JSON structure
    return res.status(200).json({
      success: true,
      ...analysisResult,
    });
  } catch (error) {
    // Pass errors down to the error handler middleware
    next(error);
  }
};

module.exports = {
  analyzeHandler,
};
