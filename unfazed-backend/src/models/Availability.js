const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true, unique: true },
  weeklySchedule: [{
    dayOfWeek: { type: Number, min: 0, max: 6 }, // 0 = Sun, 6 = Sat
    slots: [{ startTime: String, endTime: String }] // e.g., "09:00", "12:00"
  }],
  overrides: [{
    date: { type: String }, // "YYYY-MM-DD"
    slots: [{ startTime: String, endTime: String }],
    isBlocked: { type: Boolean, default: false }
  }],
  sessionDuration: { type: Number, enum: [30, 45, 60, 90], default: 60 },
  bufferTime: { type: Number, default: 15 }
}, { timestamps: true });

module.exports = mongoose.model('Availability', availabilitySchema);