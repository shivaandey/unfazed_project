const express = require('express');
const router = express.Router();
// Destructure protect correctly from authMiddleware
const { protect } = require('../middleware/authMiddleware');
const { setAvailability, getAvailability, getOwnAvailability, bookSession, getTherapistAppointments, completeSession, updateSessionStatus } = require('../controllers/schedulingController');

// Therapist routes (Protected)
router.post('/availability', protect, setAvailability);
router.get('/availability/me', protect, getOwnAvailability);
router.get('/appointments', protect, getTherapistAppointments);
router.patch('/sessions/:id/complete', protect, completeSession);
router.patch('/sessions/:id/status', protect, updateSessionStatus);

// Client routes (Public)
router.get('/availability/:therapistId', getAvailability);
router.post('/book', bookSession);

module.exports = router;