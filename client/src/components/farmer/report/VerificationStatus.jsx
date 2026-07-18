/**
 * VerificationStatus.jsx
 * Displays a professional summary card of the complete geo verification result.
 * Shows: Verification status, district/village match, weather summary.
 */

import React from "react";

const StatusRow = ({ label, matched, registeredValue, currentValue }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
    <div>
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block">
        {label}
      </span>
      <span className="text-xs text-slate-600">
        Registered:{" "}
        <span className="font-semibold text-slate-800">
          {registeredValue || "N/A"}
        </span>
      </span>
      {currentValue && (
        <span className="text-xs text-slate-500 ml-2">
          → Detected:{" "}
          <span className="font-semibold text-slate-700">{currentValue}</span>
        </span>
      )}
    </div>
    <span
      className={`text-lg ml-3 flex-shrink-0 ${
        matched ? "text-green-600" : "text-amber-500"
      }`}
    >
      {matched ? "✅" : "⚠️"}
    </span>
  </div>
);

const WeatherRow = ({ weather }) => {
  if (!weather || weather.error) return null;

  return (
    <div className="mt-4 border border-blue-100 rounded-xl px-4 py-3 bg-blue-50/40">
      <h4 className="text-xs font-extrabold uppercase text-blue-700 tracking-wider mb-2">
        🌤️ Field Weather
      </h4>
      <div className="grid grid-cols-2 gap-y-1 gap-x-2">
        {weather.temperature !== null && (
          <div className="text-xs">
            <span className="text-gray-400">Temp</span>{" "}
            <span className="font-bold text-slate-700">
              {weather.temperature}°C
            </span>
          </div>
        )}
        {weather.humidity !== null && (
          <div className="text-xs">
            <span className="text-gray-400">Humidity</span>{" "}
            <span className="font-bold text-slate-700">
              {weather.humidity}%
            </span>
          </div>
        )}
        {weather.windSpeed !== null && (
          <div className="text-xs">
            <span className="text-gray-400">Wind</span>{" "}
            <span className="font-bold text-slate-700">
              {weather.windSpeed} km/h
            </span>
          </div>
        )}
        {weather.rainProbability !== null && (
          <div className="text-xs">
            <span className="text-gray-400">Rain %</span>{" "}
            <span className="font-bold text-slate-700">
              {weather.rainProbability}%
            </span>
          </div>
        )}
        {weather.description && (
          <div className="col-span-2 text-xs text-blue-600 font-semibold mt-1">
            {weather.description}
          </div>
        )}
      </div>
    </div>
  );
};

const VerificationStatus = ({
  validation,
  farmer,
  address,
  weather,
}) => {
  if (!validation) return null;

  const headerConfig = {
    VERIFIED: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      icon: "🟢",
      title: "Geo Evidence Verified",
    },
    PARTIAL: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-800",
      icon: "🟡",
      title: "Partial Location Match",
    },
    DIFFERENT: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-800",
      icon: "🟡",
      title: "Different Location",
    },
    UNVERIFIED: {
      bg: "bg-slate-50",
      border: "border-slate-200",
      text: "text-slate-700",
      icon: "⚪",
      title: "Pending Verification",
    },
  };

  const config = headerConfig[validation.status] || headerConfig.UNVERIFIED;

  return (
    <div
      className={`border rounded-xl overflow-hidden shadow-sm ${config.border}`}
    >
      {/* Header */}
      <div
        className={`flex items-center gap-2 px-4 py-3 ${config.bg}`}
      >
        <span className="text-base">{config.icon}</span>
        <div>
          <h3 className={`text-sm font-extrabold ${config.text}`}>
            {config.title}
          </h3>
          <p className={`text-xs ${config.text} opacity-80 mt-0.5`}>
            {validation.message}
          </p>
        </div>
      </div>

      {/* Match Details */}
      <div className="px-4 py-3 bg-white">
        <StatusRow
          label="District"
          matched={validation.districtMatch}
          registeredValue={farmer?.district}
          currentValue={address?.district}
        />
        <StatusRow
          label="Village"
          matched={validation.villageMatch}
          registeredValue={farmer?.village}
          currentValue={address?.village}
        />
      </div>

      {/* Weather */}
      {weather && !weather.error && (
        <div className="px-4 pb-4">
          <WeatherRow weather={weather} />
        </div>
      )}

      {/* Note footer */}
      {validation.status !== "VERIFIED" && (
        <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50/60">
          <p className="text-[10px] text-gray-500 leading-snug">
            ℹ️ Location mismatch does not block submission. Government officers
            will review geo evidence during claim assessment.
          </p>
        </div>
      )}
    </div>
  );
};

export default VerificationStatus;
