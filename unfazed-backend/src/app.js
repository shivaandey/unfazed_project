const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes (Now referencing paths relative to the src/ folder)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/therapist', require('./routes/therapistRoutes'));
app.use('/api/schedule', require('./routes/schedulingRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

module.exports = app;