const ChatMessage = require('../models/ChatMessage');
const Client = require('../models/Client');
const Therapist = require('../models/Therapist');
const Session = require('../models/Session');
const jwt = require('jsonwebtoken');

module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('join-room', async (payload = {}) => {
      try {
        const { therapistId, clientId, role, token, bookingSessionId } = payload;
        if (!therapistId || !token || !['therapist', 'client'].includes(role)) {
          socket.emit('room-error', { message: 'Sign in with a verified account to open chat.' });
          return;
        }

        const identity = jwt.verify(token, process.env.JWT_SECRET);
        let client;
        let therapistName;

        if (role === 'therapist') {
          if (String(identity.id) !== String(therapistId) || identity.role === 'client') {
            socket.emit('room-error', { message: 'This therapist account cannot access the requested chat.' });
            return;
          }
          const therapist = await Therapist.findById(therapistId).select('name');
          if (!therapist) {
            socket.emit('room-error', { message: 'Therapist account was not found.' });
            return;
          }
          client = await Client.findOne({ _id: clientId, therapistId, status: 'Active' });
          therapistName = therapist.name;
        } else {
          if (identity.role !== 'client'
            || String(identity.id) !== String(clientId)
            || String(identity.therapistId) !== String(therapistId)) {
            socket.emit('room-error', { message: 'This client account cannot access the requested chat.' });
            return;
          }
          client = await Client.findOne({
            _id: identity.id,
            therapistId,
            status: 'Active',
          });
          if (identity.bookingSessionId) {
            if (String(identity.bookingSessionId) !== String(bookingSessionId)) {
              socket.emit('room-error', { message: 'This booking chat link is invalid.' });
              return;
            }
          } else if (!client?.clientAccessEnabled) {
            socket.emit('room-error', { message: 'Verify your client email to open the client chat.' });
            return;
          }
        }

        if (!client) {
          socket.emit('room-error', { message: 'This client is not active on the therapist roster.' });
          return;
        }

        const clientEmail = String(client.email || '').trim().toLowerCase();
        let chatRoomKey = clientEmail;
        if (bookingSessionId) {
          const booking = await Session.findOne({
            _id: bookingSessionId,
            therapistId,
            status: { $in: ['Scheduled', 'Completed'] },
          }).select('clientEmail');
          if (!booking || String(booking.clientEmail).trim().toLowerCase() !== clientEmail) {
            socket.emit('room-error', { message: 'This appointment chat is no longer available.' });
            return;
          }
          chatRoomKey = `booking-${bookingSessionId}`;
        } else if (role === 'therapist' && !client.clientAccessEnabled) {
          socket.emit('room-error', { message: 'This client must verify their email before opening account chat.' });
          return;
        }

        const roomId = [String(therapistId), chatRoomKey].sort().join('-');
        if (socket.data.roomId && socket.data.roomId !== roomId) {
          socket.leave(socket.data.roomId);
        }
        socket.data = {
          therapistId: String(therapistId),
          clientId: String(client._id),
          clientEmail,
          role,
          name: role === 'client' ? client.name : therapistName,
          roomId,
        };
        socket.join(roomId);
        socket.emit('joined-room', { roomId });
        socket.emit('chat-history', await ChatMessage.find({ roomId }).sort({ createdAt: 1 }).limit(200));
      } catch {
        socket.emit('room-error', { message: 'Sign in again to access this chat.' });
      }
    });

    socket.on('leave-room', () => {
      if (socket.data.roomId) socket.leave(socket.data.roomId);
      socket.data = {};
    });

    socket.on('send-message', async ({ message }) => {
      const { roomId, therapistId, clientId, role, name } = socket.data;
      if (!roomId || !message?.trim() || !['therapist', 'client'].includes(role)) return;
      const saved = await ChatMessage.create({ roomId, therapistId, clientId, senderRole: role, senderName: name, message: message.trim() });
      io.to(roomId).emit('receive-message', saved);
    });

    socket.on('typing', ({ isTyping }) => {
      if (socket.data.roomId) socket.to(socket.data.roomId).emit('typing-status', { sender: socket.data.role, isTyping });
    });

    socket.on('mark-read', async () => {
      if (!socket.data.roomId) return;
      await ChatMessage.updateMany({ roomId: socket.data.roomId, senderRole: { $ne: socket.data.role }, readAt: null }, { readAt: new Date() });
      io.to(socket.data.roomId).emit('messages-read', { role: socket.data.role });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  });
};
