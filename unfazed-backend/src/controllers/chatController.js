const { notify } = require('../services/notificationService');
const ChatMessage = require('../models/ChatMessage');

exports.getMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.find({ roomId: req.params.roomId }).sort({ createdAt: 1 }).limit(200);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Could not load chat history', error: error.message });
  }
};

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
