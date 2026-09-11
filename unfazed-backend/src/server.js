const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/unfazed')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('Database Error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/therapist', require('./routes/therapistRoutes'));
app.use('/api/schedule', require('./routes/schedulingRoutes'));
app.use('/api/clients', require('./routes/clientRoutes')); // NEW MODULE 3 ROUTE

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));