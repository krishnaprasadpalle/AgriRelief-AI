/**
 * geminiAnalysisService.js
 * ─────────────────────────────────────────────────────
 * Service layer for Gemini Vision API communication.
 *
 * When geminiConfig.useLiveApi is true AND the API key is set,
 * images are sent to Google Gemini for real AI analysis.
 * Otherwise falls back to structured mock responses.
 *
 * Connections:
 *   → called by     controllers/analysisController.js
 *   → uses          services/promptBuilder.js
 *   → reads config  config/geminiConfig.js
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const geminiConfig = require("../config/geminiConfig");
const { buildAnalysisPrompt, buildValidationPrompt } = require("./promptBuilder");

// ─── Initialise Gemini client (lazily — only when key exists) ────────────────

let genAI = null;
let model = null;

const getModel = () => {
  if (!model && geminiConfig.apiKey) {
    genAI = new GoogleGenerativeAI(geminiConfig.apiKey);
    model = genAI.getGenerativeModel({ model: geminiConfig.model });
  }
  return model;
};

// ─── Helper: convert base64 data-URL to Gemini inline part ───────────────────

const base64ToGeminiPart = (dataUrl) => {
  // dataUrl = "data:image/jpeg;base64,/9j/4AAQ..."
  const match = dataUrl.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
  if (!match) throw new Error("Invalid image data URL.");
  return {
    inlineData: {
      mimeType: match[1],
      data: match[2],
    },
  };
};

// ─── Helper: extract JSON from Gemini response text ──────────────────────────

const extractJSON = (text) => {
  // Gemini sometimes wraps JSON in ```json ... ``` blocks
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1].trim() : text.trim();
  return JSON.parse(raw);
};

// ─── Helper: build a safe standard response from parsed Gemini JSON ──────────

const buildStandardResponse = (parsed, { crop, damageType, geo }) => {
  return {
    success: true,
    validation: {
      isAgricultureField: parsed.validation?.isAgricultureField ?? true,
      cropDetected: parsed.validation?.cropDetected ?? true,
      confidence: parsed.validation?.confidence ?? 0.85,
    },
    crop: {
      type: parsed.crop?.type || crop,
      matchesReported: parsed.crop?.matchesReported ?? true,
    },
    damage: {
      detected: parsed.damage?.detected ?? true,
      type: parsed.damage?.type || damageType,
      severity: parsed.damage?.severity || "Medium",
      affectedPercentage: parsed.damage?.affectedPercentage ?? 50,
      description: parsed.damage?.description || `${damageType} damage detected in ${crop} crop.`,
    },
    geoVerification: {
      verified: parsed.geoVerification?.verified ?? (geo?.verificationStatus === "VERIFIED"),
    },
    recommendation: {
      priority: parsed.recommendation?.priority || "High Priority",
      action: parsed.recommendation?.action || "Compensation assessment recommended.",
      estimatedLoss: parsed.recommendation?.estimatedLoss || "Estimated loss pending field inspection.",
    },
  };
};

// ─── Mock data maps (fallback when API is off) ───────────────────────────────

const DAMAGE_MAP = {
  "Paddy-Flood": {
    description: "Paddy Field Inundation & Tillering Decay (Water logging over 48 hours)",
    severity: "High", affectedPercentage: 78, priority: "Immediate Inspection",
    confidence: 0.956, action: "Immediate relief fund release. Resowing subsidy recommended.",
    estimatedLoss: "₹45,000 per acre",
  },
  "Paddy-Drought": {
    description: "Severe Leaf Rolling & Moisture Deficit Chlorosis in Paddy",
    severity: "High", affectedPercentage: 72, priority: "Immediate Inspection",
    confidence: 0.942, action: "Drought relief compensation under PMFBY scheme.",
    estimatedLoss: "₹38,000 per acre",
  },
  "Cotton-Pest Attack": {
    description: "Pink Bollworm Infestation & Cotton Fiber Destruction",
    severity: "High", affectedPercentage: 65, priority: "High Priority",
    confidence: 0.938, action: "Pest damage assessment confirms crop loss. Approve input subsidy.",
    estimatedLoss: "₹52,000 per acre",
  },
  "Cotton-Heavy Rain": {
    description: "Siltation Damage & Boll Shedding due to heavy rainfall",
    severity: "Medium", affectedPercentage: 48, priority: "High Priority",
    confidence: 0.905, action: "Partial compensation for yield reduction.",
    estimatedLoss: "₹28,000 per acre",
  },
  "Maize-Cyclone": {
    description: "Lodging of Maize Stems & Root Lodging due to high winds",
    severity: "High", affectedPercentage: 82, priority: "Immediate Inspection",
    confidence: 0.964, action: "Full cyclone relief compensation recommended.",
    estimatedLoss: "₹35,000 per acre",
  },
};

const CAUSE_MAP = {
  Flood:           { severity: "High",   pct: 75, priority: "Immediate Inspection", conf: 0.951 },
  "Heavy Rain":    { severity: "Medium", pct: 45, priority: "High Priority",        conf: 0.912 },
  Drought:         { severity: "High",   pct: 70, priority: "Immediate Inspection", conf: 0.968 },
  Cyclone:         { severity: "High",   pct: 80, priority: "Immediate Inspection", conf: 0.971 },
  "Pest Attack":   { severity: "Medium", pct: 55, priority: "High Priority",        conf: 0.923 },
  Hailstorm:       { severity: "High",   pct: 68, priority: "Immediate Inspection", conf: 0.945 },
  "Animal Damage": { severity: "Medium", pct: 35, priority: "Moderate",             conf: 0.887 },
  Other:           { severity: "Medium", pct: 40, priority: "Moderate",             conf: 0.85  },
};

const getMockResponse = ({ crop, damageType, geo }) => {
  const key = `${crop}-${damageType}`;
  const s = DAMAGE_MAP[key];
  const f = CAUSE_MAP[damageType] || CAUSE_MAP.Other;

  return {
    success: true,
    validation: { isAgricultureField: true, cropDetected: true, confidence: parseFloat((s?.confidence || f.conf).toFixed(3)) },
    crop: { type: crop, matchesReported: true },
    damage: {
      detected: true, type: damageType,
      severity: s?.severity || f.severity,
      affectedPercentage: s?.affectedPercentage || f.pct,
      description: s?.description || `${damageType} damage detected in ${crop} crop field.`,
    },
    geoVerification: { verified: geo?.verificationStatus === "VERIFIED" },
    recommendation: {
      priority: s?.priority || f.priority,
      action: s?.action || `${f.severity} severity ${damageType.toLowerCase()} damage confirmed. Compensation assessment recommended.`,
      estimatedLoss: s?.estimatedLoss || "₹30,000 per acre (estimated)",
    },
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
//  PUBLIC METHODS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Full crop damage analysis — LIVE Gemini or mock fallback.
 */
