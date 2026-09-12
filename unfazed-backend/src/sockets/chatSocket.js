module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('join-room', ({ therapistId, clientId }) => {
      const roomId = [therapistId, clientId].sort().join('-');
      socket.join(roomId);
      socket.emit('joined-room', { roomId });
    });

    socket.on('send-message', ({ roomId, sender, message }) => {
      io.to(roomId).emit('receive-message', { sender, message, time: new Date() });
    });

    socket.on('typing', ({ roomId, sender, isTyping }) => {
      socket.to(roomId).emit('typing-status', { sender, isTyping });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  });
};
