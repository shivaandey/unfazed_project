const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { checkEntitlement } = require('../controllers/entitlementController');

router.get('/check', protect, checkEntitlement);

module.exports = router;
