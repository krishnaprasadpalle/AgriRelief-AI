/**
 * useGeoLocation.js
 * Custom hook that watches GPS position continuously using
 * navigator.geolocation.watchPosition for live accuracy updates.
 */

import { useState, useEffect, useRef } from "react";

const DEFAULT_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0,
};

const useGeoLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isWatching, setIsWatching] = useState(false);
  const watchIdRef = useRef(null);

  const startWatching = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setError(null);
    setIsWatching(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { coords, timestamp } = position;
        setLocation({
          latitude: parseFloat(coords.latitude.toFixed(6)),
          longitude: parseFloat(coords.longitude.toFixed(6)),
          accuracy: coords.accuracy ? parseFloat(coords.accuracy.toFixed(1)) : null,
          altitude: coords.altitude ? parseFloat(coords.altitude.toFixed(1)) : null,
          speed: coords.speed ? parseFloat(coords.speed.toFixed(2)) : null,
          heading: coords.heading ? parseFloat(coords.heading.toFixed(1)) : null,
          timestamp: new Date(timestamp).toISOString(),
        });
        setError(null);
      },
      (err) => {
        setIsWatching(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("PERMISSION_DENIED");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("POSITION_UNAVAILABLE");
            break;
          case err.TIMEOUT:
            setError("TIMEOUT");
            break;
          default:
            setError("UNKNOWN");
        }
      },
      DEFAULT_OPTIONS
    );
  };

  const stopWatching = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsWatching(false);
  };

  // Auto-cleanup when unmounted
  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, []);

  return {
    location,
    error,
    isWatching,
    startWatching,
    stopWatching,
  };
};

export default useGeoLocation;
