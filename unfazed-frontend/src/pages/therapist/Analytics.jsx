import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import Sidebar from '../../components/common/Sidebar';
import UpgradePrompt from '../../components/common/UpgradePrompt';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  const [stats, setStats] = useState({
    totalSessions: 0,
    scheduled: 0,
    completed: 0,
    waitlist: 0,
    revenue: 0,
    paymentCount: 0,
    revenueTrend: [],
    activeClients: 0,
    noShowRate: 0
  });
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get('/analytics/dashboard');
        setStats(res.data);
      } catch (error) {
        if (error.response?.status === 403 && error.response?.data?.upgradeRequired) setBlocked(true);
        console.error('Analytics fetch failed', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto animate-fade-in">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-[#0B0B45]">Analytics</h2>
          <p className="text-gray-500 mt-1">Operational overview across sessions and revenue.</p>
        </header>
        {blocked && <UpgradePrompt featureKey="analytics-depth" />}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total Sessions</p>
            <p className="text-3xl font-bold text-[#0B0B45] mt-3">{stats.totalSessions}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"><p className="text-sm text-gray-500">Active Clients</p><p className="text-3xl font-bold text-[#0B0B45] mt-3">{stats.activeClients}</p></div>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"><p className="text-sm text-gray-500">No-show Rate</p><p className="text-3xl font-bold text-[#0B0B45] mt-3">{stats.noShowRate}%</p></div>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-gray-500">Completed Sessions</p>
            <p className="text-3xl font-bold text-[#0B0B45] mt-3">{stats.completed}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-gray-500">Revenue</p>
            <p className="text-3xl font-bold text-[#0B0B45] mt-3">₹{stats.revenue}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm md:col-span-2">
            <h3 className="font-bold text-lg text-[#0B0B45] mb-4">Revenue Trend</h3>
            <div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={stats.revenueTrend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="_id" /><YAxis /><Tooltip /><Line type="monotone" dataKey="revenue" stroke="#F28C28" strokeWidth={3} /></LineChart></ResponsiveContainer></div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg text-[#0B0B45] mb-4">Session Status</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex justify-between"><span>Scheduled</span><strong>{stats.scheduled}</strong></li>
              <li className="flex justify-between"><span>Completed</span><strong>{stats.completed}</strong></li>
              <li className="flex justify-between"><span>Waitlist</span><strong>{stats.waitlist}</strong></li>
            </ul>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg text-[#0B0B45] mb-4">Payments</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex justify-between"><span>Successful Payments</span><strong>{stats.paymentCount}</strong></li>
              <li className="flex justify-between"><span>Net Revenue</span><strong>₹{stats.revenue}</strong></li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
