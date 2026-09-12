import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

export default function CheckoutButton({ amount, packageType, clientId, therapistId }) {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    const res = await loadRazorpayScript();

    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      setLoading(false);
      return;
    }

    try {
      const orderData = await axiosInstance.post('/payments/create-order', {
        amount,
        packageType,
        clientId,
        therapistId
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: 'Unfazed Therapy',
        description: `${packageType} Session Payment`,
        order_id: orderData.data.id,
        handler: async function (response) {
          try {
            const verifyRes = await axiosInstance.post('/payments/verify-client', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            alert('Payment Successful! Invoice generated.');
            console.log(verifyRes.data);
          } catch (err) {
            alert('Payment verification failed.');
          }
        },
        theme: { color: '#0B0B45' }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Could not initiate checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="px-6 py-3 bg-[#0B0B45] text-white font-bold rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50"
    >
      {loading ? 'Processing...' : `Pay ₹${amount}`}
    </button>
  );
}