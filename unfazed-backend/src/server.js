require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Basic health check
app.get('/api/health', (req, res) => res.status(200).json({ status: 'Unfazed API Running' }));

// Database Connection
app.use('/api/auth', require('./routes/authRoutes'));
// ... existing imports ...

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/schedule', require('./routes/schedulingRoutes')); // Add this line

// ... existing mongoose connection ...
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Atlas Connected Successfully');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('Database connection failed:', err));