const express = require('express');
const router = express.Router();
const { handleMessage } = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/chatbot/message
router.post('/message', authMiddleware, handleMessage);

module.exports = router;
