import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import ChatWidget from '../../components/chat/ChatWidget';

export default function ClientAccess() {
  const { slug } = useParams();
  const [therapist, setTherapist] = useState(null);
  const [therapists, setTherapists] = useState([]);
  const [selectedTherapistSlug, setSelectedTherapistSlug] = useState(slug || '');
  const [directoryLoading, setDirectoryLoading] = useState(!slug);
  const [mode, setMode] = useState('register');
  const [stage, setStage] = useState('details');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [clientSession, setClientSession] = useState(() => {
    try {
      const token = sessionStorage.getItem('clientChatToken');
      const identity = JSON.parse(sessionStorage.getItem('clientChatIdentity') || 'null');
      return token && identity ? { token, ...identity } : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let active = true;
    const loadTherapists = async () => {
      try {
        if (slug) {
          const { data } = await axiosInstance.get(`/therapist/slug/${slug}`);
          if (!active) return;
          setTherapist(data);
          setSelectedTherapistSlug(data.slug);
          return;
        }

        const { data } = await axiosInstance.get('/therapist/public');
        if (active) setTherapists(data);
      } catch {
        if (active) setStatus('Therapist selection could not be loaded.');
      } finally {
        if (active) setDirectoryLoading(false);
      }
    };
    loadTherapists();
    return () => { active = false; };
  }, [slug]);

  const requestCode = async (event) => {
    event.preventDefault();
    setBusy(true);
    setStatus('');
    try {
      const response = await axiosInstance.post('/auth/client/request-code', {
        therapistSlug: therapist.slug,
        mode,
        name: mode === 'register' ? name : undefined,
        email,
      });
      setStage('verify');
      setStatus(response.data.message || 'If your details match an active client record, a code will be emailed to you.');
    } catch (error) {
      setStatus(error.response?.data?.message || 'Could not request a verification code.');
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (event) => {
    event.preventDefault();
    setBusy(true);
    setStatus('');
    try {
      const response = await axiosInstance.post('/auth/client/verify-code', {
        therapistSlug: therapist.slug,
        mode,
        name: mode === 'register' ? name : undefined,
        email,
        code,
      });
      const identity = { client: response.data.client, therapist: response.data.therapist };
      sessionStorage.setItem('clientChatToken', response.data.token);
      sessionStorage.setItem('clientChatIdentity', JSON.stringify(identity));
      setClientSession({ token: response.data.token, ...identity });
      setStatus('');
    } catch (error) {
      setStatus(error.response?.data?.message || 'Could not verify that code.');
    } finally {
      setBusy(false);
    }
  };

  const signOut = () => {
    sessionStorage.removeItem('clientChatToken');
    sessionStorage.removeItem('clientChatIdentity');
    setClientSession(null);
    setStage('details');
    setCode('');
  };

  const activeClientSession = clientSession?.therapist?.slug === therapist?.slug ? clientSession : null;

  if (slug && !therapist) {
    return <div className="flex min-h-screen items-center justify-center text-gray-600">{status || 'Loading therapist portal...'}</div>;
  }

  if (!slug && !therapist) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] px-4 py-10">
        <section className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-[#0B0B45]">Choose your therapist</h1>
          <p className="mt-2 text-sm text-gray-600">Select the therapist who added you to their active client roster.</p>
          <label className="mt-6 block text-sm font-semibold text-gray-700">
            Therapist
            <select value={selectedTherapistSlug} onChange={(event) => setSelectedTherapistSlug(event.target.value)} disabled={directoryLoading} className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3">
              <option value="">{directoryLoading ? 'Loading therapists...' : 'Select a therapist'}</option>
              {therapists.map((item) => <option key={item._id} value={item.slug}>{item.name}</option>)}
            </select>
          </label>
          <button
            type="button"
            disabled={!selectedTherapistSlug || directoryLoading}
            onClick={() => {
              const selectedTherapist = therapists.find((item) => item.slug === selectedTherapistSlug);
              if (selectedTherapist) setTherapist(selectedTherapist);
            }}
            className="mt-5 w-full rounded-lg bg-[#0B0B45] px-5 py-3 font-bold text-white hover:bg-blue-900 disabled:opacity-50"
          >
            Continue
          </button>
          {status && <p role="status" className="mt-4 text-sm text-red-700">{status}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link to={`/${therapist.slug}`} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#F28C28]">
          <span aria-hidden="true">←</span> Back to {therapist.name}'s portal
        </Link>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-[#0B0B45]">Client chat</h1>
          <p className="mt-2 text-sm text-gray-600">Access is available to active clients listed by {therapist.name}. We’ll email a one-time verification code to confirm your address.</p>

          {activeClientSession ? (
            <>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                <div>
                  <p className="font-semibold text-[#0B0B45]">Signed in as {activeClientSession.client.name}</p>
                  <p className="text-sm text-gray-500">{activeClientSession.client.email}</p>
                </div>
                <button type="button" onClick={signOut} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Sign out
                </button>
              </div>
              <ChatWidget
                therapistId={activeClientSession.therapist.id}
                clientId={activeClientSession.client.id}
                clientEmail={activeClientSession.client.email}
                role="client"
                name={activeClientSession.client.name}
                accessToken={activeClientSession.token}
              />
            </>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-2 border-b">
                <button type="button" onClick={() => { setMode('register'); setStage('details'); setStatus(''); }} className={`border-b-2 px-4 py-3 text-sm font-bold ${mode === 'register' ? 'border-[#F28C28] text-[#0B0B45]' : 'border-transparent text-gray-500'}`}>
                  Register
                </button>
                <button type="button" onClick={() => { setMode('login'); setStage('details'); setStatus(''); }} className={`border-b-2 px-4 py-3 text-sm font-bold ${mode === 'login' ? 'border-[#F28C28] text-[#0B0B45]' : 'border-transparent text-gray-500'}`}>
                  Log in
                </button>
              </div>

              {stage === 'details' ? (
                <form onSubmit={requestCode} className="mt-6 space-y-4">
                  {mode === 'register' && (
                    <label className="block text-sm font-semibold text-gray-700">
                      Name on your client record
                      <input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-[#F28C28]" />
                    </label>
                  )}
                  <label className="block text-sm font-semibold text-gray-700">
                    Email on your client record
                    <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-[#F28C28]" />
                  </label>
                  <button disabled={busy} className="w-full rounded-lg bg-[#0B0B45] px-5 py-3 font-bold text-white hover:bg-blue-900 disabled:opacity-60">
                    {busy ? 'Sending code...' : mode === 'register' ? 'Verify email and register' : 'Email me a login code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={verifyCode} className="mt-6 space-y-4">
                  <p className="text-sm text-gray-600">Enter the six-digit code sent to {email}. It expires in 10 minutes.</p>
                  <label className="block text-sm font-semibold text-gray-700">
                    Verification code
                    <input required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-lg tracking-[0.2em] outline-none focus:ring-2 focus:ring-[#F28C28]" />
                  </label>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => { setStage('details'); setCode(''); setStatus(''); }} className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50">Back</button>
                    <button disabled={busy} className="flex-1 rounded-lg bg-[#0B0B45] px-4 py-3 font-bold text-white hover:bg-blue-900 disabled:opacity-60">{busy ? 'Verifying...' : 'Verify and open chat'}</button>
                  </div>
                </form>
              )}
              {status && <p role="status" className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">{status}</p>}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
