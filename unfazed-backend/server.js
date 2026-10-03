const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./src/config/db');
const { allowedOrigins } = require('./src/config/cors');
const app = require('./src/app');
const initChatSocket = require('./src/sockets/chatSocket');
const Session = require('./src/models/Session');
const Therapist = require('./src/models/Therapist');
const { scheduleReminders } = require('./src/services/notificationService');
const { expirePaymentHolds } = require('./src/controllers/schedulingController');

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: allowedOrigins }
});

initChatSocket(io);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    scheduleReminders(Session, Therapist).catch((error) => console.error('Initial reminder worker failed:', error.message));
    expirePaymentHolds().catch((error) => console.error('Initial payment hold cleanup failed:', error.message));
  });

  setInterval(() => {
    scheduleReminders(Session, Therapist).catch((error) => console.error('Reminder worker failed:', error.message));
  }, 15 * 60 * 1000);

  setInterval(() => {
    expirePaymentHolds().catch((error) => console.error('Payment hold cleanup failed:', error.message));
  }, 60 * 1000);
};

startServer().catch((error) => {
  console.error('Server startup failed:', error.message);
  process.exit(1);
});