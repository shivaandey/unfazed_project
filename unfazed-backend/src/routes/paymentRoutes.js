const express = require('express');
const router = express.Router();
const { createOrder, verifyPaymentClient } = require('../controllers/paymentController');

router.post('/create-order', createOrder);
router.post('/verify-client', verifyPaymentClient);

module.exports = router;