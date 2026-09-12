const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
  razorpay_order_id: { type: String, required: true },
  gateway_transaction_id: { type: String },
  total_amount: { type: Number, required: true }, // Stored in INR
  platform_fee: { type: Number },
  net_amount: { type: Number },
  packageType: { type: String, enum: ['Single', '3-Pack', '6-Pack', '12-Pack'], default: 'Single' },
  status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
  invoice_url: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);