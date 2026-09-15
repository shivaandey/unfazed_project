const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { listNotifications, markNotificationRead } = require('../controllers/notificationController');

router.use(protect);
router.get('/', listNotifications);
router.patch('/:id/read', markNotificationRead);

module.exports = router;
