const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
  name: { type: String, required: true },
  email: { type: String },
  source: { type: String, default: 'web' },
  status: { type: String, enum: ['new', 'contacted', 'converted'], default: 'new' },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
