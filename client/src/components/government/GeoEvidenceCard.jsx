import React from "react";

const VERIFICATION_STYLES = {
  VERIFIED: {
    icon: "🟢",
    label: "Verified",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
  },
  PARTIAL: {
    icon: "🟡",
    label: "Partial Match",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
  },
  DIFFERENT: {
    icon: "🟡",
    label: "Different Location",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
  },
  UNVERIFIED: {
    icon: "⚪",
    label: "Unverified",
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-600",
  },
};

const DataRow = ({ label, value, mono }) => (
  <div className="flex justify-between items-start py-1.5 border-b border-slate-100/80 last:border-0">
    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide flex-shrink-0 mr-2">
      {label}
    </span>
    <span className={`text-xs font-medium text-slate-700 text-right ${mono ? "font-mono" : ""}`}>
      {value || "—"}
    </span>
  </div>
);

const GeoEvidenceCard = ({ geo }) => {
  if (!geo) {
    return (
      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-center">
        <p className="text-sm text-gray-400">No geo evidence attached.</p>
      </div>
    );
  }

  const vs = VERIFICATION_STYLES[geo.verificationStatus] || VERIFICATION_STYLES.UNVERIFIED;

  const formatTime = (isoStr) => {
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

  const osmUrl = geo.latitude && geo.longitude
    ? `https://www.openstreetmap.org/?mlat=${geo.latitude}&mlon=${geo.longitude}#map=16/${geo.latitude}/${geo.longitude}`
    : null;

  // OSM static tile calculation
  const getMapTileUrl = () => {
    if (!geo.latitude || !geo.longitude) return null;
    const zoom = 15;
    const latRad = (geo.latitude * Math.PI) / 180;
    const n = Math.pow(2, zoom);
    const xTile = Math.floor(((geo.longitude + 180) / 360) * n);
    const yTile = Math.floor(
      ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
    );
    return `https://tile.openstreetmap.org/${zoom}/${xTile}/${yTile}.png`;
  };

  const tileUrl = getMapTileUrl();

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
        <h3 className="text-sm font-extrabold text-slate-800">🛡️ Geo Evidence</h3>
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${vs.bg} ${vs.border} ${vs.text}`}>
          {vs.icon} {vs.label}
        </span>
      </div>

      {/* Coordinates */}
      <div className="px-4 py-3 space-y-0.5">
        <DataRow label="Latitude" value={String(geo.latitude)} mono />
        <DataRow label="Longitude" value={String(geo.longitude)} mono />
        <DataRow label="Accuracy" value={geo.accuracy != null ? `±${geo.accuracy} m` : "N/A"} mono />
        <DataRow label="Altitude" value={geo.altitude != null ? `${geo.altitude} m` : "N/A"} mono />
        <DataRow label="Captured At" value={formatTime(geo.timestamp)} />
      </div>

      {/* Address */}
      {(geo.village || geo.district || geo.state) && (
        <div className="border-t border-slate-100 px-4 py-3 space-y-0.5">
          <DataRow label="Village" value={geo.village} />
          <DataRow label="District" value={geo.district} />
          <DataRow label="State" value={geo.state} />
          <DataRow label="Country" value={geo.country} />
          {geo.address?.fullAddress && (
            <div className="pt-1">
              <p className="text-[10px] text-gray-400 leading-relaxed">
                {geo.address.fullAddress}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Weather */}
      {geo.weather && !geo.weather.error && (
        <div className="border-t border-slate-100 px-4 py-2.5 bg-blue-50/40 flex gap-4 flex-wrap">
          {geo.weather.temperature != null && (
            <span className="text-xs text-blue-700 font-semibold">🌡️ {geo.weather.temperature}°C</span>
          )}
          {geo.weather.humidity != null && (
            <span className="text-xs text-blue-700 font-semibold">💧 {geo.weather.humidity}%</span>
          )}
          {geo.weather.windSpeed != null && (
            <span className="text-xs text-blue-700 font-semibold">💨 {geo.weather.windSpeed} km/h</span>
          )}
          {geo.weather.description && (
            <span className="text-xs text-blue-600">{geo.weather.description}</span>
          )}
        </div>
      )}

      {/* Mini Map */}
      {tileUrl && (
        <div className="border-t border-slate-100">
          <div className="relative h-40 bg-slate-100 overflow-hidden">
            <img
              src={tileUrl}
              alt="Map tile"
              className="absolute inset-0 w-full h-full object-cover"
              crossOrigin="anonymous"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-6 w-6 bg-red-600 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-xs text-white">
                📍
              </div>
            </div>
            <div className="absolute bottom-1 right-1 bg-white/80 rounded px-1 text-[8px] text-gray-500">
              © OpenStreetMap
            </div>
          </div>
          {osmUrl && (
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-right">
              <a
                href={osmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                🗺️ Open Full Map
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GeoEvidenceCard;
