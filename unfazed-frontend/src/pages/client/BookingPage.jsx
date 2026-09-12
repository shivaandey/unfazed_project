import React from 'react';
// Updated import path to match your folder structure
import CheckoutButton from '../../components/payments/CheckoutButton';

export default function BookingPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#F8FAFC]">
      <h1 className="text-2xl font-bold text-[#0B0B45] mb-6">Client Booking Portal</h1>
      
      <CheckoutButton 
        amount={1500} 
        packageType="Single" 
        clientId="65f1a2b3c4d5e6f7a8b9c0d1" 
        therapistId="65f1a2b3c4d5e6f7a8b9c0d2" 
      />
    </div>
  );
}