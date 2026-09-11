const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 }, // 0 = Sunday, 6 = Saturday
  slots: [{
    startTime: { type: String, required: true }, // e.g., "09:00"
    endTime: { type: String, required: true }    // e.g., "17:00"
  }],
  sessionDuration: { type: Number, default: 60 }, // in minutes
  bufferTime: { type: Number, default: 15 } // minutes between sessions
}, { timestamps: true });

module.exports = mongoose.model('Availability', availabilitySchema);