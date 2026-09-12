const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireEntitlement } = require('../middleware/entitlementMiddleware');
const { getDashboardAnalytics } = require('../controllers/analyticsController');

router.get('/dashboard', protect, requireEntitlement('analytics-depth'), getDashboardAnalytics);

module.exports = router;
