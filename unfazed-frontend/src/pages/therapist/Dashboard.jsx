import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    specializations: user?.specializations?.join(', ') || '',
    languages: user?.languages?.join(', ') || ''
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        specializations: formData.specializations.split(',').map(s => s.trim()),
        languages: formData.languages.split(',').map(l => l.trim())
      };
      await axiosInstance.put('/therapist/profile', payload);
      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      alert('Failed to update profile.');
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans">
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        <div>
          <div className="p-6 flex items-center gap-3 border-b border-gray-50">
            <div className="w-8 h-8 bg-[#F28C28] rounded-lg flex items-center justify-center text-white font-bold text-xl">U</div>
            <h1 className="text-xl font-bold text-[#0B0B45] tracking-tight">Unfazed</h1>
          </div>
          <nav className="p-4 space-y-1">
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-[#F28C28] bg-orange-50 rounded-xl font-semibold transition-colors">Dashboard</a>
          </nav>
        </div>
        <div className="p-4">
          <button onClick={logout} className="w-full py-2.5 px-4 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-red-600 transition-colors">Sign Out</button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <header className="bg-white py-4 px-8 border-b border-gray-100 flex justify-between items-center mb-8 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800">Good morning, {user?.name}</h2>
          <div className="flex gap-4">
            <button onClick={() => setIsEditing(!isEditing)} className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 border rounded-lg">
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
            <a href={`/${user?.slug}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-white bg-[#0B0B45] px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors">
              View Public Portal
            </a>
          </div>
        </header>

        {isEditing ? (
          <form onSubmit={handleUpdateProfile} className="bg-white p-8 rounded-2xl shadow-sm max-w-2xl mx-auto space-y-4 animate-fade-in">
            <h3 className="text-xl font-bold text-[#0B0B45] mb-4">Edit Public Profile</h3>
            <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F28C28] outline-none" />
            <textarea placeholder="Bio" rows="4" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F28C28] outline-none"></textarea>
            <input type="text" placeholder="Specializations (comma separated)" value={formData.specializations} onChange={(e) => setFormData({...formData, specializations: e.target.value})} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F28C28] outline-none" />
            <input type="text" placeholder="Languages (comma separated)" value={formData.languages} onChange={(e) => setFormData({...formData, languages: e.target.value})} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F28C28] outline-none" />
            <button type="submit" className="w-full py-3 bg-[#F28C28] text-white font-bold rounded-lg hover:bg-orange-600">Save Changes</button>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white p-6 rounded-2xl border shadow-sm"><h3 className="text-gray-500 text-sm">Sessions Today</h3><p className="text-4xl font-extrabold text-gray-800">0</p></div>
             <div className="bg-white p-6 rounded-2xl border shadow-sm"><h3 className="text-gray-500 text-sm">Active Patients</h3><p className="text-4xl font-extrabold text-gray-800">0</p></div>
          </div>
        )}
      </main>
    </div>
  );
}