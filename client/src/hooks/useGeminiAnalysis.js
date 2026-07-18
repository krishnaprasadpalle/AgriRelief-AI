/**
 * client/src/hooks/useGeminiAnalysis.js
 * ─────────────────────────────────────────────────────
 * Hook to manage the Gemini Vision analysis lifecycle.
 *
 * Responsibilities:
 *   - Cycle through custom loading step texts.
 *   - Call analysisApi.js service to hit the backend.
 *   - Manage loading, result, error, and abort controller states.
 *
 * How it connects to other files:
 *   - Imported by context/AnalysisContext.jsx.
 *   - Invoked inside pages/farmer/AIResult.jsx to handle damage diagnostic logic.
 */

import { useState, useRef, useCallback } from "react";
import { analyzeReport } from "../services/analysisApi";

const LOADING_STEPS = [
  "Uploading Image...",
  "Analyzing Crop...",
  "Identifying Crop...",
  "Detecting Damage...",
  "Estimating Severity...",
  "Preparing Report...",
];

const useGeminiAnalysis = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingStep, setLoadingStep] = useState("");
  
  const abortControllerRef = useRef(null);
  const stepIntervalRef = useRef(null);

  const startLoadingSteps = useCallback(() => {
    let currentStepIndex = 0;
    setLoadingStep(LOADING_STEPS[currentStepIndex]);

    stepIntervalRef.current = setInterval(() => {
      currentStepIndex = (currentStepIndex + 1) % LOADING_STEPS.length;
      setLoadingStep(LOADING_STEPS[currentStepIndex]);
    }, 1500); // 1.5 seconds per step animation
  }, []);

  const stopLoadingSteps = useCallback(() => {
    if (stepIntervalRef.current) {
      clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = null;
    }
    setLoadingStep("");
  }, []);

  const analyze = useCallback(
    async (payload) => {
      // Cancel previous request if any
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setLoading(true);
      setError(null);
      setResult(null);
      startLoadingSteps();

      try {
        const data = await analyzeReport(payload, abortControllerRef.current.signal);
        setResult(data);
        return data;
      } catch (err) {
        if (err.name === "AbortError") {
          return null; // Ignore abort exceptions
        }
        setError(err.message || "Failed to complete AI analysis.");
        return null;
      } finally {
        setLoading(false);
        stopLoadingSteps();
        abortControllerRef.current = null;
      }
    },
    [startLoadingSteps, stopLoadingSteps]
  );

  const retry = useCallback(
    async (payload) => {
      return analyze(payload);
    },
    [analyze]
  );

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    stopLoadingSteps();
  }, [stopLoadingSteps]);

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

export default useGeminiAnalysis;
