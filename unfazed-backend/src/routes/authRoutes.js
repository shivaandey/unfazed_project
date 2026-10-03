const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const clientAuthController = require('../controllers/clientAuthController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/client/request-code', clientAuthController.requestClientCode);
router.post('/client/verify-code', clientAuthController.verifyClientCode);
router.post('/password-reset/request-code', authController.requestPasswordReset);
router.post('/password-reset/confirm', authController.confirmPasswordReset);
router.get('/me', protect, authController.getMe);

module.exports = router;