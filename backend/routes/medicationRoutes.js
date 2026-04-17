const express = require("express");
const router = express.Router();
const { getMedications, addMedication, updateMedication, deleteMedication } = require("../controllers/medicationController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes are protected
router.use(authMiddleware);

router.get("/", getMedications);
router.post("/", addMedication);
router.put("/:id", updateMedication);
router.delete("/:id", deleteMedication);

module.exports = router;
