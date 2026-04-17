const express = require("express");
const router = express.Router();
const { createHealthLog } = require("../controllers/logController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected route
router.post("/", authMiddleware, createHealthLog);

module.exports = router;
