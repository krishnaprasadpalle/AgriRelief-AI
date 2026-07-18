/**
 * LocationBadge.jsx
 * Shows a colored badge for:
 * - VERIFIED (green)
 * - PARTIAL (yellow)
 * - DIFFERENT (yellow/orange)
 * - UNVERIFIED (gray)
 * - Poor GPS accuracy (orange warning)
 */

import React from "react";

const BADGE_CONFIG = {
  VERIFIED: {
    icon: "🟢",
    label: "Verified Location",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
  },
  PARTIAL: {
    icon: "🟡",
    label: "Partial Match",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
  },
  DIFFERENT: {
    icon: "🟡",
    label: "Different Location",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
  },
  UNVERIFIED: {
    icon: "⚪",
    label: "Unverified",
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-600",
  },
  POOR_ACCURACY: {
    icon: "🟠",
    label: "Poor GPS Accuracy",
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-800",
  },
};

const LocationBadge = ({ status, message, accuracyRating }) => {
  const config =
    accuracyRating?.warning
      ? BADGE_CONFIG.POOR_ACCURACY
      : BADGE_CONFIG[status] || BADGE_CONFIG.UNVERIFIED;

  return (
    <div
      className={`flex flex-col gap-1 rounded-xl border px-4 py-3 ${config.bg} ${config.border}`}
    >
      <div className={`flex items-center gap-2 font-bold text-sm ${config.text}`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </div>
      {message && (
        <p className={`text-xs leading-relaxed ${config.text} opacity-80`}>
          {message}
        </p>
      )}
      {accuracyRating?.warning && accuracyRating?.hint && (
        <p className="text-xs text-orange-700 mt-1 font-medium">
          ⚠️ {accuracyRating.hint}
        </p>
      )}
    </div>
  );
};

export default LocationBadge;
