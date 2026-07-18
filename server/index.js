/**
 * index.js  —  AgriRelief AI Backend Entry Point
 * ─────────────────────────────────────────────────────
 * Mounts CORS, JSON parsing, routes, and error handler.
 *
 * Start:
 *   npm run dev      (hot-reload via --watch)
 *   npm start        (production)
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const analysisRoutes = require("./routes/analysisRoutes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────
app.use(cors());

// Increase JSON body limit for base64 images (30 MB)
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

// ─── Health check ─────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "AgriRelief AI Backend is running.",
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ───────────────────────────────────────────────────
app.use("/api", analysisRoutes);

// ─── Error handler (must be last) ─────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  🚀  AgriRelief AI Backend running on http://localhost:${PORT}`);
  console.log(`  📡  POST /api/analyze`);
  console.log(`  💚  GET  /api/health\n`);
});
