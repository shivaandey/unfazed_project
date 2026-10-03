import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { AuthContext } from '../../context/AuthContextValue';
import Footer from '../../components/common/Footer';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [role, setRole] = useState('therapist');
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (role !== 'therapist') return;
    try {
      const payload = {
        ...formData,
        role,
      };

      const res = await axiosInstance.post('/auth/register', payload);
      login(res.data, res.data.token);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-gray-800">
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

      <main className="flex-grow flex flex-col items-center pt-16 pb-24 px-4 animate-fade-in">
        <h2 className="text-4xl font-bold text-[#0B0B45] mb-3 tracking-tight">Sign Up</h2>
        <p className="text-sm font-medium text-gray-700 mb-8">
          Already have an account ? <Link to="/login" className="text-[#F28C28] hover:underline">Log In</Link>
        </p>

        <div className="flex bg-gray-100 p-1 rounded-full w-full max-w-xs mx-auto mb-4 border border-gray-200">
          <button 
            onClick={() => setRole('therapist')} 
            className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${role === 'therapist' ? 'bg-white shadow text-[#0B0B45]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Therapist
          </button>
          <button 
            onClick={() => setRole('client')} 
            className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${role === 'client' ? 'bg-white shadow text-[#0B0B45]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Client
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-start justify-center gap-12 md:gap-20 mt-8 w-full max-w-4xl">
          
          <div className="flex-1 w-full max-w-sm">
            {role === 'therapist' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</div>}
                
                <input
                  type="text" required placeholder="Name *"
                  className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-full focus:ring-2 focus:ring-[#F28C28] outline-none text-sm transition-all"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                
                <input
                  type="email" required placeholder="Email *"
                  className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-full focus:ring-2 focus:ring-[#F28C28] outline-none text-sm transition-all"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                
                <div className="flex items-center w-full px-5 py-3.5 bg-gray-50 rounded-full focus-within:ring-2 focus-within:ring-[#F28C28] transition-all">
                  <span className="mr-2 text-lg">🇮🇳</span>
                  <span className="text-gray-400 text-sm mr-2 border-r border-gray-300 pr-2">+91</span>
                  <input type="text" placeholder="081234 56789" className="bg-transparent border-none outline-none text-sm w-full" />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} // Dynamic type
                    required placeholder="Password *"
                    className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-full focus:ring-2 focus:ring-[#F28C28] outline-none text-sm transition-all"
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    className="absolute right-4 top-3.5 rounded px-1 text-sm font-semibold text-gray-500 hover:text-[#0B0B45]"
                    onClick={() => setShowPassword((visible) => !visible)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

                <button type="submit" className="mt-4 px-8 py-3 bg-[#F28C28] text-white text-sm font-semibold rounded-full hover:bg-orange-600 transition-colors shadow-sm">
                  Sign Up
                </button>
              </form>
            ) : (
              <div className="text-center p-8 border border-gray-200 rounded-3xl bg-gray-50 h-full flex flex-col justify-center">
                <h3 className="text-xl font-bold text-[#0B0B45] mb-3">Already a client?</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Choose your therapist, verify the email on your client record, and open your secure chat.
                </p>
                <Link to="/client-access" className="mt-5 inline-flex justify-center rounded-lg bg-[#0B0B45] px-5 py-3 font-bold text-white hover:bg-blue-900">
                  Client sign in / register
                </Link>
              </div>
            )}
          </div>

          <div className="hidden md:block w-px h-64 bg-[#F28C28] opacity-60"></div>

        </div>

        <div className="mt-20 text-center text-xs text-gray-500 max-w-md">
          <p>By signing up, you agree to our <a href="#" className="text-[#0B0B45] hover:underline">Terms Of Service</a> and acknowledge that you have read our <a href="#" className="text-[#0B0B45] hover:underline">Privacy Policy</a></p>
        </div>
      </main>

      <Footer />
    </div>
  );
}