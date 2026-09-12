import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      
      {/* Injects the new global navigation menu */}
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto animate-fade-in">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-[#0B0B45]">
            Good morning, {user?.name || 'Therapist'}
          </h2>
          <div className="flex gap-4">
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              Edit Profile
            </button>
            {/* Dynamically routes to the therapist's unique public booking link */}
            <Link 
              to={`/${user?.slug || '#'}`} 
              target="_blank"
              className="px-4 py-2 bg-[#0B0B45] text-white rounded-lg text-sm font-semibold hover:bg-blue-900 transition-colors"
            >
              View Public Portal
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2 font-medium">Sessions Today</p>
            <p className="text-4xl font-bold text-[#0B0B45]">0</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2 font-medium">Active Patients</p>
            <p className="text-4xl font-bold text-[#0B0B45]">0</p>
          </div>
        </div>
      </main>
    </div>
  );
}