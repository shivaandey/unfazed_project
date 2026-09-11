import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function Sidebar() {
  const { logout } = useContext(AuthContext);
  const location = useLocation();

  // Helper function to check if a link is active
  const isActive = (path) => location.pathname.includes(path);

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 h-screen sticky top-0">
      <div>
        <div className="p-6 flex items-center gap-3 border-b border-gray-50">
          <div className="w-8 h-8 bg-[#F28C28] rounded-lg flex items-center justify-center text-white font-bold text-xl leading-none">
            U
          </div>
          <h1 className="text-xl font-bold text-[#0B0B45] tracking-tight">Unfazed</h1>
        </div>
        <nav className="p-4 space-y-2">
          <Link 
            to="/dashboard" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${isActive('/dashboard') ? 'text-[#F28C28] bg-orange-50' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/schedule" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${isActive('/schedule') ? 'text-[#F28C28] bg-orange-50' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Appointments
          </Link>
          <Link 
            to="/clients" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${isActive('/clients') ? 'text-[#F28C28] bg-orange-50' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Clients
          </Link>
        </nav>
      </div>
      <div className="p-4">
        <button 
          onClick={logout} 
          className="w-full py-2.5 px-4 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-red-600 transition-colors flex items-center justify-center gap-2"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}