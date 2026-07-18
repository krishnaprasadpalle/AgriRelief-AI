import React, { useState } from "react";

const DecisionPanel = ({ claim, onDecision }) => {
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = (action) => {
    if (!remarks.trim()) {
      setError("Officer remarks are mandatory before making a decision.");
      return;
    }
    setError("");
    setIsProcessing(true);

    // Simulate a brief processing delay
    setTimeout(() => {
      let updates = {};

      switch (action) {
        case "Approved":
          updates = {
            status: "Approved",
            approvedAt: new Date().toISOString(),
            approvedBy: "Government Officer",
            remarks: remarks.trim(),
          };
          break;
        case "Rejected":
          updates = {
            status: "Rejected",
            rejectedAt: new Date().toISOString(),
            rejectedBy: "Government Officer",
            remarks: remarks.trim(),
          };
          break;
        case "Field Inspection Required":
          updates = {
            status: "Field Inspection Required",
            inspectionRequestedAt: new Date().toISOString(),
            remarks: remarks.trim(),
          };
          break;
        default:
          break;
      }

      onDecision(claim.claimId, updates);
      setIsProcessing(false);
    }, 800);
  };

  const isFinalized =
    claim.status === "Approved" ||
    claim.status === "Rejected" ||
    claim.status === "Field Inspection Required";

  // If already decided, show the final decision
  if (isFinalized) {
    return (
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
          <h3 className="text-sm font-extrabold text-slate-800">
            ⚖️ Officer Decision
          </h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase">
              Decision:
            </span>
            <span
              className={`text-sm font-extrabold ${
                claim.status === "Approved"
                  ? "text-green-700"
                  : claim.status === "Rejected"
                  ? "text-red-700"
                  : "text-orange-700"
              }`}
            >
              {claim.status === "Approved" && "✅ "}
              {claim.status === "Rejected" && "❌ "}
              {claim.status === "Field Inspection Required" && "🔍 "}
              {claim.status}
            </span>
          </div>
          {claim.remarks && (
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase block mb-1">
                Remarks:
              </span>
              <p className="text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-lg p-3 leading-relaxed">
                {claim.remarks}
              </p>
            </div>
          )}
          {(claim.approvedAt || claim.rejectedAt || claim.inspectionRequestedAt) && (
            <p className="text-[10px] text-gray-400">
              Decision made on{" "}
              {new Date(
                claim.approvedAt || claim.rejectedAt || claim.inspectionRequestedAt
              ).toLocaleString("en-IN")}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Active decision panel
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
        <h3 className="text-sm font-extrabold text-slate-800">
          ⚖️ Officer Decision
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Review evidence above and provide your assessment.
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Remarks */}
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
            Officer Remarks <span className="text-red-500">*</span>
          </label>
          <textarea
            value={remarks}
            onChange={(e) => {
              setRemarks(e.target.value);
              if (error) setError("");
            }}
            rows={4}
            placeholder="Enter your observations, assessment notes, and justification for the decision..."
            className={`w-full border rounded-xl p-3 text-sm outline-none resize-none focus:ring-2 transition ${
              error
                ? "border-red-400 focus:ring-red-300"
                : "border-gray-200 focus:ring-blue-500"
            }`}
          />
          {error && (
            <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handleAction("Approved")}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl py-3 font-bold transition cursor-pointer flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            {isProcessing ? "Processing…" : "✅ Approve"}
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handleAction("Rejected")}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl py-3 font-bold transition cursor-pointer flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            {isProcessing ? "Processing…" : "❌ Reject"}
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handleAction("Field Inspection Required")}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl py-3 font-bold transition cursor-pointer flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            {isProcessing ? "Processing…" : "🔍 Field Inspection"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DecisionPanel;
