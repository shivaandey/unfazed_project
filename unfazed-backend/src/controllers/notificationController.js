const Notification = require('../models/Notification');

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
