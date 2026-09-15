import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import axiosInstance from '../../api/axiosInstance';
import NotificationBell from '../../components/common/NotificationBell';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState({
    totalSessions: 0,
    scheduled: 0,
    completed: 0,
    waitlist: 0,
    revenue: 0,
    paymentCount: 0
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axiosInstance.get('/analytics/dashboard');
        setSummary(res.data);
      } catch (error) {
        console.error('Failed to fetch analytics summary', error);
      }
    };

    if (user) {
      fetchSummary();
    }
  }, [user]);

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto animate-fade-in">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-[#0B0B45]">
            Good morning, {user?.name || 'Therapist'}
          </h2>
          <div className="flex gap-4 items-center">
            <NotificationBell />
            <Link to="/profile" className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              Edit Profile
            </Link>
            {user?.slug ? (
              <Link
                to={`/${user.slug}`}
                target="_blank"
                className="px-4 py-2 bg-[#0B0B45] text-white rounded-lg text-sm font-semibold hover:bg-blue-900 transition-colors"
              >
                View Public Portal
              </Link>
            ) : (
              <span className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm font-semibold">
                No public link yet
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2 font-medium">Total Sessions</p>
            <p className="text-4xl font-bold text-[#0B0B45]">{summary.totalSessions}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2 font-medium">Completed</p>
            <p className="text-4xl font-bold text-[#0B0B45]">{summary.completed}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2 font-medium">Scheduled</p>
            <p className="text-4xl font-bold text-[#0B0B45]">{summary.scheduled}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2 font-medium">Revenue</p>
            <p className="text-4xl font-bold text-[#0B0B45]">₹{summary.revenue}</p>
          </div>
        </div>
      </main>
    </div>
  );
}