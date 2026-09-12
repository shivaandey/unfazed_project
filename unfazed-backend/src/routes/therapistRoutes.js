const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getTherapistBySlug, updateProfile } = require('../controllers/therapistController');

router.get('/slug/:slug', getTherapistBySlug);
router.put('/profile', protect, updateProfile);

module.exports = router;