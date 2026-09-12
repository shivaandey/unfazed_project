const mongoose = require('mongoose');

const subscriptionTierConfigSchema = new mongoose.Schema({
  tierName: { type: String, required: true, unique: true },
  features: {
    activeClientCap: { type: Number, default: 25 },
    analyticsDepth: { type: String, enum: ['basic', 'advanced'], default: 'basic' },
    noteTemplateTypes: { type: [String], default: ['soap'] },
    chatEnabled: { type: Boolean, default: true },
    customBranding: { type: Boolean, default: false }
  },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('SubscriptionTierConfig', subscriptionTierConfigSchema);
