const Razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Package = require('../models/Package');
const Client = require('../models/Client');
const Therapist = require('../models/Therapist');
const { generateInvoicePDF } = require('../services/invoiceService');
const domainEvents = require('../services/domainEvents');

const packagePricing = {
  Single: { amount: 1500, sessions: 1 },
  '3-Pack': { amount: 4200, sessions: 3 },
  '6-Pack': { amount: 7800, sessions: 6 },
  '12-Pack': { amount: 15000, sessions: 12 },
};

// 1. Create Order at Checkout
exports.createOrder = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: 'Razorpay credentials are not configured' });
    }

    // Initialize Razorpay inside the function so it reads the .env keys correctly
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const { packageType, clientId, therapistId } = req.body;
    const packageDetails = packagePricing[packageType];
    if (!packageDetails || !mongoose.isValidObjectId(clientId) || !mongoose.isValidObjectId(therapistId)) {
      return res.status(400).json({ message: 'A valid package, client, and therapist are required.' });
    }

    const [client, therapist] = await Promise.all([
      Client.findOne({ _id: clientId, therapistId, status: 'Active' }).select('_id'),
      Therapist.findById(therapistId).select('_id'),
    ]);
    if (!client || !therapist) {
      return res.status(404).json({ message: 'Active client or therapist was not found.' });
    }

    const amount = packageDetails.amount;
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };
    
    const order = await razorpay.orders.create(options);
    
    const payment = new Payment({
      clientId, therapistId, packageType,
      razorpay_order_id: order.id,
      total_amount: amount,
      status: 'Pending'
    });
    await payment.save();

    res.status(200).json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Error creating order', error });
  }
};

// 2. Direct Client-Side Verification
exports.verifyPaymentClient = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'Razorpay credentials are not configured.' });
    }
    if (!razorpay_order_id || !razorpay_payment_id || !/^[a-f\d]{64}$/i.test(razorpay_signature || '')) {
      return res.status(400).json({ message: 'Payment verification details are invalid.' });
    }

    const expectedSignature = crypto.createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest();
    const suppliedSignature = Buffer.from(razorpay_signature, 'hex');
    if (!crypto.timingSafeEqual(expectedSignature, suppliedSignature)) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const payment = await Payment.findOne({ razorpay_order_id });
    if (!payment) return res.status(404).json({ message: 'Payment order not found.' });
    if (payment.status === 'Completed') {
      return res.status(200).json({ message: 'Payment successful', payment });
    }

    payment.status = 'Completed';
    payment.gateway_transaction_id = razorpay_payment_id;
    payment.platform_fee = payment.total_amount * 0.10;
    payment.net_amount = payment.total_amount - payment.platform_fee;

    const invoicePath = await generateInvoicePDF(payment);
    payment.invoice_url = invoicePath;
    await payment.save();
    domainEvents.emit('payment.completed', { payment });

    const packageDetails = packagePricing[payment.packageType];
    if (packageDetails.sessions > 1) {
      await Package.create({
        clientId: payment.clientId,
        therapistId: payment.therapistId,
        totalSessions: packageDetails.sessions,
        perSessionRate: payment.total_amount / packageDetails.sessions,
        expiresAt: new Date(new Date().setMonth(new Date().getMonth() + 6))
      });
    }
    return res.status(200).json({ message: 'Payment successful', payment });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Verification error', error: error.message });
  }
};