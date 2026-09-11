import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import Sidebar from '../../components/common/Sidebar';

export default function Schedule() {
  const [duration, setDuration] = useState(60);
  const [buffer, setBuffer] = useState(15);
  
  const handleSaveAvailability = async () => {
    // Stubbing a standard Mon-Fri 9-5 schedule for Module 2
    const payload = {
      sessionDuration: duration,
      bufferTime: buffer,
      weeklySchedule: [1, 2, 3, 4, 5].map(day => ({
        dayOfWeek: day,
        slots: [{ startTime: "09:00", endTime: "17:00" }]
      }))
    };
    try {
      await axiosInstance.post('/schedule/availability', payload);
      alert('Availability saved successfully!');
    } catch (err) {
      alert('Failed to save availability. Please check your backend connection.');
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      
      {/* Integrated Sidebar Component */}
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto animate-fade-in">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-[#0B0B45]">Manage Availability</h2>
          <p className="text-gray-500 mt-1">Set your session durations and weekly working hours.</p>
        </header>
        
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-2xl border border-gray-100">
          <h3 className="text-xl font-bold text-[#0B0B45] mb-6 border-b pb-4">Session Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Session Duration</label>
              <select 
                value={duration} 
                onChange={(e) => setDuration(Number(e.target.value))} 
                className="w-full border border-gray-200 rounded-xl p-3.5 bg-gray-50 focus:ring-2 focus:ring-[#F28C28] outline-none transition-all"
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
                <option value={90}>90 Minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Buffer Time</label>
              <select 
                value={buffer} 
                onChange={(e) => setBuffer(Number(e.target.value))} 
                className="w-full border border-gray-200 rounded-xl p-3.5 bg-gray-50 focus:ring-2 focus:ring-[#F28C28] outline-none transition-all"
              >
                <option value={0}>No Buffer</option>
                <option value={15}>15 Minutes (Recommended)</option>
                <option value={30}>30 Minutes</option>
              </select>
            </div>
          </div>
          
          <button 
            onClick={handleSaveAvailability} 
            className="w-full py-3.5 bg-[#F28C28] text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-sm"
          >
            Save Weekly Template
          </button>
        </div>
      </main>
    </div>
  );
}