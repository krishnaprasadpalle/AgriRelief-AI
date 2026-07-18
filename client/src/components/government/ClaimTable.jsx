import React from "react";
import ClaimStatusBadge from "./ClaimStatusBadge";

const ClaimTable = ({ claims, farmersMap, onView }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="hidden lg:block bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-gray-100 text-left">
            <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Claim ID
            </th>
            <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Farmer
            </th>
            <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Village
            </th>
            <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Crop
            </th>
            <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Damage
            </th>
            <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Severity
            </th>
            <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {claims.map((claim) => (
            <tr
              key={claim.claimId}
              className="hover:bg-slate-50/60 transition"
            >
              <td className="px-4 py-3 font-mono text-xs font-bold text-slate-800">
                {claim.claimId}
              </td>
              <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                {farmersMap[claim.farmerId] || "Unknown"}
              </td>
              <td className="px-4 py-3 text-xs text-slate-600">
                {claim.geo?.village || "N/A"}
              </td>
              <td className="px-4 py-3 text-xs text-slate-600">{claim.crop}</td>
              <td className="px-4 py-3 text-xs text-slate-600">
                {claim.damageType}
              </td>
              <td className="px-4 py-3 text-xs text-slate-500">
                {formatDate(claim.timestamp)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`text-xs font-bold ${
                    claim.severity === "High" || claim.severity === "Immediate"
                      ? "text-red-600"
                      : claim.severity === "Medium"
                      ? "text-amber-600"
                      : "text-green-600"
                  }`}
                >
                  {claim.severity || "—"}
                </span>
              </td>
              <td className="px-4 py-3">
                <ClaimStatusBadge status={claim.status} />
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onView(claim.claimId)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClaimTable;
