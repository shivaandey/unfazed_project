import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

export default function ClientsList() {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Stubbing mock data for visual testing before DB is populated
  useEffect(() => {
    setClients([
      { _id: '1', name: 'Rahul Verma', email: 'rahul@example.com', status: 'Active', tags: ['Anxiety', 'CBT'], updatedAt: new Date().toISOString() },
      { _id: '2', name: 'Sneha Iyer', email: 'sneha@example.com', status: 'Active', tags: ['Depression'], updatedAt: new Date().toISOString() },
    ]);
  }, []);

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <main className="flex-1 p-8 overflow-y-auto animate-fade-in">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#0B0B45]">Client Roster</h2>
            <p className="text-gray-500 mt-1">Manage your active and past clients.</p>
          </div>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F28C28] w-72"
            />
            <button className="px-6 py-2 bg-[#F28C28] text-white font-medium rounded-lg hover:bg-orange-600 transition-colors">
              + Add Client
            </button>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Tags</th>
                <th className="p-4 font-semibold">Last Updated</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClients.map((client) => (
                <tr key={client._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-bold text-[#0B0B45]">{client.name}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">{client.status}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {client.tags.map(tag => <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{tag}</span>)}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{new Date(client.updatedAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <Link to={`/clients/${client._id}`} className="text-[#F28C28] font-semibold hover:underline">View Profile</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}