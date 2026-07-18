/**
 * GeoVerification.jsx
 * Parent component for the complete Geo Evidence module.
 * Coordinates: GPS watching → reverse geocoding → weather → validation → display.
 *
 * Props:
 *   farmer       - logged-in farmer object (has district, village)
 *   onGeoReady   - callback(geoPayload) called when geo evidence is ready
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import useGeoLocation from "./hooks/useGeoLocation";
import { reverseGeocode } from "./services/reverseGeocode";
import { fetchWeather } from "./services/weatherService";
import { hasMovedSignificantly } from "./utils/distanceCalculator";
import { validateGeoLocation, getAccuracyRating } from "./utils/geoValidation";
import GeoInfoCard from "./GeoInfoCard";
import LocationBadge from "./LocationBadge";
import MapPreview from "./MapPreview";
import VerificationStatus from "./VerificationStatus";

const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-blue-600"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const GeoVerification = ({ farmer, onGeoReady }) => {
  const { location, error, isWatching, startWatching, stopWatching } =
    useGeoLocation();

  const [address, setAddress] = useState(null);
  const [weather, setWeather] = useState(null);
  const [validation, setValidation] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Track last geocoded position to detect 50m movement
  const lastGeocodedPosition = useRef(null);

  // ─── Reverse geocode + weather fetch ──────────────────────────────────────
  const fetchGeoData = useCallback(
    async (loc, force = false) => {
      if (!loc) return;

      // Skip if farmer hasn't moved significantly and not forced
      if (
        !force &&
        lastGeocodedPosition.current &&
        !hasMovedSignificantly(lastGeocodedPosition.current, loc)
      ) {
        return;
      }

      setIsGeocoding(true);
      lastGeocodedPosition.current = loc;

      try {
        const [geoAddress, weatherData] = await Promise.all([
          reverseGeocode(loc.latitude, loc.longitude),
          fetchWeather(loc.latitude, loc.longitude),
        ]);

        setAddress(geoAddress);
        setWeather(weatherData);

        const result = validateGeoLocation(farmer, geoAddress);
        setValidation(result);

        // Notify parent with complete geo payload
        if (onGeoReady) {
          onGeoReady({
            latitude: loc.latitude,
            longitude: loc.longitude,
            accuracy: loc.accuracy,
            altitude: loc.altitude,
            timestamp: loc.timestamp,
            address: geoAddress,
            village: geoAddress.village,
            district: geoAddress.district,
            state: geoAddress.state,
            country: geoAddress.country,
            weather: weatherData,
            verificationStatus: result.status,
          });
        }
      } finally {
        setIsGeocoding(false);
        setIsRefreshing(false);
      }
    },
    [farmer, onGeoReady]
  );

  // ─── Watch GPS updates and trigger geocoding on movement ──────────────────
  useEffect(() => {
    if (location) {
      fetchGeoData(location);
    }
  }, [location, fetchGeoData]);

  // ─── Manual refresh ────────────────────────────────────────────────────────
  const handleRefresh = () => {
    setIsRefreshing(true);
    if (location) {
      fetchGeoData(location, true);
    }
  };

  // ─── Start watching on mount ───────────────────────────────────────────────
  useEffect(() => {
    startWatching();
    return () => stopWatching();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accuracyRating = getAccuracyRating(location?.accuracy);

  // ─── Error state: permission denied ────────────────────────────────────────
  if (error === "PERMISSION_DENIED") {
    return (
      <div className="border border-red-200 bg-red-50 rounded-xl p-5 text-center">
        <p className="text-2xl mb-2">🚫</p>
        <h4 className="font-bold text-red-800 text-sm mb-1">
          Location Permission Required
        </h4>
        <p className="text-xs text-red-600 mb-4">
          Location permission required for Geo Verification. Please enable
          location access in your browser settings.
        </p>
        <button
          type="button"
          onClick={() => {
            startWatching();
          }}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  if (error === "TIMEOUT" || error === "POSITION_UNAVAILABLE") {
    return (
      <div className="border border-amber-200 bg-amber-50 rounded-xl p-5 text-center">
        <p className="text-2xl mb-2">📡</p>
        <h4 className="font-bold text-amber-800 text-sm mb-1">
          GPS Signal Unavailable
        </h4>
        <p className="text-xs text-amber-700 mb-4">
          Move to an open area with clear sky for better GPS signal.
        </p>
        <button
          type="button"
          onClick={startWatching}
          className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (!location) {
    return (
      <div className="border border-blue-100 bg-blue-50/40 rounded-xl p-5 flex flex-col items-center gap-3">
        <Spinner />
        <p className="text-sm font-semibold text-blue-700 text-center">
          Acquiring GPS signal…
        </p>
        <p className="text-xs text-blue-500 text-center">
          Please stand in open sky for best accuracy.
        </p>
      </div>
    );
  }

  // ─── Main card ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Card Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-2">
          🛡️ Geo Verified Evidence
        </h3>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isGeocoding || isRefreshing}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg cursor-pointer disabled:opacity-50 flex items-center gap-1.5 transition"
        >
          {isRefreshing ? <Spinner /> : "🔄"}
          Refresh
        </button>
      </div>

      {/* Location Badge (accuracy warning or verification status) */}
      <LocationBadge
        status={validation?.status || "UNVERIFIED"}
        message={validation?.message}
        accuracyRating={accuracyRating}
      />

      {/* GPS Info Card */}
      <GeoInfoCard location={location} address={isGeocoding ? null : address} />

      {/* Map Preview */}
      <MapPreview latitude={location.latitude} longitude={location.longitude} />

      {/* Verification Status + Weather */}
      {validation && !isGeocoding && (
        <VerificationStatus
          validation={validation}
          farmer={farmer}
          address={address}
          weather={weather}
        />
      )}

      {/* Geocoding progress indicator */}
      {isGeocoding && (
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl">
          <Spinner />
          <span className="text-xs text-slate-500 font-medium">
            Verifying address…
          </span>
        </div>
      )}
    </div>
  );
};

export default GeoVerification;
