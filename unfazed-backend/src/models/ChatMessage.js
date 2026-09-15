const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  roomId: { type: String, required: true, index: true },
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
  clientId: { type: String, required: true },
  senderRole: { type: String, enum: ['therapist', 'client'], required: true },
  senderName: { type: String, required: true },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  readAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
