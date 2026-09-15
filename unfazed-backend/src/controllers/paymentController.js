const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Package = require('../models/Package');
const { generateInvoicePDF } = require('../services/invoiceService');
const domainEvents = require('../services/domainEvents');

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

    const { amount, packageType, clientId, therapistId } = req.body;
    
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
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
    
    // Client-side verification uses the Key Secret, NOT the Webhook Secret
    const secret = process.env.RAZORPAY_KEY_SECRET; 

    // Generate our own signature to compare against the one Razorpay sent
    const generated_signature = crypto.createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      const payment = await Payment.findOne({ razorpay_order_id });
      
      if (payment && payment.status !== 'Completed') {
        payment.status = 'Completed';
        payment.gateway_transaction_id = razorpay_payment_id;
        payment.platform_fee = (payment.total_amount * 0.10); 
        payment.net_amount = payment.total_amount - payment.platform_fee;
        
        // Auto-generate PDF Invoice
        const invoicePath = await generateInvoicePDF(payment);
        payment.invoice_url = invoicePath;
        
        await payment.save();
        domainEvents.emit('payment.completed', { payment });
        
        // If it's a package, generate the tracking record
        if (payment.packageType !== 'Single') {
          const sessions = parseInt(payment.packageType.split('-')[0]);
          await Package.create({
            clientId: payment.clientId,
            therapistId: payment.therapistId,
            totalSessions: sessions,
            perSessionRate: payment.total_amount / sessions,
            expiresAt: new Date(new Date().setMonth(new Date().getMonth() + 6))
          });
        }
      }
      return res.status(200).json({ message: 'Payment successful', payment });
    } else {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Verification error', error: error.message });
  }
};