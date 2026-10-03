import { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

export default function CheckoutButton({ amount, packageType, clientId, therapistId, sessionId, onSuccess }) {
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
    if (!clientId || !therapistId) {
      alert('Payment setup is incomplete. This checkout requires a valid client and therapist ID.');
      return;
    }

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      alert('Razorpay is not configured yet. Add VITE_RAZORPAY_KEY_ID to your frontend environment.');
      return;
    }

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
        therapistId,
        ...(sessionId ? { sessionId } : {}),
      });

      const options = {
        key: razorpayKey,
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
              razorpay_signature: response.razorpay_signature,
            });

            if (onSuccess) {
              onSuccess(verifyRes.data.payment);
            } else {
              alert('Payment successful! Invoice generated.');
            }
          } catch {
            alert('Payment verification failed.');
          }
        },
        theme: { color: '#0B0B45' },
        prefill: {},
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
        console.error('Razorpay payment failed:', response.error);
        alert(`Payment failed: ${response.error.description || 'Try again.'}`);
      });
      paymentObject.open();
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Could not initiate checkout. Please check your payment configuration.');
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