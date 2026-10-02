const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { listNotifications, markNotificationRead, triggerReminderCheck } = require('../controllers/notificationController');

router.use(protect);
router.get('/', listNotifications);
router.post('/reminders/check', triggerReminderCheck);
router.patch('/:id/read', markNotificationRead);

module.exports = router;
