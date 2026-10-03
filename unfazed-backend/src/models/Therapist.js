const mongoose = require('mongoose');

const therapistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  passwordResetCodeHash: { type: String, select: false },
  passwordResetCodeExpiresAt: { type: Date, select: false },
  passwordResetCodeSentAt: { type: Date, select: false },
  passwordResetCodeAttempts: { type: Number, default: 0, select: false },
  role: { type: String, enum: ['therapist', 'admin'], default: 'therapist' },
  tier: { type: String, enum: ['starter', 'pro'], default: 'pro' },
  subscriptionTier: { type: String, enum: ['starter', 'pro'], default: 'pro' },
  slug: { type: String, required: true, unique: true }, // e.g., unfazed.in/dr-sharma
  bio: { type: String },
  profilePhotoData: { type: Buffer, select: false },
  profilePhotoContentType: { type: String, enum: ['image/jpeg', 'image/png', 'image/webp'], select: false },
  profilePhotoUpdatedAt: { type: Date },
  specializations: [{ type: String }],
  languages: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Therapist', therapistSchema);