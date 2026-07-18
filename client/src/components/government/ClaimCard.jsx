import React from "react";
import ClaimStatusBadge from "./ClaimStatusBadge";

const ClaimCard = ({ claim, farmerName, onView }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition duration-200">
      {/* Top row: Claim ID + Status */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">
            Claim ID
          </span>
          <span className="font-mono text-sm font-bold text-slate-800">
            {claim.claimId}
          </span>
        </div>
        <ClaimStatusBadge status={claim.status} />
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-y-2.5 gap-x-3 py-3 border-t border-b border-gray-50 text-sm">
        <div>
          <span className="text-gray-400 text-[10px] block">Farmer</span>
          <span className="font-semibold text-slate-700 text-xs">{farmerName}</span>
        </div>
        <div>
          <span className="text-gray-400 text-[10px] block">Village</span>
          <span className="font-semibold text-slate-700 text-xs">
            {claim.geo?.village || "N/A"}
          </span>
        </div>
        <div>
          <span className="text-gray-400 text-[10px] block">Crop</span>
          <span className="font-semibold text-slate-700 text-xs">{claim.crop}</span>
        </div>
        <div>
          <span className="text-gray-400 text-[10px] block">Damage</span>
          <span className="font-semibold text-slate-700 text-xs">{claim.damageType}</span>
        </div>
        <div>
          <span className="text-gray-400 text-[10px] block">Area</span>
          <span className="font-semibold text-slate-700 text-xs">{claim.area} Acres</span>
        </div>
        <div>
          <span className="text-gray-400 text-[10px] block">Severity</span>
          <span
            className={`font-bold text-xs ${
              claim.severity === "High" || claim.severity === "Immediate"
                ? "text-red-600"
                : claim.severity === "Medium"
                ? "text-amber-600"
                : "text-green-600"
            }`}
          >
            {claim.severity || "N/A"}
          </span>
        </div>
      </div>

      {/* Bottom: Date + Action */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-[10px] text-gray-400 font-medium">
          {formatDate(claim.timestamp)}
        </span>
        <button
          type="button"
          onClick={() => onView(claim.claimId)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg cursor-pointer transition"
        >
          View Claim
        </button>
      </div>
    </div>
  );
};

export default ClaimCard;
