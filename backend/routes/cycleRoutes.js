const express = require("express");
const router = express.Router();
const { getStatus, logPeriod, getForecast } = require("../controllers/cycleController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes protected
router.use(authMiddleware);

router.get("/status", getStatus);
router.post("/log-period", logPeriod);
router.get("/forecast", getForecast);

module.exports = router;
