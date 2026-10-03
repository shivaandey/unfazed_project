const Razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');
const path = require('path');
const Payment = require('../models/Payment');
const Package = require('../models/Package');
const Client = require('../models/Client');
const Therapist = require('../models/Therapist');
const jwt = require('jsonwebtoken');
const Session = require('../models/Session');
const { generateInvoicePDF } = require('../services/invoiceService');
const domainEvents = require('../services/domainEvents');
const { expirePaymentHolds } = require('./schedulingController');

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

    const { packageType, clientId, therapistId, sessionId } = req.body;
    const packageDetails = packagePricing[packageType];
    if (!packageDetails || !mongoose.isValidObjectId(clientId) || !mongoose.isValidObjectId(therapistId)
      || (sessionId && !mongoose.isValidObjectId(sessionId))) {
      return res.status(400).json({ message: 'A valid package, client, and therapist are required.' });
    }
    if (sessionId) await expirePaymentHolds();

    const [client, therapist] = await Promise.all([
      Client.findOne({ _id: clientId, therapistId, status: 'Active' }).select('_id'),
      Therapist.findById(therapistId).select('_id'),
    ]);
    if (!client || !therapist) {
      return res.status(404).json({ message: 'Active client or therapist was not found.' });
    }

    let session = null;
    if (sessionId) {
      session = await Session.findOne({
        _id: sessionId,
        therapistId,
        clientEmail: client.email,
        status: 'Scheduled',
      });
      if (!session) return res.status(404).json({ message: 'Booked appointment was not found.' });
      if (session.paymentStatus === 'Paid') return res.status(409).json({ message: 'This appointment has already been paid.' });
      if (session.paymentStatus === 'Pending' && session.paymentHoldExpiresAt > new Date()) {
        return res.status(409).json({ message: 'Checkout is already in progress for this appointment.' });
      }
    }

    const amount = packageDetails.amount;
    const paymentHoldExpiresAt = session ? new Date(Date.now() + 15 * 60 * 1000) : null;
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      ...(paymentHoldExpiresAt ? { expire_by: Math.floor(paymentHoldExpiresAt.getTime() / 1000) } : {}),
    };
    
    const order = await razorpay.orders.create(options);
    
    const payment = new Payment({
      clientId, therapistId, packageType, sessionId: session?._id || null,
      razorpay_order_id: order.id,
      total_amount: amount,
      status: 'Pending'
    });
    await payment.save();

    if (session) {
      session.paymentStatus = 'Pending';
      session.paymentHoldExpiresAt = paymentHoldExpiresAt;
      await session.save();
    }

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
    if (payment.status === 'Failed') {
      return res.status(409).json({ message: 'This payment order is no longer valid.' });
    }

    let bookedSession = null;
    if (payment.sessionId) {
      bookedSession = await Session.findOne({
        _id: payment.sessionId,
        therapistId: payment.therapistId,
        status: 'Scheduled',
        paymentStatus: 'Pending',
        paymentHoldExpiresAt: { $gt: new Date() },
      });
      if (!bookedSession) {
        await expirePaymentHolds();
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: secret,
        });
        await razorpay.payments.refund(razorpay_payment_id, {
          amount: Math.round(payment.total_amount * 100),
        });
        payment.status = 'Failed';
        await payment.save();
        return res.status(409).json({ message: 'The appointment hold expired. A refund has been requested.' });
      }
    }

    payment.status = 'Completed';
    payment.gateway_transaction_id = razorpay_payment_id;
    payment.platform_fee = payment.total_amount * 0.10;
    payment.net_amount = payment.total_amount - payment.platform_fee;

    const invoicePath = await generateInvoicePDF(payment);
    payment.invoice_url = invoicePath;
    await payment.save();
    if (bookedSession) {
      bookedSession.paymentStatus = 'Paid';
      bookedSession.paymentHoldExpiresAt = null;
      await bookedSession.save();
    }
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

exports.downloadInvoice = async (req, res) => {
  try {
    const authorization = req.headers.authorization || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    if (!token) return res.status(401).json({ message: 'Sign in to download this invoice.' });

    let identity;
    try {
      identity = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: 'Your session expired. Sign in again to download this invoice.' });
    }

    const payment = await Payment.findById(req.params.paymentId);
    if (!payment || payment.status !== 'Completed' || !payment.invoice_url) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }

    let canDownload = false;
    if (identity.role === 'client') {
      canDownload = String(identity.id) === String(payment.clientId)
        && String(identity.therapistId) === String(payment.therapistId);
    } else {
      canDownload = identity.role === 'therapist'
        && String(identity.id) === String(payment.therapistId);
    }
    if (!canDownload) return res.status(403).json({ message: 'You cannot access this invoice.' });

    const fileName = path.basename(payment.invoice_url);
    if (!/^invoice_[\w-]+\.pdf$/.test(fileName)) {
      return res.status(404).json({ message: 'Invoice file not found.' });
    }

    const invoicePath = path.join(__dirname, '../../public/invoices', fileName);
    return res.download(invoicePath, `Unfazed-invoice-${payment.gateway_transaction_id || payment._id}.pdf`, (error) => {
      if (error && !res.headersSent) {
        res.status(error.code === 'ENOENT' ? 404 : 500).json({ message: 'Could not download the invoice.' });
      }
    });
  } catch (error) {
    console.error('Invoice download failed:', error.message);
    return res.status(500).json({ message: 'Could not download the invoice.' });
  }
};