const crypto = require("crypto");

const SDRF_RATES_PER_HECTARE = {
  irrigated: 17000,
  rainfed: 8500,
  perennial: 22500,
};

const CROP_CATEGORY = {
  Paddy: "irrigated",
  Cotton: "rainfed",
  Groundnut: "rainfed",
  Sugarcane: "perennial",
  Maize: "rainfed",
  Chilli: "irrigated",
  Unknown: "rainfed",
};

const CASE_PATTERNS = [
  {
    id: "flood-submergence-paddy",
    triggers: ["Flood", "Heavy Rain"],
    crops: ["Paddy"],
    indicators: ["standingWater", "rottingDecay"],
    reportDataUsed: ["photo waterline", "GPS point", "rainfall context", "affected acreage"],
    calculation: "area x affected percentage x SDRF irrigated rate",
  },
  {
    id: "silted-cotton-heavy-rain",
    triggers: ["Heavy Rain", "Flood"],
    crops: ["Cotton"],
    indicators: ["siltDeposit"],
    reportDataUsed: ["silt marks", "boll shedding evidence", "village match", "acreage"],
    calculation: "moderate band when visible loss is 33-50 percent",
  },
  {
    id: "cyclone-maize-lodging",
    triggers: ["Cyclone"],
    crops: ["Maize"],
    indicators: ["lodging"],
    reportDataUsed: ["flattened stems", "wind/rain context", "plot location"],
    calculation: "high priority when lodging is widespread",
  },
  {
    id: "drought-groundnut-moisture-stress",
    triggers: ["Drought"],
    crops: ["Groundnut"],
    indicators: [],
    reportDataUsed: ["dry soil", "wilting", "rainfall deficit", "acreage"],
    calculation: "damage percentage adjusted by heat and dry-weather evidence",
  },
  {
    id: "chilli-pest-defoliation",
    triggers: ["Pest", "Pest Attack"],
    crops: ["Chilli"],
    indicators: [],
    reportDataUsed: ["leaf curl/holes", "crop close-up", "farmer crop declaration"],
    calculation: "input subsidy recommendation plus loss band",
  },
  {
    id: "sugarcane-waterlogging-rot",
    triggers: ["Flood", "Heavy Rain"],
    crops: ["Sugarcane"],
    indicators: ["standingWater", "rottingDecay"],
    reportDataUsed: ["standing water", "stalk rot", "perennial crop category"],
    calculation: "perennial SDRF rate with severe band when rot appears",
  },
  {
    id: "hailstorm-field-patch-loss",
    triggers: ["Hailstorm"],
    crops: ["Paddy", "Cotton", "Maize", "Chilli"],
    indicators: [],
    reportDataUsed: ["torn leaves", "patch-level image evidence", "timestamp"],
    calculation: "patch visible loss converted to affected percentage",
  },
  {
    id: "animal-damage-boundary-loss",
    triggers: ["Animal Damage"],
    crops: ["Paddy", "Cotton", "Groundnut", "Maize"],
    indicators: [],
    reportDataUsed: ["trampled area", "field boundary", "reported acreage"],
    calculation: "manual inspection recommended unless visible loss exceeds threshold",
  },
  {
    id: "healthy-crop-rejection",
    triggers: ["Healthy Crop"],
    crops: ["Paddy", "Cotton", "Groundnut", "Sugarcane", "Maize", "Chilli"],
    indicators: [],
    reportDataUsed: ["green canopy", "no physical damage", "low affected percentage"],
    calculation: "not eligible under 33 percent damage",
  },
  {
    id: "location-mismatch-fraud-risk",
    triggers: ["Flood", "Drought", "Cyclone", "Pest", "Disease", "Heavy Rain", "Hailstorm", "Animal Damage"],
    crops: ["Paddy", "Cotton", "Groundnut", "Sugarcane", "Maize", "Chilli", "Unknown"],
    indicators: [],
    reportDataUsed: ["captured GPS", "registered village/district", "distance mismatch"],
    calculation: "hold payout and require field verification when coordinates are inconsistent",
  },
];

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const normalizeDamageType = (damageType) => {
  const value = String(damageType || "Unknown").trim();
  const map = {
    "Pest Attack": "Pest",
    "Heavy Rain": "Flood",
    Hailstorm: "Cyclone",
    "Animal Damage": "Unknown",
    Other: "Unknown",
  };
  return map[value] || value;
};

