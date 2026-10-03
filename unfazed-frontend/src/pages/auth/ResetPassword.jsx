import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [stage, setStage] = useState('request');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleRequestCode = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const response = await axiosInstance.post('/auth/password-reset/request-code', { email });
      setStage('confirm');
      setMessage(response.data.message || 'If an account exists for that email, a reset code was sent.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not request a reset code.');
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const res = await axiosInstance.post('/auth/password-reset/confirm', { email, code, newPassword });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to reset password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[#F8FAFC]">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-96">
        <h2 className="text-2xl font-bold text-[#0B0B45] mb-2">Reset Password</h2>
        <p className="text-sm text-gray-500 mb-6">{stage === 'request' ? 'We’ll email a one-time code to verify your account.' : `Enter the reset code sent to ${email} and choose a new password.`}</p>
        
        {message && <div className="mb-4 text-sm font-bold text-[#F28C28]">{message}</div>}
        
        {stage === 'request' ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <input
              type="email" placeholder="Email Address" required autoComplete="email"
              value={email} onChange={(event) => setEmail(event.target.value)}
              className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#F28C28]"
            />
            <button type="submit" disabled={busy} className="w-full py-2 bg-[#0B0B45] text-white font-bold rounded-lg hover:bg-blue-900 disabled:opacity-60">
              {busy ? 'Sending code...' : 'Email reset code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <input
              type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} placeholder="Six-digit reset code" required
              value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#F28C28]"
            />
            <input
              type="password" placeholder="New password (at least 8 characters)" required minLength={8}
              value={newPassword} onChange={(event) => setNewPassword(event.target.value)}
              className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#F28C28]"
            />
            <button type="submit" disabled={busy} className="w-full py-2 bg-[#0B0B45] text-white font-bold rounded-lg hover:bg-blue-900 disabled:opacity-60">
              {busy ? 'Updating...' : 'Verify code and update password'}
            </button>
          </form>
        )}
        
        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-gray-500 hover:text-[#F28C28]">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}