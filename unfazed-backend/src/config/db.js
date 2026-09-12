const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/unfazed');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database Error:', error);
    process.exit(1); // Stop the server if the database fails to connect
  }
};

module.exports = connectDB;