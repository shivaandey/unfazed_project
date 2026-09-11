const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { setAvailability, getAvailability, bookSession } = require('../controllers/schedulingController');

// Therapist routes (Protected)
router.post('/availability', authMiddleware, setAvailability);

// Client routes (Public)
router.get('/availability/:therapistId', getAvailability);
router.post('/book', bookSession);

module.exports = router;