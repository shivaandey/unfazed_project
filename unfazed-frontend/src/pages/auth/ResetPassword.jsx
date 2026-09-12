import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/auth/reset-password', { email, newPassword });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to reset password.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[#F8FAFC]">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-96">
        <h2 className="text-2xl font-bold text-[#0B0B45] mb-2">Reset Password</h2>
        <p className="text-sm text-gray-500 mb-6">Enter your email and a new password.</p>
        
        {message && <div className="mb-4 text-sm font-bold text-[#F28C28]">{message}</div>}
        
        <form onSubmit={handleReset} className="space-y-4">
          <input 
            type="email" placeholder="Email Address" required
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#F28C28]"
          />
          <input 
            type="password" placeholder="New Password" required
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#F28C28]"
          />
          <button type="submit" className="w-full py-2 bg-[#0B0B45] text-white font-bold rounded-lg hover:bg-blue-900 transition-colors">
            Update Password
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-gray-500 hover:text-[#F28C28]">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}