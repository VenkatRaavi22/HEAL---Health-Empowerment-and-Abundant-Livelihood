const express = require("express");
const router = express.Router();
const { getRecommendationsByDisease } = require("../controllers/recommendationController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected route to get recommendations by disease name
router.get("/:diseaseName", authMiddleware, getRecommendationsByDisease);

module.exports = router;
