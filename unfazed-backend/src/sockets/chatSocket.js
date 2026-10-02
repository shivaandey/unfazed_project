const ChatMessage = require('../models/ChatMessage');
const Client = require('../models/Client');

module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('join-room', async ({ therapistId, clientId, clientEmail, role, name }) => {
      const normalizedClientEmail = (clientEmail || '').trim().toLowerCase();
      const roomKey = normalizedClientEmail || String(clientId || 'guest');
      const roomId = [String(therapistId), roomKey].sort().join('-');

      if (role === 'therapist' && therapistId && normalizedClientEmail) {
        const client = await Client.findOne({ therapistId, email: normalizedClientEmail });
        if (!client) {
          socket.emit('room-error', { message: 'This client is not connected to your roster yet.' });
          return;
        }
      }

      socket.data = { therapistId, clientId: String(clientId || roomKey), clientEmail: normalizedClientEmail, role, name: name || role, roomId };
      socket.join(roomId);
      socket.emit('joined-room', { roomId });
      socket.emit('chat-history', await ChatMessage.find({ roomId }).sort({ createdAt: 1 }).limit(200));
    });

    socket.on('send-message', async ({ message }) => {
      const { roomId, therapistId, clientId, role, name } = socket.data;
      if (!roomId || !message?.trim() || !['therapist', 'client'].includes(role)) return;
      const saved = await ChatMessage.create({ roomId, therapistId, clientId, senderRole: role, senderName: name, message: message.trim() });
      io.to(roomId).emit('receive-message', saved);
    });

    socket.on('typing', ({ isTyping }) => {
      socket.to(socket.data.roomId).emit('typing-status', { sender: socket.data.role, isTyping });
    });

    socket.on('mark-read', async () => {
      await ChatMessage.updateMany({ roomId: socket.data.roomId, senderRole: { $ne: socket.data.role }, readAt: null }, { readAt: new Date() });
      io.to(socket.data.roomId).emit('messages-read', { role: socket.data.role });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  });
};
