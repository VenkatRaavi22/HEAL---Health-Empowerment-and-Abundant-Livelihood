const express = require('express');
const router = express.Router();
const { getSpecialists } = require('../controllers/specialistController');

// GET /api/specialists?city=<city>
router.get('/', getSpecialists);

module.exports = router;
