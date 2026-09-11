import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import Footer from '../../components/common/Footer';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/auth/login', formData);
      login(res.data.therapist, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-gray-800">
      
      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#F28C28] rounded-full rounded-bl-none flex items-center justify-center text-white font-bold text-xl">U</div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-[#0B0B45] tracking-widest leading-none">UNFAZED</span>
            <span className="text-[10px] text-gray-400 tracking-wider">your happy place!</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
          <a href="#" className="hover:text-[#F28C28] transition-colors">Corporate Resources</a>
          <a href="#" className="hover:text-[#F28C28] transition-colors">Plans & Pricing</a>
          <a href="#" className="hover:text-[#F28C28] transition-colors">Our Counselors</a>
          <a href="#" className="hover:text-[#F28C28] transition-colors">Wellness Hub</a>
          <a href="#" className="hover:text-[#F28C28] transition-colors">Corporates</a>
          <div className="flex gap-3 ml-4">
            <Link to="/register" className="px-6 py-2 bg-[#F28C28] text-white rounded-full hover:bg-orange-600 transition-colors">Sign Up</Link>
            <Link to="/login" className="px-6 py-2 border border-[#F28C28] text-[#F28C28] rounded-full hover:bg-orange-50 transition-colors">Login</Link>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-grow flex flex-col items-center pt-20 pb-24 px-4 animate-fade-in">
        <h2 className="text-4xl font-bold text-[#0B0B45] mb-3 tracking-tight">Log In</h2>
        <p className="text-sm font-medium text-gray-700">
          Don't have an account ? <Link to="/register" className="text-[#F28C28] hover:underline">Sign Up</Link>
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20 mt-14 w-full max-w-4xl">
          
          {/* Left Side: Form */}
          <form onSubmit={handleSubmit} className="flex-1 w-full max-w-sm space-y-4">
            {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</div>}
            
            <input
              type="email" required placeholder="Email *"
              className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-full focus:ring-2 focus:ring-[#F28C28] outline-none text-sm transition-all"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <div className="relative">
              <input
                type="password" required placeholder="Password *"
                className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-full focus:ring-2 focus:ring-[#F28C28] outline-none text-sm transition-all"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <span className="absolute right-4 top-4 text-gray-400 cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              </span>
            </div>

            <button type="submit" className="mt-4 px-8 py-3 bg-[#F28C28] text-white text-sm font-semibold rounded-full hover:bg-orange-600 transition-colors shadow-sm">
              Log In
            </button>
          </form>

          {/* Middle: Divider */}
          <div className="hidden md:block w-px h-64 bg-[#F28C28] opacity-60"></div>

          {/* Right Side: Social Auth */}
          <div className="flex-1 w-full max-w-sm space-y-4">
            <button type="button" className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Log in with Google
            </button>
            <button type="button" className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700">
              <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-5 h-5" />
              Log in with Facebook
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}