/**
 * GeoInfoCard.jsx
 * Displays GPS coordinate details in a professional government-style card.
 * Shows: Latitude, Longitude, Accuracy, Altitude, Timestamp, Address breakdown.
 */

import React from "react";
import { getAccuracyRating } from "./utils/geoValidation";

const DataRow = ({ label, value, mono }) => (
  <div className="flex justify-between items-start py-1.5 border-b border-slate-100/80 last:border-0">
    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide flex-shrink-0 mr-2">
      {label}
    </span>
    <span
      className={`text-xs font-medium text-slate-700 text-right ${
        mono ? "font-mono" : ""
      }`}
    >
      {value || "—"}
    </span>
  </div>
);

const GeoInfoCard = ({ location, address }) => {
  if (!location) return null;

  const accuracyRating = getAccuracyRating(location.accuracy);

  const formatTimestamp = (isoStr) => {
    if (!isoStr) return "—";
    return new Date(isoStr).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const accuracyColorClass = {
    green: "text-green-700 bg-green-50 border-green-200",
    blue: "text-blue-700 bg-blue-50 border-blue-200",
    amber: "text-amber-700 bg-amber-50 border-amber-200",
    orange: "text-orange-700 bg-orange-50 border-orange-200",
    gray: "text-gray-700 bg-gray-50 border-gray-200",
  }[accuracyRating.color] || "text-gray-700 bg-gray-50 border-gray-200";

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
      {/* Card Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
        <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">
          📡 GPS Data
        </h3>
        {/* Accuracy badge */}
        <span
          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${accuracyColorClass}`}
        >
          ±{location.accuracy !== null ? `${location.accuracy} m` : "?"} &nbsp;
          {accuracyRating.label}
        </span>
      </div>

      {/* Coordinate Section */}
      <div className="px-4 py-3 space-y-0.5">
        <DataRow label="Latitude" value={String(location.latitude)} mono />
        <DataRow label="Longitude" value={String(location.longitude)} mono />
        <DataRow
          label="Accuracy"
          value={
            location.accuracy !== null ? `±${location.accuracy} m` : "N/A"
          }
          mono
        />
        <DataRow
          label="Altitude"
          value={
            location.altitude !== null ? `${location.altitude} m` : "N/A"
          }
          mono
        />
        <DataRow label="Captured At" value={formatTimestamp(location.timestamp)} />
      </div>

      {/* Address Section (only when available) */}
      {address && !address.error && (
        <>
          <div className="border-t border-slate-100 px-4 py-3 space-y-0.5">
            <DataRow label="Village" value={address.village} />
            <DataRow label="Mandal / Suburb" value={address.mandal} />
            <DataRow label="District" value={address.district} />
            <DataRow label="State" value={address.state} />
            <DataRow label="PIN Code" value={address.postcode} />
            <DataRow label="Country" value={address.country} />
          </div>
          <div className="border-t border-slate-100 px-4 py-2 bg-slate-50/50">
            <p className="text-[10px] text-gray-400 leading-relaxed">
              {address.fullAddress}
            </p>
          </div>
        </>
      )}

      {/* Address fetch failed fallback */}
      {address?.error && (
        <div className="border-t border-slate-100 px-4 py-3 bg-amber-50">
          <p className="text-xs text-amber-700 font-medium">
            ⚠️ Address lookup unavailable. GPS coordinates are still recorded.
          </p>
        </div>
      )}

      {/* Address loading skeleton */}
      {!address && (
        <div className="border-t border-slate-100 px-4 py-3 space-y-2">
          <div className="h-2.5 bg-slate-200 rounded animate-pulse w-3/4"></div>
          <div className="h-2.5 bg-slate-200 rounded animate-pulse w-1/2"></div>
          <div className="h-2.5 bg-slate-200 rounded animate-pulse w-2/3"></div>
        </div>
      )}
    </div>
  );
};

export default GeoInfoCard;
