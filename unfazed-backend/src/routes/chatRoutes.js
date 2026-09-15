const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMessages, sendChatNotification } = require('../controllers/chatController');

router.get('/:roomId/messages', getMessages);
router.use(protect);
router.post('/notify', sendChatNotification);

module.exports = router;
