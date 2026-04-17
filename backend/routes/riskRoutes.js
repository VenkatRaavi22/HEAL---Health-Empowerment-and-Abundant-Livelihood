const express = require("express");
const router = express.Router();
const { getLatestRisk } = require("../controllers/riskController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected route to get the latest risk analysis
router.get("/latest", authMiddleware, getLatestRisk);

module.exports = router;
