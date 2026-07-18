/**
 * useAIAnalysis.js
 * ─────────────────────────────────────────────────────
 * Custom React hook for managing AI analysis lifecycle.
 *
 * Handles: loading, error, success, retry, cancel.
 *
 * Connections:
 *   → uses          services/analysisApi.js
 *   → consumed by   context/AnalysisContext.jsx
 *   → consumed by   pages/farmer/AIResult.jsx
 */

import { useState, useRef, useCallback } from "react";
import { analyzeReport } from "../services/analysisApi";

// Loading step messages shown during analysis
const LOADING_STEPS = [
  "Analyzing Crop...",
  "Detecting Damage...",
  "Estimating Severity...",
  "Preparing Report...",
];

const useAIAnalysis = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingStep, setLoadingStep] = useState("");

  // Abort controller ref for cancellation
  const abortRef = useRef(null);
  // Interval ref for loading step animation
  const stepIntervalRef = useRef(null);

  /**
   * Start the loading step animation.
   */
  const startLoadingSteps = useCallback(() => {
    let idx = 0;
    setLoadingStep(LOADING_STEPS[0]);

    stepIntervalRef.current = setInterval(() => {
      idx = (idx + 1) % LOADING_STEPS.length;
      setLoadingStep(LOADING_STEPS[idx]);
    }, 1200);
  }, []);

  /**
   * Stop the loading step animation.
   */
  const stopLoadingSteps = useCallback(() => {
    if (stepIntervalRef.current) {
      clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = null;
    }
    setLoadingStep("");
  }, []);

  /**
   * Run AI analysis.
   *
   * @param {object} payload — { images, crop, damageType, geo, weather }
   * @returns {Promise<object|null>} — analysis result or null on error
   */
  const analyze = useCallback(
    async (payload) => {
      // Cancel any in-flight request
      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();

      setLoading(true);
      setError(null);
      setResult(null);
      startLoadingSteps();

      try {
        const data = await analyzeReport(payload, abortRef.current.signal);
        setResult(data);
        return data;
      } catch (err) {
        if (err.name === "AbortError") {
          // Request was intentionally cancelled — don't treat as error
          return null;
        }
        setError(err.message || "Analysis failed.");
        return null;
      } finally {
        setLoading(false);
        stopLoadingSteps();
        abortRef.current = null;
      }
    },
    [startLoadingSteps, stopLoadingSteps]
  );

  /**
   * Retry the last analysis with the same payload.
   */
  const retry = useCallback(
    async (payload) => {
      return analyze(payload);
    },
    [analyze]
  );

  /**
   * Cancel an in-flight analysis request.
   */
  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setLoading(false);
    stopLoadingSteps();
  }, [stopLoadingSteps]);

  /**
   * Clear all state (for navigation away / cleanup).
   */
  const reset = useCallback(() => {
    cancel();
    setResult(null);
    setError(null);
  }, [cancel]);

  return {
    result,
    loading,
    error,
    loadingStep,
    analyze,
    retry,
    cancel,
    reset,
  };
};

export default useAIAnalysis;