const analyzeCropDamage = async ({ images, crop, damageType, geo, weather }) => {
  const prompt = buildAnalysisPrompt({ crop, damageType, geo, weather });

  // ─── LIVE GEMINI CALL ──────────────────────────────────────────────────
  if (geminiConfig.useLiveApi && geminiConfig.apiKey) {
    try {
      const geminiModel = getModel();

      // Build parts array: text prompt + all images
      const parts = [{ text: prompt }];
      for (const img of images) {
        parts.push(base64ToGeminiPart(img));
      }

      console.log(`[Gemini] Sending ${images.length} image(s) for ${crop}/${damageType} analysis…`);

      const result = await geminiModel.generateContent(parts);
      const responseText = result.response.text();

      console.log("[Gemini] Raw response received. Parsing JSON…");

      const parsed = extractJSON(responseText);
      return buildStandardResponse(parsed, { crop, damageType, geo });
    } catch (err) {
      console.error("[Gemini] Live API call failed:", err.message);
      throw new Error(`AI Analysis failed: ${err.message || "Unknown error occurred"}`);
    }
  }

  // ─── MOCK FALLBACK ────────────────────────────────────────────────────
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return getMockResponse({ crop, damageType, geo });
};

/**
 * Quick image validation — is this an agricultural field?
 */
const validateAgricultureImage = async (images) => {
  if (geminiConfig.useLiveApi && geminiConfig.apiKey && images?.length) {
    try {
      const geminiModel = getModel();
      const parts = [{ text: buildValidationPrompt() }, base64ToGeminiPart(images[0])];
      const result = await geminiModel.generateContent(parts);
      return extractJSON(result.response.text());
    } catch (err) {
      console.error("[Gemini] Validation call failed:", err.message);
    }
  }

  return { isAgricultureField: true, cropDetected: true, confidence: 0.92 };
};

/**
 * Detect crop type from image alone.
 */
const detectCrop = async (images) => {
  if (geminiConfig.useLiveApi && geminiConfig.apiKey && images?.length) {
    try {
      const geminiModel = getModel();
      const parts = [
        { text: "Identify the crop in this image. Return JSON: {\"detected\":true,\"type\":\"CropName\",\"confidence\":0.0}" },
        base64ToGeminiPart(images[0]),
      ];
      const result = await geminiModel.generateContent(parts);
      return extractJSON(result.response.text());
    } catch (err) {
      console.error("[Gemini] Crop detection failed:", err.message);
    }
  }

  return { detected: true, type: "Unknown", confidence: 0.78 };
};

/**
 * Estimate damage severity from image alone.
 */
const estimateSeverity = async (images) => {
  if (geminiConfig.useLiveApi && geminiConfig.apiKey && images?.length) {
    try {
      const geminiModel = getModel();
      const parts = [
        { text: "Estimate crop damage severity. Return JSON: {\"severity\":\"High/Medium/Low\",\"confidence\":0.0,\"affectedPercentage\":0}" },
        base64ToGeminiPart(images[0]),
      ];
      const result = await geminiModel.generateContent(parts);
      return extractJSON(result.response.text());
    } catch (err) {
      console.error("[Gemini] Severity estimation failed:", err.message);
    }
  }

  return { severity: "Medium", confidence: 0.85, affectedPercentage: 50 };
};

module.exports = {
  analyzeCropDamage,
  validateAgricultureImage,
  detectCrop,
  estimateSeverity,
};
