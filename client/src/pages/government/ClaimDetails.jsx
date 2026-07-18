import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLoggedInOfficer } from "../../utils/auth";
import ClaimStatusBadge from "../../components/government/ClaimStatusBadge";
import GeoEvidenceCard from "../../components/government/GeoEvidenceCard";
import AIAnalysisCard from "../../components/government/AIAnalysisCard";
import DecisionPanel from "../../components/government/DecisionPanel";

const ClaimDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [officer, setOfficer] = useState(null);
  const [claim, setClaim] = useState(null);
  const [farmer, setFarmer] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null); // For image zoom modal

  // ── Auth Guard & Load Claim Data ──────────────────────────────────────────
  useEffect(() => {
    const activeOfficer = getLoggedInOfficer();
    if (!activeOfficer) {
      navigate("/government/login");
      return;
    }
    setOfficer(activeOfficer);

    // Get claim
    const allClaims = JSON.parse(localStorage.getItem("claims")) || [];
    const foundClaim = allClaims.find((c) => c.claimId === id);
    if (!foundClaim) {
      navigate("/government/dashboard");
      return;
    }
    setClaim(foundClaim);

    // Get farmer details
    const allFarmers = JSON.parse(localStorage.getItem("farmers")) || [];
    const foundFarmer = allFarmers.find((f) => f.id === foundClaim.farmerId);
    setFarmer(foundFarmer);
  }, [id, navigate]);

  // ── Decision Callback ──────────────────────────────────────────────────────
  const handleDecision = (claimId, updates) => {
    const allClaims = JSON.parse(localStorage.getItem("claims")) || [];
    const updatedClaims = allClaims.map((c) => {
      if (c.claimId === claimId) {
        return {
          ...c,
          ...updates,
        };
      }
      return c;
    });

    localStorage.setItem("claims", JSON.stringify(updatedClaims));
    
    // Update local state to reflect changes immediately
    setClaim((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  if (!officer || !claim) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const imagesList = claim.capturedImages || claim.images || [];

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation / Header */}
        <div className="flex items-center justify-between bg-white border border-gray-200/60 rounded-xl px-4 py-3 shadow-sm">
          <button
            onClick={() => navigate("/government/dashboard")}
            className="text-xs font-bold text-slate-600 hover:text-slate-800 flex items-center gap-1 cursor-pointer select-none"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Status:
            </span>
            <ClaimStatusBadge status={claim.status} />
          </div>
        </div>

        {/* Farmer & Claim Info Panel */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="border-b border-gray-100 pb-4 mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Claim Verification File
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5">
                {claim.claimId}
              </h1>
            </div>
            <p className="text-xs text-gray-400">
              Submitted: {formatDate(claim.timestamp)}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400 text-xs block">Farmer Name</span>
              <span className="font-semibold text-slate-700">
                {farmer?.fullName || "Unknown"}
              </span>
            </div>
            <div>
              <span className="text-gray-400 text-xs block">Village</span>
              <span className="font-semibold text-slate-700">
                {claim.geo?.village || farmer?.village || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-gray-400 text-xs block">District</span>
              <span className="font-semibold text-slate-700">
                {claim.geo?.district || farmer?.district || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-gray-400 text-xs block">Crop Affected</span>
              <span className="font-semibold text-slate-700">{claim.crop}</span>
            </div>
            <div>
              <span className="text-gray-400 text-xs block">Damage Cause</span>
              <span className="font-semibold text-slate-700">
                {claim.damageType}
              </span>
            </div>
            <div>
              <span className="text-gray-400 text-xs block">Claimed Area</span>
              <span className="font-semibold text-slate-700">
                {claim.area} Acres
              </span>
            </div>
            <div>
              <span className="text-gray-400 text-xs block">Owner Status</span>
              <span className="font-semibold text-slate-700">
                {farmer?.ownership || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Core Evidence Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Image Evidence & AI Report */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Captured Images */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide mb-4">
                📸 Captured Crop Evidence ({imagesList.length})
              </h3>
              
              {imagesList.length === 0 ? (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 text-center text-gray-400 text-xs">
                  No images captured for this claim.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {imagesList.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className="aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-zoom-in hover:opacity-90 transition group relative"
                    >
                      <img
                        src={img}
                        alt={`Evidence ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold">
                        🔍 Click to Zoom
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Report Card */}
            <AIAnalysisCard claim={claim} />

          </div>

          {/* Right Column: Geo Evidence & Decision Panel */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Geo Evidence Card */}
            <GeoEvidenceCard geo={claim.geo} />

            {/* Decision Panel */}
            <DecisionPanel claim={claim} onDecision={handleDecision} />

          </div>

        </div>

      </div>

      {/* Zoom Image Modal Overlay */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl">
            <img
              src={selectedImage}
              alt="Zoomed Evidence"
              className="object-contain max-h-[80vh] w-full"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 h-10 w-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center font-bold text-lg border border-white/20 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimDetails;
