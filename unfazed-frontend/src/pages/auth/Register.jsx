import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { AuthContext } from '../../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/auth/register', formData);
      login(res.data.therapist, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-8 sm:px-16 animate-slide-up">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Join Unfazed</h2>
          <p className="text-gray-500 mb-8">Run your entire private practice from one link.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">{error}</div>}
            
            <div className="space-y-4">
              <input
                type="text" required placeholder="Full Name (e.g., Dr. Sharma)"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                type="email" required placeholder="Email Address"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <input
                type="password" required placeholder="Password (Min 6 chars)"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            
            <button type="submit" className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200">
              Create Account
            </button>
          </form>
          <p className="mt-6 text-sm text-gray-600 text-center">
            Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
      
      {/* UPDATE THIS IMAGE SRC: Provide a serene, professional office or abstract background video/image */}
      <div className="hidden lg:block lg:w-1/2 bg-gray-100 relative overflow-hidden animate-fade-in">
        <div className="absolute inset-0 bg-blue-900 opacity-20 z-10"></div>
        <img 
          src="https://images.pexels.com/photos/8560049/pexels-photo-8560049.jpeg" 
          alt="Therapy session" 
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
