const mongoose = require('mongoose');
const SubscriptionTierConfig = require('../models/SubscriptionTierConfig');

const tierDefaults = [
  { tierName: 'starter', features: { activeClientCap: 25, analyticsDepth: 'basic', noteTemplateTypes: ['soap'], chatEnabled: true, customBranding: false }, isDefault: true },
  { tierName: 'pro', features: { activeClientCap: 100, analyticsDepth: 'advanced', noteTemplateTypes: ['soap', 'dap', 'freeform'], chatEnabled: true, customBranding: true }, isDefault: false }
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/unfazed');
    await Promise.all(tierDefaults.map((config) => SubscriptionTierConfig.updateOne(
      { tierName: config.tierName }, { $setOnInsert: config }, { upsert: true }
    )));
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database Error:', error);
    process.exit(1); // Stop the server if the database fails to connect
  }
};

module.exports = connectDB;