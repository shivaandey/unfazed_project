import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);

  // Mock data to simulate the UI of a busy therapist
  const todaySessions = [
    { id: 1, client: "Rahul Verma", time: "10:00 AM", type: "Video Call", status: "Upcoming" },
    { id: 2, client: "Sneha Iyer", time: "11:30 AM", type: "In-Person", status: "Upcoming" },
    { id: 3, client: "Amit Patel", time: "02:00 PM", type: "Video Call", status: "Upcoming" }
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        <div>
          <div className="p-6 flex items-center gap-3 border-b border-gray-50">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl leading-none">U</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Unfazed</h1>
          </div>
          <nav className="p-4 space-y-1">
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-teal-700 bg-teal-50 rounded-xl font-semibold transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
              Dashboard
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-medium transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              Appointments
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-medium transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              Clients
            </a>
          </nav>
        </div>
        <div className="p-4">
          <button onClick={logout} className="w-full py-2.5 px-4 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-red-600 transition-colors flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        
        {/* Top Header */}
        <header className="bg-white py-4 px-8 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Good morning, {user?.name || 'Dr. Sharma'}</h2>
          <div className="flex items-center gap-4">
            <a href={`/${user?.slug}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-teal-600 hover:text-teal-700 bg-teal-50 px-4 py-2 rounded-lg transition-colors">
              View My Booking Link
            </a>
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
              <img src="https://www.pexels.com/photo/two-women-talking-while-sitting-on-the-sofa-7699488/?q=80&w=100&auto=format&fit=crop" alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-slide-up">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-16 h-16 text-teal-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Sessions Today</h3>
              <p className="text-4xl font-extrabold text-gray-800">3</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-16 h-16 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"></path></svg>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Active Patients</h3>
              <p className="text-4xl font-extrabold text-gray-800">24</p>
            </div>

            <div className="bg-gradient-to-br from-teal-600 to-emerald-700 p-6 rounded-2xl shadow-lg relative overflow-hidden text-white">
               <div className="absolute top-0 right-0 p-4 opacity-20">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"></path></svg>
              </div>
              <h3 className="text-teal-50 text-sm font-medium mb-1">Monthly Earnings</h3>
              <p className="text-4xl font-extrabold">₹42,500</p>
            </div>
          </div>

          {/* Schedule Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">Upcoming Appointments</h3>
              <button className="text-sm font-semibold text-teal-600 hover:text-teal-700">View Calendar</button>
            </div>
            <div className="divide-y divide-gray-100">
              {todaySessions.map((session) => (
                <div key={session.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex flex-col items-center justify-center font-bold">
                      <span className="text-xs uppercase tracking-wide opacity-80">{session.time.split(' ')[1]}</span>
                      <span className="text-sm">{session.time.split(' ')[0]}</span>
                    </div>
                    <div>
                      <p className="text-base font-bold text-gray-800">{session.client}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span> {session.type}
                      </p>
                    </div>
                  </div>
                  <button className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
                    {session.type === 'Video Call' ? 'Start Call' : 'View Details'}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}