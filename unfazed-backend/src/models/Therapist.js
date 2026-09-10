const mongoose = require('mongoose');

const therapistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, // e.g., unfazed.in/dr-sharma
  bio: { type: String },
  specializations: [{ type: String }],
  languages: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Therapist', therapistSchema);