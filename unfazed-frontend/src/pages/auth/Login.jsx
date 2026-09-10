import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { AuthContext } from '../../context/AuthContext';

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
    <div className="flex min-h-screen bg-white">
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-8 sm:px-16 animate-slide-up">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-500 mb-8">Log in to manage your practice.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">{error}</div>}
            
            <div className="space-y-4">
              <input
                type="email" required placeholder="Email Address"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <input
                type="password" required placeholder="Password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            
            <button type="submit" className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200">
              Log In
            </button>
          </form>
          <p className="mt-6 text-sm text-gray-600 text-center">
            Don't have an account? <Link to="/register" className="text-gray-900 font-semibold hover:underline">Register</Link>
          </p>
        </div>
      </div>
      
      {/* UPDATE THIS IMAGE SRC: Provide a serene, professional office or abstract background video/image */}
      <div className="hidden lg:block lg:w-1/2 bg-gray-100 relative overflow-hidden animate-fade-in">
        <div className="absolute inset-0 bg-blue-900 opacity-20 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1000&auto=format&fit=crop" 
          alt="Therapy session" 
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
}