const mongoose = require('mongoose');

const clientPackageSchema = new mongoose.Schema({
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  packageType: { type: String, enum: ['3-Pack', '6-Pack', '12-Pack'], required: true },
  totalSessions: { type: Number, required: true },
  usedSessions: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('ClientPackage', clientPackageSchema);
