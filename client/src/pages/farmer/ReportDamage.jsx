import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getLoggedInFarmer } from "../../utils/auth";
import GeoVerification from "../../components/farmer/report/GeoVerification";

// ─── Image Preview Card ────────────────────────────────────────────────────────
const ImageCard = ({ image, index, onRemove }) => {
  const formatTime = (isoStr) =>
    new Date(isoStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Image */}
      <div className="relative aspect-square">
        <img
          src={image.base64}
          alt={`Evidence ${index + 1}`}
          className="h-full w-full object-cover"
        />
        {/* Index badge */}
        <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
          #{index + 1}
        </span>
        {/* Remove button */}
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full h-6 w-6 flex items-center justify-center shadow-md cursor-pointer transition"
          title="Remove image"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      {/* Capture Time */}
      <div className="px-2 py-1.5 bg-slate-50 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 font-medium text-center">
          📍 {formatTime(image.capturedAt)}
        </p>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const ReportDamage = () => {
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState(null);

  // Form fields
  const [crop, setCrop] = useState("");
  const [damageType, setDamageType] = useState("");
  const [area, setArea] = useState("");

  // Images stored as { base64, capturedAt } objects
  const [images, setImages] = useState([]);

  // Camera availability & permission state
  const [cameraAvailable, setCameraAvailable] = useState(true);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);

  // Geo evidence payload
  const [geoPayload, setGeoPayload] = useState(null);

  // Validation errors
  const [errors, setErrors] = useState({});

  // Hidden file input ref — triggered programmatically
  const cameraInputRef = useRef(null);

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const activeFarmer = getLoggedInFarmer();
    if (!activeFarmer) {
      navigate("/farmer/login");
      return;
    }
    setFarmer(activeFarmer);
  }, [navigate]);

  // ── Camera availability detection ──────────────────────────────────────────
  useEffect(() => {
    if (
      typeof navigator === "undefined" ||
      (!navigator.mediaDevices && !window.MediaRecorder)
    ) {
      // Very old browser — camera API completely absent
      // Still allow the HTML input approach (works on mobile without mediaDevices)
    }
    // We detect availability based on whether the input[capture] even fires.
    // If MediaDevices exists but no camera, we show a warning only after a failed attempt.
  }, []);

  // ── Geo callback ───────────────────────────────────────────────────────────
  const handleGeoReady = useCallback(
    (payload) => {
      setGeoPayload(payload);
      if (errors.gps) setErrors((prev) => ({ ...prev, gps: "" }));
    },
    [errors.gps]
  );

  // ── Programmatically open the camera ───────────────────────────────────────
  const handleCaptureClick = () => {
    if (images.length >= 5) {
      setErrors((prev) => ({
        ...prev,
        images: "Maximum 5 photos allowed. Remove one to capture more.",
      }));
      return;
    }
    // Clear any previous image error
    setErrors((prev) => ({ ...prev, images: "" }));
    // Fire the hidden file input
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  // ── Process captured image ─────────────────────────────────────────────────
  const handleCameraCapture = async (e) => {
    const file = e.target.files?.[0];

    // User cancelled — do nothing
    if (!file) {
      e.target.value = "";
      return;
    }

    // Max limit guard
    if (images.length >= 5) {
      setErrors((prev) => ({
        ...prev,
        images: "Maximum 5 photos allowed.",
      }));
      e.target.value = "";
      return;
    }

    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
      });

      const capturedAt = new Date().toISOString();

      setImages((prev) => [...prev, { base64, capturedAt }]);
      setErrors((prev) => ({ ...prev, images: "" }));
      setCameraPermissionDenied(false);
    } catch (err) {
      console.error("Error processing captured image:", err);
      if (err?.name === "NotAllowedError") {
        setCameraPermissionDenied(true);
      } else {
        setCameraAvailable(false);
      }
    } finally {
      // Always reset the input so the same file can be captured again
      e.target.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setErrors((prev) => ({ ...prev, images: "" }));
  };

  // ── Submit / Analyze ───────────────────────────────────────────────────────
  const handleAnalyze = (e) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = {};

    if (!crop) validationErrors.crop = "Crop type is required.";
    if (!damageType) validationErrors.damageType = "Damage type is required.";
    if (!area) {
      validationErrors.area = "Affected area is required.";
    } else {
      const areaNum = Number(area);
      if (isNaN(areaNum) || areaNum <= 0)
        validationErrors.area = "Area must be a number greater than 0.";
    }
    if (images.length === 0) {
      validationErrors.images =
        "At least one field photo is required. Tap 'Capture Crop Photo'.";
    }
    if (!geoPayload) {
      validationErrors.gps =
        "GPS location is required. Please wait for Geo Verification to complete.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Pass base64 strings (extracted from objects) to AIResult
    navigate("/farmer/result", {
      state: {
        crop,
        damageType,
        area,
        images: images.map((img) => img.base64),
        gps: geoPayload,
      },
    });
  };

  if (!farmer) return null;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6">

        {/* Title */}
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h1 className="text-2xl font-extrabold text-green-700 flex items-center gap-2">
            🌾 Report Crop Damage
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Capture live field photos and geo-verify your location as evidence for AI analysis.
          </p>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-6">

          {/* SECTION 1: Crop Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Primary Crop Type <span className="text-red-500">*</span>
            </label>
            <select
              value={crop}
              onChange={(e) => {
                setCrop(e.target.value);
                if (errors.crop) setErrors((prev) => ({ ...prev, crop: "" }));
              }}
              className={`w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-600 transition ${
                errors.crop ? "border-red-500" : "border-gray-200"
              }`}
            >
              <option value="">Select affected crop</option>
              <option value="Paddy">Paddy</option>
              <option value="Cotton">Cotton</option>
              <option value="Maize">Maize</option>
              <option value="Groundnut">Groundnut</option>
              <option value="Chilli">Chilli</option>
              <option value="Sugarcane">Sugarcane</option>
            </select>
            {errors.crop && (
              <p className="text-red-500 text-xs mt-1 font-medium">{errors.crop}</p>
            )}
          </div>

          {/* SECTION 2: Damage Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Disaster / Damage Cause <span className="text-red-500">*</span>
            </label>
            <select
              value={damageType}
              onChange={(e) => {
                setDamageType(e.target.value);
                if (errors.damageType)
                  setErrors((prev) => ({ ...prev, damageType: "" }));
              }}
              className={`w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-600 transition ${
                errors.damageType ? "border-red-500" : "border-gray-200"
              }`}
            >
              <option value="">Select disaster category</option>
              <option value="Flood">Flood</option>
              <option value="Heavy Rain">Heavy Rain</option>
              <option value="Drought">Drought</option>
              <option value="Cyclone">Cyclone</option>
              <option value="Pest Attack">Pest Attack</option>
              <option value="Hailstorm">Hailstorm</option>
              <option value="Animal Damage">Animal Damage</option>
              <option value="Other">Other</option>
            </select>
            {errors.damageType && (
              <p className="text-red-500 text-xs mt-1 font-medium">{errors.damageType}</p>
            )}
          </div>

          {/* SECTION 3: Affected Area */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Affected Area (Acres) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              placeholder="e.g. 2.5"
              value={area}
              onChange={(e) => {
                setArea(e.target.value);
                if (errors.area) setErrors((prev) => ({ ...prev, area: "" }));
              }}
              className={`w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-600 transition ${
                errors.area ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.area && (
              <p className="text-red-500 text-xs mt-1 font-medium">{errors.area}</p>
            )}
          </div>

          {/* ── SECTION 4: Camera Capture ────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                📸 Field Photo Evidence{" "}
                <span className="text-red-500">*</span>
              </label>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  images.length >= 5
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {images.length}/5
              </span>
            </div>

            {/* ── Camera unavailable warning ────────────────────────────── */}
            {!cameraAvailable ? (
              <div className="border border-slate-200 bg-slate-50 rounded-xl p-5 text-center">
                <p className="text-2xl mb-2">📷</p>
                <p className="text-sm font-semibold text-slate-700">
                  Camera unavailable on this device.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Please use a mobile device with a camera to capture evidence.
                </p>
              </div>
            ) : cameraPermissionDenied ? (
              /* ── Camera permission denied warning ──────────────────────── */
              <div className="border border-red-200 bg-red-50 rounded-xl p-5 text-center">
                <p className="text-2xl mb-2">🚫</p>
                <p className="text-sm font-bold text-red-700 mb-1">
                  Camera permission is required to capture crop evidence.
                </p>
                <p className="text-xs text-red-500 mb-4">
                  Please enable camera access in your browser settings and try again.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCameraPermissionDenied(false);
                    setTimeout(() => handleCaptureClick(), 100);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl cursor-pointer transition"
                >
                  Retry Camera
                </button>
              </div>
            ) : (
              /* ── Primary capture button ────────────────────────────────── */
              <>
                {/* Hidden camera-only file input */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCameraCapture}
                  className="hidden"
                  aria-hidden="true"
                />

                {/* Visible button — programmatically fires the hidden input */}
                <button
                  type="button"
                  onClick={handleCaptureClick}
                  disabled={images.length >= 5}
                  className={`w-full flex flex-col items-center justify-center gap-2 rounded-xl py-5 px-4 font-bold transition-all duration-200 shadow-sm cursor-pointer select-none
                    ${
                      images.length >= 5
                        ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white shadow-md hover:shadow-lg"
                    }`}
                >
                  <span className="text-2xl">📷</span>
                  <span className="text-base">
                    {images.length >= 5
                      ? "Maximum Photos Captured"
                      : "Capture Crop Photo"}
                  </span>
                  {images.length < 5 && (
                    <span className="text-green-100 text-xs font-normal">
                      Opens rear camera directly · No gallery access
                    </span>
                  )}
                </button>
              </>
            )}

            {/* ── Captured Image Preview Cards ─────────────────────────── */}
            {images.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">
                  Captured Evidence
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {images.map((img, idx) => (
                    <ImageCard
                      key={idx}
                      image={img}
                      index={idx}
                      onRemove={handleRemoveImage}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Validation error */}
            {errors.images && (
              <p className="text-red-500 text-xs mt-2 font-medium">
                {errors.images}
              </p>
            )}
          </div>
          {/* ── END SECTION 4 ─────────────────────────────────────────────── */}

          {/* SECTION 5: Geo Verification */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              📍 Geo Verification Evidence <span className="text-red-500">*</span>
            </label>
            <GeoVerification farmer={farmer} onGeoReady={handleGeoReady} />
            {errors.gps && (
              <p className="text-red-500 text-xs mt-2 font-medium">{errors.gps}</p>
            )}
          </div>

          {/* SECTION 6: Analyze Button */}
          <div className="border-t border-gray-100 pt-6 mt-4">
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-4 font-bold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-lg cursor-pointer"
            >
              Analyze Crop Damage
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ReportDamage;