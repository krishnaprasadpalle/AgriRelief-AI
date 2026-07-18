/**
 * MapPreview.jsx
 * Renders an OpenStreetMap tile image using the free tile server.
 * No API key required.
 * Displays a static map tile centered on the GPS coordinates.
 */

import React from "react";

const MapPreview = ({ latitude, longitude }) => {
  if (!latitude || !longitude) return null;

  // OSM static tile URL builder
  // Uses zoom level 16 (suitable for field-level view)
  const zoom = 16;
  const tileSize = 256;

  // Convert lat/lon to tile numbers
  const latRad = (latitude * Math.PI) / 180;
  const n = Math.pow(2, zoom);
  const xTile = Math.floor(((longitude + 180) / 360) * n);
  const yTile = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
      n
  );

  // Build tile URLs for a 3x3 grid centered on the target tile
  const tiles = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const tx = xTile + dx;
      const ty = yTile + dy;
      tiles.push({
        url: `https://tile.openstreetmap.org/${zoom}/${tx}/${ty}.png`,
        x: (dx + 1) * tileSize,
        y: (dy + 1) * tileSize,
      });
    }
  }

  const osmUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      {/* Map tile container */}
      <div
        className="relative bg-slate-100 overflow-hidden"
        style={{ height: "180px" }}
      >
        {/* Render the 3x3 tile grid, cropped to center tile */}
        <div
          className="absolute"
          style={{
            left: `-${tileSize}px`,
            top: `-${tileSize}px`,
            width: `${tileSize * 3}px`,
            height: `${tileSize * 3}px`,
            imageRendering: "crisp-edges",
          }}
        >
          {tiles.map((tile, idx) => (
            <img
              key={idx}
              src={tile.url}
              alt={`Map tile ${idx}`}
              className="absolute"
              style={{
                left: `${tile.x}px`,
                top: `${tile.y}px`,
                width: `${tileSize}px`,
                height: `${tileSize}px`,
              }}
              crossOrigin="anonymous"
            />
          ))}
        </div>

        {/* GPS pin marker in center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 bg-red-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-base">
              📍
            </div>
            <div className="h-2 w-0.5 bg-red-600 mt-0.5"></div>
          </div>
        </div>

        {/* OSM Attribution */}
        <div className="absolute bottom-1 right-1 bg-white/80 rounded px-1 text-[9px] text-gray-500">
          © OpenStreetMap
        </div>
      </div>

      {/* Coordinate row + Open Map button */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-t border-slate-100">
        <div className="font-mono text-[10px] text-gray-500">
          {latitude.toFixed ? latitude.toFixed(4) : latitude},{" "}
          {longitude.toFixed ? longitude.toFixed(4) : longitude}
        </div>
        <a
          href={osmUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer flex items-center gap-1"
        >
          🗺️ Open Map
        </a>
      </div>
    </div>
  );
};

export default MapPreview;
