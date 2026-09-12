import React, { useState } from 'react';
import CheckoutButton from '../../components/payments/CheckoutButton';

export default function BookingPage() {
  const [selectedPackage, setSelectedPackage] = useState('Single');
  const [amount, setAmount] = useState(1500);

  const packageOptions = {
    Single: 1500,
    '3-Pack': 4200,
    '6-Pack': 7800,
    '12-Pack': 15000,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-[#0B0B45] mb-2">Book your therapy session</h1>
        <p className="text-gray-500 mb-8">Choose a package and complete your secure advance payment.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {Object.entries(packageOptions).map(([label, value]) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setSelectedPackage(label);
                setAmount(value);
              }}
              className={`p-4 rounded-xl border text-left transition-colors ${
                selectedPackage === label
                  ? 'border-[#F28C28] bg-orange-50 text-[#0B0B45]'
                  : 'border-gray-200 text-gray-700 hover:border-[#F28C28]'
              }`}
            >
              <div className="font-bold text-lg">{label}</div>
              <div className="text-sm text-gray-500">₹{value}</div>
            </button>
          ))}
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-8">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Selected package</span>
            <span className="font-semibold text-[#0B0B45]">{selectedPackage}</span>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Amount</span>
            <span className="font-semibold text-[#0B0B45]">₹{amount}</span>
          </div>
        </div>

        <CheckoutButton
          amount={amount}
          packageType={selectedPackage}
          clientId="64a000000000000000000001"
          therapistId="64a000000000000000000002"
        />
      </div>
    </div>
  );
}