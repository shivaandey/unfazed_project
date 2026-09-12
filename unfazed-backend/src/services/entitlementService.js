const SubscriptionTierConfig = require('../models/SubscriptionTierConfig');
const Therapist = require('../models/Therapist');

const defaultConfigs = {
  starter: {
    activeClientCap: 25,
    analyticsDepth: 'basic',
    noteTemplateTypes: ['soap'],
    chatEnabled: true,
    customBranding: false
  },
  pro: {
    activeClientCap: 100,
    analyticsDepth: 'advanced',
    noteTemplateTypes: ['soap', 'dap', 'freeform'],
    chatEnabled: true,
    customBranding: true
  }
};

exports.getTierConfig = async (therapistId, tierName = 'pro') => {
  if (therapistId) {
    const therapist = await Therapist.findById(therapistId).select('tier subscriptionTier');
    const resolvedTier = (therapist?.tier || therapist?.subscriptionTier || tierName || 'pro').toLowerCase();
    const config = await SubscriptionTierConfig.findOne({ tierName: resolvedTier });
    if (config) {
      return config.features;
    }
    return defaultConfigs[resolvedTier] || defaultConfigs.pro;
  }

  const resolvedTier = (tierName || 'pro').toLowerCase();
  const config = await SubscriptionTierConfig.findOne({ tierName: resolvedTier });
  if (config) {
    return config.features;
  }

  return defaultConfigs[resolvedTier] || defaultConfigs.pro;
};

exports.canAccess = async (therapistId, featureKey, tierName = 'pro') => {
  const features = await exports.getTierConfig(therapistId, tierName);

  switch (featureKey) {
    case 'active-client-cap':
      return Number(features.activeClientCap || 25) > 0;
    case 'analytics-depth':
      return (features.analyticsDepth || 'basic') === 'advanced';
    case 'note-template-type':
      return (features.noteTemplateTypes || ['soap']).includes('dap') || (features.noteTemplateTypes || ['soap']).includes('soap') || (features.noteTemplateTypes || ['soap']).includes('freeform');
    case 'chat':
      return features.chatEnabled !== false;
    case 'branding':
      return Boolean(features.customBranding);
    default:
      return true;
  }
};
