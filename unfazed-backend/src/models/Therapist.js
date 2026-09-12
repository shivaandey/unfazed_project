const mongoose = require('mongoose');

const therapistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['therapist', 'admin'], default: 'therapist' },
  tier: { type: String, enum: ['starter', 'pro'], default: 'pro' },
  subscriptionTier: { type: String, enum: ['starter', 'pro'], default: 'pro' },
  slug: { type: String, required: true, unique: true }, // e.g., unfazed.in/dr-sharma
  bio: { type: String },
  specializations: [{ type: String }],
  languages: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Therapist', therapistSchema);