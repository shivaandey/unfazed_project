const Notification = require('../models/Notification');
const Session = require('../models/Session');
const Therapist = require('../models/Therapist');
const { scheduleReminders } = require('../services/notificationService');

exports.listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientType: 'therapist',
      recipientId: req.user.id
    }).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Could not load notifications', error: error.message });
  }
};

exports.triggerReminderCheck = async (req, res) => {
  try {
    const sentCount = await scheduleReminders(Session, Therapist);
    res.status(200).json({
      message: 'Reminder check completed.',
      sentCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Could not process reminders', error: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientType: 'therapist', recipientId: req.user.id },
      { readAt: new Date() },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Could not update notification', error: error.message });
  }
};
