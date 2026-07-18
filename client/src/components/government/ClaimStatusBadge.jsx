import React from "react";

const STATUS_STYLES = {
  Submitted: "bg-blue-50 text-blue-700 border-blue-200",
  "AI Reviewing": "bg-amber-50 text-amber-700 border-amber-200",
  "Under AI Review": "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-green-50 text-green-700 border-green-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
  "Field Inspection Required": "bg-orange-50 text-orange-700 border-orange-200",
  "Compensation Released": "bg-purple-50 text-purple-700 border-purple-200",
};

const ClaimStatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${style}`}
    >
      {status}
    </span>
  );
};

export default ClaimStatusBadge;
