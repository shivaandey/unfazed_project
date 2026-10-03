import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

export default function ClientsList() {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '' });
  const [savingClient, setSavingClient] = useState(false);
  const [actionStatus, setActionStatus] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/clients');
        setClients(response.data || []);
        setError('');
      } catch (err) {
        console.error('Failed to load clients', err);
        setError(err.response?.data?.message || 'Could not load your clients right now.');
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const filteredClients = clients.filter((client) => {
    const name = (client.name || '').toLowerCase();
    const email = (client.email || '').toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
  });

  const handleAddClient = async (event) => {
    event.preventDefault();
    setSavingClient(true);
    setActionStatus('');
    try {
      const response = await axiosInstance.post('/clients', newClient);
      setClients((current) => [response.data, ...current]);
      setNewClient({ name: '', email: '', phone: '' });
      setAddClientOpen(false);
      setActionStatus('Client added to your roster.');
    } catch (requestError) {
      setActionStatus(requestError.response?.data?.message || 'Could not add this client.');
    } finally {
      setSavingClient(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <main className="flex-1 p-8 overflow-y-auto animate-fade-in">
        <header className="flex justify-between items-center mb-8">
          <div>
            <Link to="/dashboard" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#F28C28]">
              <span aria-hidden="true">←</span>
              Back to dashboard
            </Link>
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
            <button type="button" onClick={() => { setAddClientOpen((open) => !open); setActionStatus(''); }} className="px-6 py-2 bg-[#F28C28] text-white font-medium rounded-lg hover:bg-orange-600 transition-colors">
              {addClientOpen ? 'Close form' : 'Add client'}
            </button>
          </div>

          {addClientOpen && (
            <form onSubmit={handleAddClient} className="grid gap-3 border-b border-gray-100 bg-white p-6 sm:grid-cols-2">
              <input required autoComplete="name" placeholder="Client name" value={newClient.name} onChange={(event) => setNewClient({ ...newClient, name: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#F28C28]" />
              <input required type="email" autoComplete="email" placeholder="Client email" value={newClient.email} onChange={(event) => setNewClient({ ...newClient, email: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#F28C28]" />
              <input type="tel" autoComplete="tel" placeholder="Phone (optional)" value={newClient.phone} onChange={(event) => setNewClient({ ...newClient, phone: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#F28C28]" />
              <div className="flex items-center gap-3 sm:justify-end">
                <button type="button" onClick={() => setAddClientOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={savingClient} className="rounded-lg bg-[#0B0B45] px-4 py-2 text-sm font-bold text-white hover:bg-blue-900 disabled:opacity-50">{savingClient ? 'Adding...' : 'Add client'}</button>
              </div>
              {actionStatus && <p role="status" className="text-sm text-red-700 sm:col-span-2">{actionStatus}</p>}
            </form>
          )}
          {!addClientOpen && actionStatus && <p role="status" className="border-b border-gray-100 px-6 py-3 text-sm text-green-800">{actionStatus}</p>}

          {loading && (
            <div className="p-6 text-sm text-gray-500">Loading clients...</div>
          )}

          {!loading && error && (
            <div className="p-6 text-sm text-red-600">{error}</div>
          )}

          {!loading && !error && filteredClients.length === 0 && (
            <div className="p-6 text-sm text-gray-500">No clients found for your account yet.</div>
          )}

          {!loading && !error && filteredClients.length > 0 && (
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
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${client.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {client.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 flex-wrap">
                        {(client.tags || []).map((tag) => (
                          <span key={`${client._id}-${tag}`} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {client.updatedAt ? new Date(client.updatedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-4 text-right">
                      <Link to={`/clients/${client._id}`} className="text-[#F28C28] font-semibold hover:underline">View Profile</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}