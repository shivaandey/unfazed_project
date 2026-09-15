import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    axiosInstance.get('/notifications')
      .then((response) => { if (active) setNotifications(response.data); })
      .catch((error) => console.error('Failed to load notifications', error));
    return () => { active = false; };
  }, []);

  const unread = notifications.filter((notification) => !notification.readAt).length;

  const markRead = async (notification) => {
    if (notification.readAt) return;
    await axiosInstance.patch(`/notifications/${notification._id}/read`);
    setNotifications((current) => current.map((item) => item._id === notification._id ? { ...item, readAt: new Date().toISOString() } : item));
  };

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((current) => !current)} className="relative rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50" aria-label="Notifications">
        Notifications
        {unread > 0 && <span className="ml-2 rounded-full bg-[#F28C28] px-2 py-0.5 text-xs text-white">{unread}</span>}
      </button>
      {open && <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
        {notifications.length === 0 ? <p className="p-3 text-sm text-gray-500">No notifications yet.</p> : notifications.map((notification) => (
          <button key={notification._id} type="button" onClick={() => markRead(notification)} className={`block w-full rounded-lg p-3 text-left hover:bg-gray-50 ${notification.readAt ? 'opacity-60' : ''}`}>
            <p className="text-sm font-bold text-[#0B0B45]">{notification.title}</p>
            <p className="mt-1 text-xs text-gray-600">{notification.message}</p>
          </button>
        ))}
      </div>}
    </div>
  );
}
