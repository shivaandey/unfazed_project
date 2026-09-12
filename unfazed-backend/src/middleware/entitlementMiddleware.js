const { canAccess } = require('../services/entitlementService');

const requireEntitlement = (featureKey) => async (req, res, next) => {
  try {
    const therapistId = req.user?.id || req.user?._id;
    const tier = req.user?.tier || req.user?.subscriptionTier || 'pro';
    const allowed = await canAccess(therapistId, featureKey, tier);

    if (!allowed) {
      return res.status(403).json({
        message: 'Feature access requires a higher plan.',
        featureKey,
        upgradeRequired: true,
        currentTier: tier
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ message: 'Entitlement check failed', error: error.message });
  }
};

module.exports = { requireEntitlement };
