const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { sendChatNotification } = require('../controllers/chatController');

router.use(protect);
router.post('/notify', sendChatNotification);

module.exports = router;
