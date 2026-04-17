const express = require("express");
const router = express.Router();
const { setupProfile } = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected routes
router.post("/setup", authMiddleware, setupProfile);
router.get("/", authMiddleware, require("../controllers/profileController").getProfile);

module.exports = router;
