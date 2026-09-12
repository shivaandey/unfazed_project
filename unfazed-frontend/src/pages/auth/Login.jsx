import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[#F8FAFC]">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-96">
        <div className="flex justify-center mb-6">
          <span className="bg-[#F28C28] text-white p-2 rounded-lg font-bold text-xl mr-2">U</span>
          <h1 className="text-2xl font-bold text-[#0B0B45]">UNFAZED</h1>
        </div>
        
        <h2 className="text-2xl font-bold text-[#0B0B45] mb-2 text-center">Login</h2>
        
        {error && <div className="mb-4 text-sm font-bold text-red-500 text-center">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input 
              type="email" placeholder="Email *" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-[#F28C28]"
            />
          </div>
          <div>
            <input 
              type="password" placeholder="Password *" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-[#F28C28]"
            />
            <div className="flex justify-end mt-2">
              <Link to="/reset-password" className="text-xs font-bold text-[#F28C28] hover:underline">
                Forgot Password?
              </Link>
            </div>
          </div>
          <button type="submit" className="w-full py-3 mt-4 bg-[#F28C28] text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">
            Login
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          Don't have an account? <Link to="/register" className="font-bold text-[#F28C28] hover:underline">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}