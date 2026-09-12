const { notify } = require('../services/notificationService');

exports.sendChatNotification = async (req, res) => {
  try {
    const { to, message } = req.body;
    await notify({
      to,
      subject: 'New chat message',
      text: message,
      type: 'email',
      eventType: 'chat_message'
    });
    res.status(200).json({ message: 'Chat notification queued' });
  } catch (error) {
    res.status(500).json({ message: 'Notification error', error: error.message });
  }
};
