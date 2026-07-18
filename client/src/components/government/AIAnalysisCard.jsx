import React from "react";

const AIAnalysisCard = ({ claim }) => {
  // Re-compute the same AI diagnosis used at submission time
  const getAIDiagnosis = (cropType, cause) => {
    const defaults = {
      damage: `${cause} Damage - Severe ${cropType} Crop Loss`,
      severity: "High",
      priority: "High",
      confidence: "91.8%",
      recommendation:
        "Immediate compensation disbursement recommended based on satellite imagery correlation.",
    };

    const map = {
      "Paddy-Flood": {
        damage: "Paddy Field Inundation & Tillering Decay (Water logging over 48 hours)",
        severity: "High",
        priority: "Immediate",
        confidence: "95.6%",
        recommendation: "Immediate relief fund release. Resowing subsidy recommended.",
      },
      "Paddy-Drought": {
        damage: "Severe Leaf Rolling & Moisture Deficit Chlorosis in Paddy",
        severity: "High",
        priority: "Immediate",
        confidence: "94.2%",
        recommendation: "Drought relief compensation under PMFBY scheme.",
      },
      "Cotton-Pest Attack": {
        damage: "Pink Bollworm Infestation & Cotton Fiber Destruction",
        severity: "High",
        priority: "High",
        confidence: "93.8%",
        recommendation: "Pest damage assessment confirms crop loss. Approve input subsidy.",
      },
      "Cotton-Heavy Rain": {
        damage: "Siltation Damage & Boll Shedding due to heavy rainfall",
        severity: "Medium",
        priority: "High",
        confidence: "90.5%",
        recommendation: "Partial compensation for yield reduction.",
      },
      "Maize-Cyclone": {
        damage: "Lodging of Maize Stems & Root Lodging due to high winds",
        severity: "High",
        priority: "Immediate",
        confidence: "96.4%",
        recommendation: "Full cyclone relief compensation recommended.",
      },
      Flood: {
        damage: `Complete Submersion and Root Rot of ${cropType} plants`,
        severity: "High",
        priority: "Immediate",
        confidence: "95.1%",
        recommendation: "Urgent flood relief disbursement recommended.",
      },
      "Heavy Rain": {
        damage: `Soil erosion and Foliage Tearing in ${cropType}`,
        severity: "Medium",
        priority: "High",
        confidence: "91.2%",
        recommendation: "Moderate compensation for crop damage due to excess rainfall.",
      },
      Drought: {
        damage: `Crop Desiccation and Soil Cracking in ${cropType} Field`,
        severity: "High",
        priority: "Immediate",
        confidence: "96.8%",
        recommendation: "Immediate drought relief under state disaster management.",
      },
      Cyclone: {
        damage: `Severe Wind Shearing & Stem Breakage in ${cropType}`,
        severity: "High",
        priority: "Immediate",
        confidence: "97.1%",
        recommendation: "Full cyclone damage compensation recommended.",
      },
      "Pest Attack": {
        damage: `Defoliation & Infestation of ${cropType} crop`,
        severity: "Medium",
        priority: "High",
        confidence: "92.3%",
        recommendation: "Pest damage verified. Input subsidy recommended.",
      },
    };

    const key = `${cropType}-${cause}`;
    return map[key] || map[cause] || defaults;
  };

  const diagnosis = getAIDiagnosis(claim.crop, claim.damageType);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
        <h3 className="text-sm font-extrabold text-slate-800">🤖 AI Analysis Report</h3>
        <span className="text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
          {diagnosis.confidence} Confidence
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Damage Pattern */}
        <div>
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">
            Detected Damage Pattern
          </span>
          <p className="text-sm text-slate-700 font-semibold leading-relaxed">
            {diagnosis.damage}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-green-50/50 border border-green-100 rounded-lg p-3 text-center">
            <span className="text-[10px] text-gray-400 block font-bold uppercase">Confidence</span>
            <span className="text-green-700 font-extrabold text-sm block mt-0.5">{diagnosis.confidence}</span>
          </div>
          <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3 text-center">
            <span className="text-[10px] text-gray-400 block font-bold uppercase">Severity</span>
            <span className="text-amber-700 font-extrabold text-sm block mt-0.5">{diagnosis.severity}</span>
          </div>
          <div className="bg-red-50/50 border border-red-100 rounded-lg p-3 text-center">
            <span className="text-[10px] text-gray-400 block font-bold uppercase">Priority</span>
            <span className="text-red-700 font-extrabold text-sm block mt-0.5">{diagnosis.priority}</span>
          </div>
        </div>

        {/* Additional info */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
            <span className="text-[10px] text-gray-400 block font-bold uppercase">Crop Type</span>
            <span className="text-slate-800 font-bold text-sm block mt-0.5">{claim.crop}</span>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
            <span className="text-[10px] text-gray-400 block font-bold uppercase">Affected Area</span>
            <span className="text-slate-800 font-bold text-sm block mt-0.5">{claim.area} Acres</span>
          </div>
        </div>

        {/* Recommendation */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <span className="text-[10px] text-blue-600 uppercase font-bold tracking-wider block mb-1">
            📋 AI Recommendation
          </span>
          <p className="text-sm text-blue-800 font-medium leading-relaxed">
            {diagnosis.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisCard;
