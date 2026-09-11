const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
  type: { type: String, enum: ['Video Call', 'Audio Call', 'In-Person'], default: 'Video Call' }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);