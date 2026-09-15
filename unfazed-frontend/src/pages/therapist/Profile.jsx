import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import axiosInstance from '../../api/axiosInstance';
import { AuthContext } from '../../context/AuthContext';

export default function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    specializations: (user?.specializations || []).join(', '),
    languages: (user?.languages || []).join(', ')
  });
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus('');
    try {
      const response = await axiosInstance.put('/therapist/profile', {
        name: form.name,
        bio: form.bio,
        specializations: form.specializations.split(',').map((item) => item.trim()).filter(Boolean),
        languages: form.languages.split(',').map((item) => item.trim()).filter(Boolean)
      });
      setUser({ ...user, ...response.data });
      setStatus('Profile updated successfully.');
    } catch (error) {
      setStatus(error.response?.data?.message || 'Unable to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 animate-fade-in">
        <div className="mb-8 flex items-center gap-4">
          <Link to="/dashboard" className="text-gray-500 hover:text-[#F28C28]">Back</Link>
          <div>
            <h2 className="text-3xl font-bold text-[#0B0B45]">Edit Profile</h2>
            <p className="mt-1 text-gray-500">Update the information clients see on your public portal.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-3xl space-y-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <div>
            <label htmlFor="name" className="text-sm font-bold text-gray-700">Name</label>
            <input id="name" name="name" value={form.name} onChange={updateField} required className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F28C28]" />
          </div>
          <div>
            <label htmlFor="bio" className="text-sm font-bold text-gray-700">Bio</label>
            <textarea id="bio" name="bio" value={form.bio} onChange={updateField} rows="5" className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F28C28]" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="specializations" className="text-sm font-bold text-gray-700">Specializations</label>
              <input id="specializations" name="specializations" value={form.specializations} onChange={updateField} placeholder="CBT, Anxiety" className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F28C28]" />
            </div>
            <div>
              <label htmlFor="languages" className="text-sm font-bold text-gray-700">Languages</label>
              <input id="languages" name="languages" value={form.languages} onChange={updateField} placeholder="English, Hindi" className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F28C28]" />
            </div>
          </div>
          <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
            <button type="submit" disabled={saving} className="rounded-lg bg-[#0B0B45] px-6 py-3 font-bold text-white hover:bg-blue-900 disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
            {status && <p className="text-sm font-medium text-[#0B0B45]">{status}</p>}
          </div>
        </form>
      </main>
    </div>
  );
}
