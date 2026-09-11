const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { updateProfile } = require('../controllers/therapistController');

router.put('/profile', authMiddleware, updateProfile);

module.exports = router;