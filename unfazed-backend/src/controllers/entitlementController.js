const { canAccess } = require('../services/entitlementService');

exports.checkEntitlement = async (req, res) => {
  try {
    const allowed = await canAccess(req.user.id, req.query.featureKey, req.query.templateType ? { templateType: req.query.templateType } : {});
    res.json({ allowed, featureKey: req.query.featureKey });
  } catch (error) {
    res.status(500).json({ message: 'Entitlement check failed', error: error.message });
  }
};
