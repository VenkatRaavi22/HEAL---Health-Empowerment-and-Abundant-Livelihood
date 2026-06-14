const express = require("express");
const router = express.Router();
const { createHealthLog, getWeeklyLogs } = require("../controllers/logController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected route
router.post("/", authMiddleware, createHealthLog);
router.get("/weekly", authMiddleware, getWeeklyLogs);

module.exports = router;
