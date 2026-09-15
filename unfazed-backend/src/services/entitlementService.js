const SubscriptionTierConfig = require('../models/SubscriptionTierConfig');
const Therapist = require('../models/Therapist');

const getTierConfig = async (therapistId) => {
  const therapist = await Therapist.findById(therapistId).select('tier subscriptionTier');
  const tierName = (therapist?.tier || therapist?.subscriptionTier || 'starter').toLowerCase();
  const config = await SubscriptionTierConfig.findOne({ tierName });
  if (!config) throw new Error(`Subscription tier configuration missing: ${tierName}`);
  return config;
};

exports.canAccess = async (therapistId, featureKey, context = {}) => {
  const config = await getTierConfig(therapistId);
  const features = config.features || {};
  const [key, requestedTemplate] = featureKey.split(':');

  switch (key) {
    case 'active-client-cap':
      return Number(context.activeClientCount || 0) < Number(features.activeClientCap);
    case 'note-template-type':
      return (features.noteTemplateTypes || []).includes(requestedTemplate || context.templateType || 'soap');
    case 'analytics-depth':
      return features.analyticsDepth === (context.depth || 'advanced');
    case 'chat':
      return features.chatEnabled === true;
    case 'branding':
      return features.customBranding === true;
    default:
      return false;
  }
};

exports.getTierConfig = getTierConfig;
