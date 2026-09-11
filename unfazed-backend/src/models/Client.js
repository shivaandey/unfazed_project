const mongoose = require('mongoose');

const intakeSchema = new mongoose.Schema({
  demographics: {
    age: Number,
    gender: String,
    occupation: String
  },
  presentingConcern: String,
  medicalHistory: String,
  consentGiven: { type: Boolean, default: false },
  consentTimestamp: Date
});

const clientSchema = new mongoose.Schema({
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  status: { type: String, enum: ['Active', 'Inactive', 'Discharged'], default: 'Active' },
  tags: [{ type: String }],
  intake: intakeSchema
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);