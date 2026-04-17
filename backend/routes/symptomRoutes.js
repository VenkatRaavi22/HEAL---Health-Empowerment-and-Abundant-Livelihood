const express = require("express");
const router = express.Router();
const { analyzeSymptoms, getSymptoms } = require("../controllers/symptomController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected routes
router.get("/", authMiddleware, getSymptoms);
router.post("/analyze", authMiddleware, analyzeSymptoms);

module.exports = router;
