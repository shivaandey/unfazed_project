const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientType: { type: String, enum: ['therapist', 'client'], required: true },
  recipientId: { type: String, required: true, index: true },
  eventType: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  channels: [{ type: String, enum: ['in_app', 'email', 'whatsapp'] }],
  readAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
