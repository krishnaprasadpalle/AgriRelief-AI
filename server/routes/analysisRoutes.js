const express = require("express");
const multer = require("multer");
const router = express.Router();

const { analyzeHandler } = require("../controllers/analysisController");

// Use memory storage for Multer to receive files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// POST /api/analyze — receives multipart form data with image file under field 'image'
router.post("/analyze", upload.single("image"), analyzeHandler);

module.exports = router;

