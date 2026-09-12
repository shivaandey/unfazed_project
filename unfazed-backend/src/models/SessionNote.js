const mongoose = require('mongoose');

const sessionNoteSchema = new mongoose.Schema({
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  type: { type: String, enum: ['private', 'shared'], default: 'private' },
  templateType: { type: String, enum: ['soap', 'dap', 'freeform'], default: 'soap' },
  content: { type: String, default: '' },
  soap: {
    subjective: { type: String, default: '' },
    objective: { type: String, default: '' },
    assessment: { type: String, default: '' },
    plan: { type: String, default: '' }
  },
  dap: {
    data: { type: String, default: '' },
    assessment: { type: String, default: '' },
    plan: { type: String, default: '' }
  },
  isLocked: { type: Boolean, default: false },
  lockedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('SessionNote', sessionNoteSchema);