const express = require('express');
const router = express.Router();
// Destructure protect correctly from authMiddleware
const { protect } = require('../middleware/authMiddleware');
const { setAvailability, getAvailability, bookSession } = require('../controllers/schedulingController');

// Therapist routes (Protected)
router.post('/availability', protect, setAvailability);

// Client routes (Public)
router.get('/availability/:therapistId', getAvailability);
router.post('/book', bookSession);

module.exports = router;