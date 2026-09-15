import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import Sidebar from '../../components/common/Sidebar';

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const emptySchedule = days.map((_, dayOfWeek) => ({ dayOfWeek, slots: [] }));

export default function Schedule() {
  const [duration, setDuration] = useState(60);
  const [buffer, setBuffer] = useState(15);
  const [weeklySchedule, setWeeklySchedule] = useState(emptySchedule);
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState('');

  const load = async () => {
    try {
      const [availability, appointmentResponse] = await Promise.all([
        axiosInstance.get('/schedule/availability/me').catch(() => ({ data: null })),
        axiosInstance.get('/schedule/appointments')
      ]);
      if (availability.data) {
        setDuration(availability.data.sessionDuration);
        setBuffer(availability.data.bufferTime);
        setWeeklySchedule(availability.data.weeklySchedule?.length ? days.map((_, dayOfWeek) => availability.data.weeklySchedule.find((item) => item.dayOfWeek === dayOfWeek) || { dayOfWeek, slots: [] }) : emptySchedule);
      }
      setAppointments(appointmentResponse.data);
    } catch (error) {
      setStatus(error.response?.data?.message || 'Unable to load appointments.');
    }
  };

  useEffect(() => { load(); }, []);

  const updateDay = (dayOfWeek, field, value) => setWeeklySchedule((current) => current.map((day) => day.dayOfWeek === dayOfWeek ? { ...day, slots: [{ ...(day.slots[0] || {}), [field]: value }] } : day));

  const saveAvailability = async () => {
    try {
      await axiosInstance.post('/schedule/availability', { sessionDuration: duration, bufferTime: buffer, weeklySchedule: weeklySchedule.filter((day) => day.slots[0]?.startTime && day.slots[0]?.endTime) });
      setStatus('Availability saved successfully.');
    } catch (error) { setStatus(error.response?.data?.message || 'Failed to save availability.'); }
  };

  const updateStatus = async (id, nextStatus) => {
    try {
      await axiosInstance.patch(`/schedule/sessions/${id}/status`, { status: nextStatus });
      setAppointments((current) => current.map((appointment) => appointment._id === id ? { ...appointment, status: nextStatus } : appointment));
    } catch (error) { setStatus(error.response?.data?.message || 'Could not update appointment.'); }
  };

  return <div className="flex min-h-screen bg-[#F8FAFC]"><Sidebar /><main className="flex-1 p-8 overflow-y-auto">
    <header className="mb-8"><h2 className="text-3xl font-bold text-[#0B0B45]">Appointments</h2><p className="text-gray-500 mt-1">Set availability and manage scheduled sessions.</p></header>
    <section className="mb-8 max-w-4xl rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
      <h3 className="mb-6 border-b pb-4 text-xl font-bold text-[#0B0B45]">Availability settings</h3>
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2"><label className="text-sm font-bold text-gray-700">Session duration<select value={duration} onChange={(event) => setDuration(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 p-3"><option value="30">30 minutes</option><option value="45">45 minutes</option><option value="60">60 minutes</option><option value="90">90 minutes</option></select></label><label className="text-sm font-bold text-gray-700">Buffer time<select value={buffer} onChange={(event) => setBuffer(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 p-3"><option value="0">No buffer</option><option value="15">15 minutes</option><option value="30">30 minutes</option></select></label></div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{weeklySchedule.map((day) => <div key={day.dayOfWeek} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3"><span className="w-28 text-sm font-semibold">{days[day.dayOfWeek]}</span><input type="time" value={day.slots[0]?.startTime || ''} onChange={(event) => updateDay(day.dayOfWeek, 'startTime', event.target.value)} className="rounded border p-2" /><span>-</span><input type="time" value={day.slots[0]?.endTime || ''} onChange={(event) => updateDay(day.dayOfWeek, 'endTime', event.target.value)} className="rounded border p-2" /></div>)}</div>
      <button onClick={saveAvailability} className="mt-6 w-full rounded-xl bg-[#F28C28] py-3 font-bold text-white">Save availability</button>
    </section>
    <section className="max-w-5xl rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"><h3 className="mb-6 border-b pb-4 text-xl font-bold text-[#0B0B45]">Appointment list</h3>{appointments.length === 0 ? <p className="text-gray-500">No appointments found.</p> : <div className="space-y-3">{appointments.map((appointment) => <div key={appointment._id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 p-4"><div><p className="font-bold text-[#0B0B45]">{appointment.clientName}</p><p className="text-sm text-gray-500">{appointment.clientEmail} · {new Date(appointment.startTime).toLocaleString()} · {appointment.type}</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold">{appointment.status}</span>{appointment.status === 'Scheduled' && <><button onClick={() => updateStatus(appointment._id, 'Completed')} className="rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white">Complete</button><button onClick={() => updateStatus(appointment._id, 'NoShow')} className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white">No-show</button><button onClick={() => updateStatus(appointment._id, 'Cancelled')} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white">Cancel</button></>}</div></div>)}</div>}{status && <p className="mt-4 text-sm font-semibold text-[#0B0B45]">{status}</p>}</section>
  </main></div>;
}
