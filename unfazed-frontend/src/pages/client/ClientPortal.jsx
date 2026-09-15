import { useEffect, useState } from 'react';
import { addDays, format } from 'date-fns';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import ChatWidget from '../../components/chat/ChatWidget';

export default function ClientPortal() {
  const { slug } = useParams();
  const [therapist, setTherapist] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ clientName: '', clientEmail: '', type: 'Video' });
  const [status, setStatus] = useState('');
  const dates = Array.from({ length: 14 }, (_, offset) => addDays(new Date(), offset));

  useEffect(() => {
    axiosInstance.get(`/therapist/slug/${slug}`).then(async ({ data }) => {
      setTherapist(data);
      const response = await axiosInstance.get(`/schedule/availability/${data._id}`);
      setAvailability(response.data);
    }).catch(() => setStatus('This therapist portal could not be loaded.'));
  }, [slug]);

  const loadSlots = async (date) => {
    try {
      const response = await axiosInstance.get(`/schedule/availability/${therapist._id}`, { params: { date: format(date, 'yyyy-MM-dd') } });
      setAvailability(response.data);
      setSelected(null);
    } catch (error) { setStatus(error.response?.data?.message || 'Could not load available slots.'); }
  };

  const book = async () => {
    if (!selected || !form.clientName.trim() || !form.clientEmail.trim()) return setStatus('Enter your name and email, then choose a time.');
    try {
      await axiosInstance.post('/schedule/book', { therapistId: therapist._id, ...form, ...selected });
      setStatus('Appointment booked successfully. A confirmation will be sent to your email.');
      setSelected(null);
    } catch (error) { setStatus(error.response?.data?.message || 'That slot is no longer available.'); }
  };

  if (!therapist) return <div className="flex min-h-screen items-center justify-center">{status || 'Loading profile...'}</div>;
  return <div className="min-h-screen bg-gray-50 pb-20"><header className="bg-[#0B0B45] px-6 py-16 text-white"><div className="mx-auto max-w-4xl"><h1 className="text-4xl font-bold">{therapist.name}</h1><p className="mt-3 max-w-2xl text-gray-300">{therapist.bio || 'Book a private therapy session.'}</p></div></header><main className="mx-auto max-w-4xl px-6 py-8"><section className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"><h2 className="mb-6 text-2xl font-bold text-[#0B0B45]">Choose a date and time</h2><div className="flex gap-2 overflow-x-auto pb-4">{dates.map((date) => <button key={date.toISOString()} onClick={() => loadSlots(date)} className="min-w-24 rounded-xl border border-gray-200 p-3 text-sm hover:border-[#F28C28]"><strong>{format(date, 'EEE')}</strong><br />{format(date, 'MMM d')}</button>)}</div><div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">{(availability?.slots || []).map((slot) => <button key={slot.startTime} onClick={() => setSelected(slot)} className={`rounded-lg border p-3 text-sm ${selected?.startTime === slot.startTime ? 'border-[#F28C28] bg-orange-50' : 'border-gray-200'}`}>{new Date(slot.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</button>)}{availability?.slots?.length === 0 && <p className="col-span-full text-gray-500">No available times for this date.</p>}</div></section><section className="mt-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"><h2 className="mb-6 text-2xl font-bold text-[#0B0B45]">Your details</h2><div className="grid gap-4 md:grid-cols-2"><input placeholder="Full name" value={form.clientName} onChange={(event) => setForm({ ...form, clientName: event.target.value })} className="rounded-lg border p-3" /><input type="email" placeholder="Email address" value={form.clientEmail} onChange={(event) => setForm({ ...form, clientEmail: event.target.value })} className="rounded-lg border p-3" /><select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="rounded-lg border p-3"><option value="Video">Video consultation</option><option value="Audio">Audio consultation</option></select></div><button onClick={book} className="mt-6 w-full rounded-xl bg-[#F28C28] py-3 font-bold text-white">{selected ? 'Confirm appointment' : 'Choose a time first'}</button>{status && <p className="mt-4 text-sm font-semibold text-[#0B0B45]">{status}</p>}</section><ChatWidget therapistId={therapist._id} /></main></div>;
}
