const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireEntitlement } = require('../middleware/entitlementMiddleware');
const { getClientNotes, getPublicSharedNotes, getTherapistNotes, saveNote } = require('../controllers/noteController');

// The controller always filters this public response to shared notes.
router.get('/public/shared/:clientId', getPublicSharedNotes);

router.use(protect);

router.get('/client/:clientId', requireEntitlement('note-template-type'), getTherapistNotes);
router.get('/shared/:clientId', requireEntitlement('note-template-type'), getClientNotes);
router.post('/', requireEntitlement('note-template-type'), saveNote);
router.put('/:noteId', requireEntitlement('note-template-type'), saveNote);

module.exports = router;