/**
 * errorHandler.js
 * ─────────────────────────────────────────────────────
 * Express error-handling middleware.
 *
 * Catches any error thrown/next(err) in the pipeline
 * and returns a consistent JSON envelope.
 *
 * Connections:
 *   → mounted in  index.js  (last middleware)
 */

const errorHandler = (err, _req, res, _next) => {
  console.error("[AgriRelief Error]", err.message || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error.";

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
