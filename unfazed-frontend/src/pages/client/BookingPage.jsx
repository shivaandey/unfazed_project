import { useState } from 'react';
import CheckoutButton from '../../components/payments/CheckoutButton';
import ChatWidget from '../../components/chat/ChatWidget';
import axiosInstance from '../../api/axiosInstance';

const packageOptions = {
  Single: 1500,
  '3-Pack': 4200,
  '6-Pack': 7800,
  '12-Pack': 15000,
};

const getBookingSession = (clientId, therapistId) => {
  try {
    const appointment = JSON.parse(sessionStorage.getItem('bookingChatSession') || 'null');
    if (appointment?.clientId === clientId && appointment?.therapistId === therapistId && appointment?.accessToken && appointment?.bookingSessionId) {
      return appointment;
    }

    const accessToken = sessionStorage.getItem('clientChatToken');
    const identity = JSON.parse(sessionStorage.getItem('clientChatIdentity') || 'null');
    if (accessToken
      && String(identity?.client?.id) === String(clientId)
      && String(identity?.therapist?.id) === String(therapistId)) {
      return {
        clientId: identity.client.id,
        clientName: identity.client.name,
        clientEmail: identity.client.email,
        therapistId: identity.therapist.id,
        therapistName: identity.therapist.name,
        accessToken,
      };
    }
  } catch {
    return null;
  }
  return null;
};

export default function BookingPage() {
  const params = new URLSearchParams(window.location.search);
  const clientId = params.get('clientId');
  const therapistId = params.get('therapistId');
  const [bookingSession] = useState(() => getBookingSession(clientId, therapistId));
  const sessionId = params.get('sessionId') || bookingSession?.bookingSessionId;
  const [selectedPackage, setSelectedPackage] = useState('Single');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [successfulPayment, setSuccessfulPayment] = useState(null);
  const [invoiceStatus, setInvoiceStatus] = useState('');
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const amount = packageOptions[selectedPackage];

  const handleSuccess = (payment) => {
    setSuccessfulPayment(payment);
    setPaymentStatus('Payment successful. Your invoice is ready.');
  };

  const downloadInvoice = async () => {
    if (!successfulPayment?._id) return;
    const token = bookingSession?.accessToken || sessionStorage.getItem('clientChatToken');
    if (!token) {
      setInvoiceStatus('Sign in again to download your invoice.');
      return;
    }

    setDownloadingInvoice(true);
    setInvoiceStatus('');
    try {
      const response = await axiosInstance.get(`/payments/${successfulPayment._id}/invoice`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` },
      });
      const downloadUrl = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Unfazed-invoice-${successfulPayment.gateway_transaction_id || successfulPayment._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch {
      setInvoiceStatus('Could not download the invoice. Please sign in again and retry.');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="text-sm font-bold uppercase text-[#F28C28]">{bookingSession?.bookingSessionId ? 'Appointment booked' : 'Client access'}</p>
          <h1 className="mt-2 text-3xl font-bold text-[#0B0B45]">Payment and therapist chat</h1>
          <p className="mt-2 max-w-2xl text-gray-600">{bookingSession?.bookingSessionId ? 'Your appointment is reserved. Complete payment and message your therapist here.' : 'Choose a package for payment and message your therapist here.'}</p>
        </header>

        {!clientId || !therapistId ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            This page needs a valid client and therapist ID. Book a time from the therapist portal first.
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="text-xl font-bold text-[#0B0B45]">Choose a payment package</h2>
              <p className="mt-1 text-sm text-gray-500">Select a package to continue to secure checkout.</p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {Object.entries(packageOptions).map(([label, packageAmount]) => (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={selectedPackage === label}
                    onClick={() => setSelectedPackage(label)}
                    className={`rounded-lg border p-4 text-left transition-colors ${selectedPackage === label ? 'border-[#F28C28] bg-orange-50 text-[#0B0B45]' : 'border-gray-200 text-gray-700 hover:border-[#F28C28]'}`}
                  >
                    <span className="block font-bold">{label}</span>
                    <span className="mt-1 block text-sm text-gray-500">₹{packageAmount}</span>
                  </button>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 text-sm">
                <span className="text-gray-600">Amount due</span>
                <span className="text-lg font-bold text-[#0B0B45]">₹{amount}</span>
              </div>

              <div className="mt-5">
                <CheckoutButton
                  amount={amount}
                  packageType={selectedPackage}
                  clientId={clientId}
                  therapistId={therapistId}
                  sessionId={sessionId}
                  onSuccess={handleSuccess}
                />
              </div>
              {paymentStatus && (
                <div role="status" className="mt-4 rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-800">
                  <p>{paymentStatus}</p>
                  <button type="button" onClick={downloadInvoice} disabled={downloadingInvoice} className="mt-3 rounded-lg border border-green-700 px-4 py-2 font-bold text-green-800 hover:bg-green-100 disabled:opacity-60">
                    {downloadingInvoice ? 'Preparing invoice...' : 'Download invoice PDF'}
                  </button>
                  {invoiceStatus && <p className="mt-2 text-sm font-medium text-red-700">{invoiceStatus}</p>}
                </div>
              )}
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="text-xl font-bold text-[#0B0B45]">Message your therapist</h2>
              {bookingSession ? (
                <>
                  <p className="mt-1 text-sm text-gray-500">This private conversation is connected to your appointment with {bookingSession.therapistName}.</p>
                  <ChatWidget
                    therapistId={bookingSession.therapistId}
                    clientId={bookingSession.clientId}
                    clientEmail={bookingSession.clientEmail}
                    role="client"
                    name={bookingSession.clientName}
                    accessToken={bookingSession.accessToken}
                    bookingSessionId={bookingSession.bookingSessionId}
                  />
                </>
              ) : (
                <p className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">Book a slot from a therapist portal to open its appointment chat here. Existing clients can use the verified client sign-in link.</p>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
