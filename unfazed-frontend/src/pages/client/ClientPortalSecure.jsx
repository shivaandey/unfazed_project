import { useEffect, useState } from 'react';
import { addDays, format } from 'date-fns';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

export default function ClientPortalSecure() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ clientName: '', clientEmail: '', type: 'Video' });
  const [status, setStatus] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const dates = Array.from({ length: 14 }, (_, offset) => addDays(new Date(), offset));

  useEffect(() => {
    let active = true;
    const loadPortal = async () => {
      try {
        const { data: therapistData } = await axiosInstance.get(`/therapist/slug/${slug}`);
        const availabilityResponse = await axiosInstance.get(`/schedule/availability/${therapistData._id}`, {
          params: { date: format(new Date(), 'yyyy-MM-dd') },
        });
        if (!active) return;
        setTherapist(therapistData);
        setAvailability(availabilityResponse.data);
      } catch {
        if (active) setStatus('This therapist portal could not be loaded.');
      }
    };
    loadPortal();
    return () => { active = false; };
  }, [slug]);

  const loadSlots = async (date) => {
    if (!therapist) return;
    setLoadingSlots(true);
    setStatus('');
    try {
      const response = await axiosInstance.get(`/schedule/availability/${therapist._id}`, {
        params: { date: format(date, 'yyyy-MM-dd') },
      });
      setAvailability(response.data);
      setSelected(null);
    } catch (error) {
      setStatus(error.response?.data?.message || 'Could not load available slots.');
    } finally {
      setLoadingSlots(false);
    }
  };

  const book = async (event) => {
    event.preventDefault();
    if (!selected || !form.clientName.trim() || !form.clientEmail.trim()) {
      setStatus('Enter your name and email, then choose a time.');
      return;
    }

    try {
      const response = await axiosInstance.post('/schedule/book', {
        therapistId: therapist._id,
        ...form,
        ...selected,
      });
      if (response.data.status === 'Waitlist') {
        setSelected(null);
        setStatus('You have been added to the waitlist.');
        return;
      }
      if (!response.data.clientId) {
        setStatus('Appointment booked, but checkout could not be opened. Please contact the therapist.');
        return;
      }
      sessionStorage.setItem('bookingChatSession', JSON.stringify({
        bookingSessionId: response.data._id,
        therapistId: therapist._id,
        therapistName: therapist.name,
        clientId: response.data.clientId,
        clientName: response.data.clientName,
        clientEmail: response.data.clientEmail,
        accessToken: response.data.clientChatToken,
        startTime: response.data.startTime,
        endTime: response.data.endTime,
      }));
      navigate(`/booking?clientId=${encodeURIComponent(response.data.clientId)}&therapistId=${encodeURIComponent(therapist._id)}`);
    } catch (error) {
      setStatus(error.response?.data?.message || 'That slot is no longer available.');
    }
  };

  if (!therapist) {
    return <div className="flex min-h-screen items-center justify-center text-gray-600">{status || 'Loading therapist profile...'}</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      <header className="bg-[#0B0B45] px-6 py-10 text-white sm:py-14">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-5">
          <div className="flex min-w-0 items-center gap-4">
            {therapist.profilePhotoUrl ? (
              <img src={`${axiosInstance.defaults.baseURL.replace(/\/api\/?$/, '')}${therapist.profilePhotoUrl}`} alt={`${therapist.name} profile`} className="h-20 w-20 shrink-0 rounded-full border-2 border-white/70 object-cover sm:h-24 sm:w-24" />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-white/70 bg-white/10 text-3xl font-bold sm:h-24 sm:w-24" aria-label="Therapist profile photo not set">
                {therapist.name.trim().charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">{therapist.name}</h1>
              <p className="mt-3 max-w-2xl text-gray-300">{therapist.bio || 'Book a private therapy session.'}</p>
            </div>
          </div>
          <Link to={`/client-access/${slug}`} className="rounded-lg border border-white/50 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
            Client sign in / register
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
          <h2 className="mb-5 text-xl font-bold text-[#0B0B45]">Choose a date and time</h2>
          <div className="flex gap-2 overflow-x-auto pb-4">
            {dates.map((date) => (
              <button key={date.toISOString()} type="button" onClick={() => loadSlots(date)} className="min-w-24 rounded-lg border border-gray-200 p-3 text-sm hover:border-[#F28C28]">
                <strong>{format(date, 'EEE')}</strong><br />{format(date, 'MMM d')}
              </button>
            ))}
          </div>
          {loadingSlots ? <p className="text-sm text-gray-500">Loading available times...</p> : (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(availability?.slots || []).map((slot) => (
                <button key={slot.startTime} type="button" onClick={() => setSelected(slot)} className={`rounded-lg border p-3 text-sm ${selected?.startTime === slot.startTime ? 'border-[#F28C28] bg-orange-50' : 'border-gray-200 hover:border-[#F28C28]'}`}>
                  {new Date(slot.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </button>
              ))}
              {availability?.slots?.length === 0 && <p className="col-span-full text-gray-500">No available times for this date.</p>}
            </div>
          )}
        </section>

        <form onSubmit={book} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
          <h2 className="mb-5 text-xl font-bold text-[#0B0B45]">Your details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input required autoComplete="name" placeholder="Full name" value={form.clientName} onChange={(event) => setForm({ ...form, clientName: event.target.value })} className="rounded-lg border border-gray-300 p-3" />
            <input required type="email" autoComplete="email" placeholder="Email address" value={form.clientEmail} onChange={(event) => setForm({ ...form, clientEmail: event.target.value })} className="rounded-lg border border-gray-300 p-3" />
            <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="rounded-lg border border-gray-300 p-3 sm:col-span-2">
              <option value="Video">Video session</option>
              <option value="Audio">Audio session</option>
            </select>
          </div>
          {selected && <p className="mt-4 text-sm text-gray-600">Selected time: {new Date(selected.startTime).toLocaleString()}</p>}
          <button disabled={!selected} className="mt-5 w-full rounded-lg bg-[#F28C28] px-5 py-3 font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50">
            Continue to payment
          </button>
          {status && <p role="status" className="mt-4 text-sm font-semibold text-[#0B0B45]">{status}</p>}
        </form>
      </main>
    </div>
  );
}
