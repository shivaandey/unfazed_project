const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getClientNotes, saveNote } = require('../controllers/noteController');

router.use(protect);

router.get('/client/:clientId', getClientNotes);
router.post('/', saveNote); // Create new
router.put('/:noteId', saveNote); // Update existing

module.exports = router;