const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getClients, getClientById, updateIntake } = require('../controllers/clientController');

// All client CRM routes are protected
router.use(protect);

router.get('/', getClients);
router.get('/:id', getClientById);
router.put('/:id/intake', updateIntake);

module.exports = router;