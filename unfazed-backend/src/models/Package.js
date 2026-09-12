const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
  totalSessions: { type: Number, required: true },
  usedSessions: { type: Number, default: 0 },
  perSessionRate: { type: Number, required: true },
  expiresAt: { type: Date, required: true }, // Expiry tracking
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);