import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useEntitlement } from '../../hooks/useEntitlement';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const { canAccess } = useEntitlement();

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between animate-fade-in">
        <div className="p-6">
          <h1 className="text-2xl font-black text-blue-600 tracking-tighter">UNFAZED.</h1>
          <nav className="mt-10 space-y-2">
            <a href="#" className="flex items-center px-4 py-3 text-gray-700 bg-blue-50 rounded-lg font-medium transition-colors">Dashboard</a>
            <a href="#" className="flex items-center px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-lg font-medium transition-colors">Schedule</a>
            <a href="#" className="flex items-center px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-lg font-medium transition-colors">Clients</a>
          </nav>
        </div>
        <div className="p-6 border-t border-gray-200">
          <button onClick={logout} className="w-full py-2 px-4 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
            Sign Out
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 animate-slide-up">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name || 'Doctor'}</h2>
            <p className="text-gray-500 mt-1">Here is what's happening with your practice today.</p>
          </div>
          <a href={`/${user?.slug}`} target="_blank" rel="noreferrer" className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
            View Public Portal
          </a>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 text-sm font-medium">Today's Sessions</h3>
            <p className="text-4xl font-bold text-gray-900 mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 text-sm font-medium">Active Clients</h3>
            <p className="text-4xl font-bold text-gray-900 mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-blue-600 to-indigo-700">
            <h3 className="text-white/80 text-sm font-medium">Monthly Revenue</h3>
            <p className="text-4xl font-bold text-white mt-2">₹0</p>
          </div>
        </div>
      </div>
    </div>
  );
}