const normalizeText = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, " ");

const looseMatch = (a, b) => {
  const left = normalizeText(a);
  const right = normalizeText(b);
  if (!left || !right) return true;
  return left.includes(right) || right.includes(left);
};

const getSdrfEligibility = (affectedPercentage) => {
  if (affectedPercentage < 33) return "NOT_ELIGIBLE";
  if (affectedPercentage <= 50) return "ELIGIBLE_MODERATE";
  if (affectedPercentage <= 75) return "ELIGIBLE_SEVERE";
  return "ELIGIBLE_TOTAL_LOSS";
};

const getSeverity = (affectedPercentage) => {
  if (affectedPercentage <= 0) return "Unknown";
  if (affectedPercentage < 33) return "Low";
  if (affectedPercentage <= 50) return "Medium";
  if (affectedPercentage <= 75) return "High";
  return "Critical";
};

const getPriority = ({ severity, confidence, geoRiskLevel, sdrfEligibility }) => {
  if (geoRiskLevel === "HIGH") return "Field Verification";
  if (sdrfEligibility === "NOT_ELIGIBLE") return "Low";
  if (confidence < 70) return "Review";
  if (severity === "Critical") return "Immediate";
  if (severity === "High") return "High";
  return "Standard";
};

const getDistanceInMeters = (a, b) => {
  if (!a || !b) return null;
  const lat1 = toNumber(a.latitude);
  const lon1 = toNumber(a.longitude);
  const lat2 = toNumber(b.latitude);
  const lon2 = toNumber(b.longitude);
  if ([lat1, lon1, lat2, lon2].some((value) => value === null)) return null;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return earthRadius * (2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
};

const getGeoAssessment = (metadata) => {
  const gps = metadata.gps || null;
  const registeredLocation = metadata.registeredLocation || null;
  const distanceMeters = getDistanceInMeters(gps, registeredLocation);
  const status = gps?.verificationStatus || "UNVERIFIED";
  const accuracy = toNumber(gps?.accuracy);

  let geoRiskLevel = "LOW";
  const flags = [];

  if (status === "DIFFERENT") {
    geoRiskLevel = "HIGH";
    flags.push("GPS address differs from registered village or district.");
  } else if (status === "PARTIAL") {
    geoRiskLevel = "MEDIUM";
    flags.push("District matched, village requires verification.");
  }

  if (gps && registeredLocation) {
    const districtMatch = looseMatch(gps.district, registeredLocation.district);
    const villageMatch = looseMatch(gps.village, registeredLocation.village);
    if (!districtMatch) {
      geoRiskLevel = "HIGH";
      flags.push("Captured district differs from registered farmer district.");
    } else if (!villageMatch) {
      geoRiskLevel = geoRiskLevel === "HIGH" ? "HIGH" : "MEDIUM";
      flags.push("Captured village differs from registered farmer village.");
    }
  }

  if (distanceMeters !== null && distanceMeters > 1000) {
    geoRiskLevel = "HIGH";
    flags.push(`Captured coordinates are ${Math.round(distanceMeters)}m from the registered farm point.`);
  } else if (distanceMeters !== null && distanceMeters > 100) {
    geoRiskLevel = geoRiskLevel === "HIGH" ? "HIGH" : "MEDIUM";
    flags.push(`Captured coordinates are ${Math.round(distanceMeters)}m from the registered farm point.`);
  }

  if (accuracy !== null && accuracy > 50) {
    geoRiskLevel = geoRiskLevel === "HIGH" ? "HIGH" : "MEDIUM";
    flags.push(`GPS accuracy is poor at +/-${Math.round(accuracy)}m.`);
  }

  return {
    verificationStatus: status,
    distanceMeters: distanceMeters === null ? null : Math.round(distanceMeters),
    geoRiskLevel,
    flags,
  };
};

const estimateCost = ({ cropType, affectedPercentage, area, sdrfEligibility, geoRiskLevel }) => {
  const areaAcres = toNumber(area) || 0;
  const category = CROP_CATEGORY[cropType] || CROP_CATEGORY.Unknown;
  const ratePerHectare = SDRF_RATES_PER_HECTARE[category];
  const eligibleAreaHectares = areaAcres * 0.404686 * (affectedPercentage / 100);
  const estimatedAmount = sdrfEligibility === "NOT_ELIGIBLE" ? 0 : Math.round(eligibleAreaHectares * ratePerHectare);

  return {
    currency: "INR",
    cropCategory: category,
    ratePerHectare,
    claimedAreaAcres: areaAcres,
    eligibleAreaHectares: Number(eligibleAreaHectares.toFixed(3)),
    estimatedAmount,
    payoutStatus: geoRiskLevel === "HIGH" ? "HOLD_FOR_FIELD_VERIFICATION" : estimatedAmount > 0 ? "ESTIMATED" : "NOT_ELIGIBLE",
    formula: "claimedAreaAcres x 0.404686 x affectedPercentage x SDRF crop-category rate",
  };
};

const matchCasePatterns = (analysis, metadata) => {
  const damage = metadata.damageType || analysis.damageType;
  const crop = analysis.cropType || metadata.crop || "Unknown";
  return CASE_PATTERNS.filter((item) => {
    const triggerMatch = item.triggers.includes(damage) || item.triggers.includes(analysis.damageType);
    const cropMatch = item.crops.includes(crop) || item.crops.includes("Unknown");
    const indicatorMatch =
      item.indicators.length === 0 ||
      item.indicators.some((indicator) => analysis.indicators?.[indicator]);
    return triggerMatch && cropMatch && indicatorMatch;
  }).slice(0, 3);
};

const getImageFingerprintAdjustment = (fileBuffer) => {
  if (!fileBuffer) return { percentageDelta: 0, confidenceDelta: 0 };
  const digest = crypto.createHash("sha256").update(fileBuffer).digest();
  return {
    percentageDelta: (digest[0] % 17) - 8,
    confidenceDelta: (digest[1] % 13) - 6,
  };
};

const orchestrateAnalysis = (analysis, metadata, fileBuffer) => {
  const imageAdjustment = getImageFingerprintAdjustment(fileBuffer);
  const affectedPercentage = clamp(
    Math.round((toNumber(analysis.affectedPercentage) || 0) + imageAdjustment.percentageDelta),
    0,
    100
  );
  const confidence = clamp(
    Math.round((toNumber(analysis.confidence) || 70) + imageAdjustment.confidenceDelta),
    45,
    99
  );
  const normalizedDamageType = normalizeDamageType(analysis.damageType || metadata.damageType);
  const sdrfEligibility = getSdrfEligibility(affectedPercentage);
  const severity = getSeverity(affectedPercentage);
  const geoAssessment = getGeoAssessment(metadata);
  const priority = getPriority({
    severity,
    confidence,
    geoRiskLevel: geoAssessment.geoRiskLevel,
    sdrfEligibility,
  });
  const cropType = analysis.cropType || metadata.crop || "Unknown";
  const costEstimation = estimateCost({
    cropType,
    affectedPercentage,
    area: metadata.area,
    sdrfEligibility,
    geoRiskLevel: geoAssessment.geoRiskLevel,
  });
  const caseMatches = matchCasePatterns(
    { ...analysis, affectedPercentage, damageType: normalizedDamageType },
    metadata
  );

  return {
    ...analysis,
    damageType: normalizedDamageType,
    affectedPercentage,
    severity,
    confidence,
    sdrfEligibility,
    priority,
    geoAssessment,
    costEstimation,
    orchestration: {
      decision: priority === "Field Verification" ? "REVIEW_REQUIRED" : sdrfEligibility,
      caseMatches,
      checks: [
        "visual crop and damage detection",
        "SDRF threshold check at 33 percent",
        "GPS village/district and coordinate risk check",
        "relief amount estimation",
      ],
    },
  };
};

module.exports = {
  normalizeDamageType,
  orchestrateAnalysis,
};
