/**
 * AnalysisContext.jsx
 * ─────────────────────────────────────────────────────
 * React Context that wraps the useAIAnalysis hook so that
 * any page (AIResult, Dashboard, etc.) can consume the
 * analysis state without prop-drilling.
 *
 * Connections:
 *   → wraps          hooks/useAIAnalysis.js
 *   → provided in    App.jsx  or  main.jsx
 *   → consumed by    pages/farmer/AIResult.jsx  (via useAnalysis)
 */

import React, { createContext, useContext } from "react";
import useGeminiAnalysis from "../hooks/useGeminiAnalysis";

const AnalysisContext = createContext(null);

/**
 * Provider component — wrap around the app or the routes
 * that need access to AI analysis state.
 */
export const AnalysisProvider = ({ children }) => {
  const analysis = useGeminiAnalysis();

  return (
    <AnalysisContext.Provider value={analysis}>
      {children}
    </AnalysisContext.Provider>
  );
};

/**
 * Hook to consume the analysis context.
 *
 * Usage:
 *   const { analyze, result, loading, error } = useAnalysis();
 */
export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error("useAnalysis must be used within an <AnalysisProvider>.");
  }
  return context;
};

export default AnalysisContext;
