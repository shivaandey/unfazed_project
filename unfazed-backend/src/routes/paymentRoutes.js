const express = require('express');
const router = express.Router();
const { createOrder, verifyPaymentClient, downloadInvoice } = require('../controllers/paymentController');

router.post('/create-order', createOrder);
router.post('/verify-client', verifyPaymentClient);
router.get('/:paymentId/invoice', downloadInvoice);

module.exports = router;