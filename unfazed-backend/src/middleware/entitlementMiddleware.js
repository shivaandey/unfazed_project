const { canAccess } = require('../services/entitlementService');

const requireEntitlement = (featureKey) => async (req, res, next) => {
  try {
    const therapistId = req.user?.id || req.user?._id;
    const context = { ...req.body, ...req.query, ...req.entitlementContext };
    const requestedFeature = featureKey === 'note-template-type' && context.templateType
      ? `${featureKey}:${context.templateType}`
      : featureKey;
    const allowed = await canAccess(therapistId, requestedFeature, context);

    if (!allowed) {
      return res.status(403).json({
        message: 'Feature access requires a higher plan.',
        featureKey,
        upgradeRequired: true
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ message: 'Entitlement check failed', error: error.message });
  }
};

module.exports = { requireEntitlement };
