import React from "react";

const ClaimCard = ({ claim }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case "Submitted":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "AI Reviewing":
      case "Under AI Review":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Approved":
        return "bg-green-50 text-green-700 border-green-200";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";
      case "Compensation Released":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between">
      <div className="flex justify-between items-start gap-2 mb-3">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Claim ID
          </span>
          <h3 className="font-mono text-sm font-bold text-slate-800">
            #{claim.claimId || claim.id}
          </h3>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(
            claim.status
          )}`}
        >
          {claim.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-y-3 gap-x-2 border-t border-b border-gray-50 py-3 my-2 text-sm">
        <div>
          <span className="text-gray-400 text-xs block">Crop</span>
          <span className="font-semibold text-slate-700">{claim.crop}</span>
        </div>
        <div>
          <span className="text-gray-400 text-xs block">Damage Cause</span>
          <span className="font-semibold text-slate-700">{claim.damageType || claim.damageCause || "N/A"}</span>
        </div>
        <div>
          <span className="text-gray-400 text-xs block">Affected Area</span>
          <span className="font-semibold text-slate-700">{claim.area || claim.landArea || "N/A"} Acres</span>
        </div>
        <div>
          <span className="text-gray-400 text-xs block">Severity</span>
          <span
            className={`font-semibold ${
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

      <div className="flex justify-between items-center text-xs text-gray-400 pt-1">
        <span>Date: {formatDate(claim.timestamp || claim.createdAt)}</span>
        {claim.images && claim.images.length > 0 && (
          <span className="flex items-center gap-1">
            📷 {claim.images.length} Image{claim.images.length > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
};

export default ClaimCard;
