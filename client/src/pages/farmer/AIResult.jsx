import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getLoggedInFarmer } from "../../utils/auth";
import { useAnalysis } from "../../context/AnalysisContext";

// ─── Loading Spinner ─────────────────────────────────────────────────────────
const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const AIResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [farmer, setFarmer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportData = location.state;

  // Context-provided AI analysis (using the useGeminiAnalysis hook)
  const { result: analysis, loading, error, loadingStep, analyze, retry } =
    useAnalysis();

  // ── Auth & Redirect guard ──────────────────────────────────────────────
  useEffect(() => {
    const activeFarmer = getLoggedInFarmer();
    if (!activeFarmer) {
      navigate("/farmer/login");
      return;
    }
    setFarmer(activeFarmer);
    if (!reportData) {
      navigate("/farmer/dashboard");
    }
  }, [navigate, reportData]);

  // ── Trigger backend analysis on mount ──────────────────────────────────
  useEffect(() => {
    if (!reportData || analysis) return;

    // Build payload using first image (primary evidence) and other metadata
    const payload = {
      image: reportData.images[0], // Base64 data URL
      crop: reportData.crop,
      damageType: reportData.damageType,
      area: parseFloat(reportData.area),
      gps: reportData.gps || null,
      weather: reportData.gps?.weather || null,
    };

    analyze(payload);
  }, [reportData, analysis, analyze]);

  // ── Early returns ──────────────────────────────────────────────────────
  if (!farmer || !reportData) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <span className="text-gray-500 font-medium">Redirecting...</span>
      </div>
    );
  }

  const { crop, damageType, area, images, gps } = reportData;

  // ── Loading state ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white rounded-2xl shadow-lg p-8 text-center space-y-6">
          {/* Animated ring */}
          <div className="relative mx-auto h-24 w-24">
            <div className="absolute inset-0 rounded-full border-4 border-green-100" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-3xl animate-bounce">
              🤖
            </div>
          </div>

          {/* Step text */}
          <div>
            <p className="text-lg font-extrabold text-slate-800">AI Damage Assessment</p>
            <p className="text-sm text-green-600 font-semibold mt-2 min-h-[20px]">
              {loadingStep || "Uploading Image..."}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full animate-pulse transition-all duration-300"
              style={{ width: "80%" }}
            />
          </div>

          <p className="text-xs text-gray-400">
            Sending field photo and GPS location to Google Gemini API...
          </p>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white rounded-2xl shadow-lg p-8 text-center space-y-5">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-lg font-bold text-slate-800">Analysis Failed</h2>
          <p className="text-sm text-red-600 font-medium leading-relaxed">{error}</p>
          <div className="space-y-2.5">
            <button
              onClick={() =>
                retry({
                  image: images[0],
                  crop,
                  damageType,
                  area: parseFloat(area),
                  gps: gps || null,
                  weather: gps?.weather || null,
                })
              }
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 font-bold cursor-pointer transition shadow-md"
            >
              🔄 Retry Analysis
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl py-2.5 font-bold cursor-pointer transition text-sm"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── No result yet (shouldn't normally happen) ──────────────────────────
  if (!analysis) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <span className="text-gray-500 font-medium">Preparing analysis...</span>
      </div>
    );
  }

  // ── Backend-flagged validation / analysis fields ────────────────────────
  const {
    isAgricultureField,
    cropDetected,
    cropType,
    damageDetected,
    damageType: aiDamageType,
    affectedPercentage,
    severity,
    confidence,
    recommendation,
    reason,
    indicators,
    sdrfEligibility,
  } = analysis;

  const isInvalidEvidence = isAgricultureField === false;
  const isCropMissing = cropDetected === false;
  const isLowConfidence = confidence < 70;
  const isHealthyCrop = aiDamageType === "Healthy Crop" || damageDetected === false;

  // ── Submit claim to localStorage ───────────────────────────────────────
  const handleSubmitClaim = () => {
    if (isInvalidEvidence) return; // Blocked

    setIsSubmitting(true);

    setTimeout(() => {
      try {
        const existingClaims = JSON.parse(localStorage.getItem("claims")) || [];

        const newClaim = {
          claimId: "CLM-" + Math.floor(100000 + Math.random() * 900000),
          farmerId: farmer.id,
          crop: cropType || crop,
          damageType: aiDamageType || damageType,
          area,
          capturedImages: images,
          geo: {
            latitude: gps?.latitude,
            longitude: gps?.longitude,
            accuracy: gps?.accuracy ?? null,
            altitude: gps?.altitude ?? null,
            timestamp: gps?.timestamp,
            address: gps?.address ?? null,
            village: gps?.village ?? "",
            district: gps?.district ?? "",
            state: gps?.state ?? "",
            country: gps?.country ?? "",
            weather: gps?.weather ?? null,
            verificationStatus: gps?.verificationStatus ?? "UNVERIFIED",
          },
          aiAnalysis: {
            isAgricultureField,
            cropDetected,
            cropType,
            damageDetected,
            damageType: aiDamageType,
            affectedPercentage,
            severity,
            confidence,
            recommendation,
            reason,
            indicators: indicators || null,
            sdrfEligibility: sdrfEligibility || "NOT_ELIGIBLE",
          },
          timestamp: new Date().toISOString(),
          severity: severity || "Medium",
          status: "Submitted",
        };

        existingClaims.push(newClaim);
        localStorage.setItem("claims", JSON.stringify(existingClaims));

        setIsSubmitting(false);
        navigate("/farmer/dashboard");
      } catch (err) {
        console.error("Error saving claim:", err);
        setIsSubmitting(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        
        {/* Title */}
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h1 className="text-2xl font-extrabold text-green-700 flex items-center gap-2">
            🤖 AI Analysis Result
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Review the automated crop damage inspection generated by Gemini Vision.
          </p>
        </div>

        {/* Invalid Evidence Screen Block */}
        {isInvalidEvidence && (
          <div className="mb-6 p-5 border-2 border-dashed border-red-200 bg-red-50 rounded-2xl text-center space-y-3">
            <span className="text-4xl block">❌</span>
            <h3 className="text-lg font-bold text-red-800">Invalid Evidence</h3>
            <p className="text-sm text-red-700 leading-relaxed">
              This image does not contain an agricultural field. Please capture a crop image.
            </p>
            {reason && (
              <p className="text-xs text-red-600 bg-white/60 rounded-lg p-2 font-mono">
                {reason}
              </p>
            )}
          </div>
        )}

        {/* Warning cards for cropDetected, low confidence, and healthy crop */}
        {!isInvalidEvidence && (
          <div className="space-y-3 mb-6">
            {isCropMissing && (
              <div className="p-4 border border-amber-200 bg-amber-50 text-amber-800 rounded-xl flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">Crop not detected</h4>
                  <p className="text-xs mt-0.5 opacity-90">Please capture a clearer image of your field.</p>
                </div>
              </div>
            )}

            {isLowConfidence && (
              <div className="p-4 border border-amber-200 bg-amber-50 text-amber-800 rounded-xl flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">Low AI confidence ({confidence}%)</h4>
                  <p className="text-xs mt-0.5 opacity-90">Please capture another image for accurate diagnostic results.</p>
                </div>
              </div>
            )}

            {isHealthyCrop && (
              <div className="p-4 border border-blue-200 bg-blue-50 text-blue-800 rounded-xl flex items-start gap-3">
                <span className="text-xl">ℹ️</span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">Healthy Crop</h4>
                  <p className="text-xs mt-0.5 opacity-90">No visible damage detected. Claim submission not recommended.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Evidence Images */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-800 mb-3">
            Captured Photo Evidence
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="h-24 w-24 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0 shadow-sm"
              >
                <img
                  src={img}
                  alt={`Evidence ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Geo Evidence Card (OSM summary) */}
        {gps && (
          <div className="mb-6 border border-slate-100 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                🛡️ Geo Evidence
              </span>
              {gps.verificationStatus && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    gps.verificationStatus === "VERIFIED"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {gps.verificationStatus === "VERIFIED"
                    ? "🟢 Verified"
                    : "🟡 Different Location"}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2.5 px-4 py-3 text-sm font-medium">
              <div>
                <span className="text-gray-400 text-[10px] block uppercase font-bold tracking-wider">Latitude</span>
                <span className="text-slate-800 font-mono text-xs">{gps.latitude}</span>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block uppercase font-bold tracking-wider">Longitude</span>
                <span className="text-slate-800 font-mono text-xs">{gps.longitude}</span>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block uppercase font-bold tracking-wider">GPS Accuracy</span>
                <span className="text-slate-800 text-xs">±{gps.accuracy || "N/A"} m</span>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block uppercase font-bold tracking-wider">Altitude</span>
                <span className="text-slate-800 text-xs">{gps.altitude || "N/A"} m</span>
              </div>
              {gps.village && (
                <div>
                  <span className="text-gray-400 text-[10px] block uppercase font-bold tracking-wider">Village</span>
                  <span className="text-slate-800 text-xs">{gps.village}</span>
                </div>
              )}
              {gps.district && (
                <div>
                  <span className="text-gray-400 text-[10px] block uppercase font-bold tracking-wider">District</span>
                  <span className="text-slate-800 text-xs">{gps.district}</span>
                </div>
              )}
              <div className="col-span-2 border-t border-slate-100 pt-2 mt-1">
                <span className="text-gray-400 text-[10px] block uppercase font-bold tracking-wider">Captured At</span>
                <span className="text-slate-600 text-xs font-normal">
                  {new Date(gps.timestamp).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* AI Diagnostics details */}
        {!isInvalidEvidence && (
          <div className="mb-8 space-y-4">
            <div className="border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400 text-[10px] block uppercase font-bold tracking-wider">Crop Detected</span>
                  <span className="font-extrabold text-slate-800 text-base">{cropType}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block uppercase font-bold tracking-wider">Claimed Area</span>
                  <span className="font-extrabold text-slate-800 text-base">{area} Acres</span>
                </div>
              </div>

              <hr className="border-gray-100" />

              <div>
                <span className="text-gray-400 text-[10px] block uppercase font-bold tracking-wider mb-1">
                  Damage Cause Detected
                </span>
                <p className="font-bold text-slate-700 text-sm">
                  {aiDamageType}
                </p>
              </div>

              {affectedPercentage != null && (
                <>
                  <hr className="border-gray-100" />
                  <div>
                    <span className="text-gray-400 text-[10px] block uppercase font-bold tracking-wider mb-1">
                      Damage Coverage
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-red-500 transition-all duration-500"
                          style={{ width: `${affectedPercentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-extrabold text-slate-800">
                        {affectedPercentage}%
                      </span>
                    </div>
                  </div>
                </>
              )}

              <hr className="border-gray-100" />

              {/* Metrics grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-green-50/50 border border-green-100 rounded-xl p-3 text-center">
                  <span className="text-gray-400 text-[9px] block font-bold uppercase">Confidence</span>
                  <span className="text-green-700 font-extrabold text-sm block mt-0.5">{confidence}%</span>
                </div>
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 text-center">
                  <span className="text-gray-400 text-[9px] block font-bold uppercase">Severity</span>
                  <span className="text-amber-700 font-extrabold text-sm block mt-0.5">{severity}</span>
                </div>
                <div className="bg-red-50/50 border border-red-100 rounded-xl p-3 text-center">
                  <span className="text-gray-400 text-[9px] block font-bold uppercase">Priority</span>
                  <span className="text-red-700 font-extrabold text-sm block mt-0.5">
                    {severity === "Critical" || severity === "High" ? "Immediate" : "Standard"}
                  </span>
                </div>
              </div>

              {recommendation && (
                <>
                  <hr className="border-gray-100" />
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <span className="text-[10px] text-blue-600 uppercase font-bold tracking-wider block mb-1">
                      📋 Relief Recommendation
                    </span>
                    <p className="text-sm text-blue-800 font-medium leading-relaxed">
                      {recommendation}
                    </p>
                  </div>
                </>
              )}

            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleSubmitClaim}
            disabled={isSubmitting || isInvalidEvidence}
            className={`w-full text-white rounded-xl py-4 font-bold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-lg select-none
              ${
                isInvalidEvidence
                  ? "bg-slate-300 border-slate-400 cursor-not-allowed shadow-none hover:shadow-none"
                  : "bg-green-600 hover:bg-green-700 cursor-pointer active:scale-95"
              }`}
          >
            {isSubmitting ? (
              <>
                <Spinner />
                Submitting Claim...
              </>
            ) : (
              "Submit Claim"
            )}
          </button>

          <button
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
            className="w-full bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl py-3.5 font-bold transition text-center cursor-pointer text-sm"
          >
            Go Back & Recapture
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIResult;