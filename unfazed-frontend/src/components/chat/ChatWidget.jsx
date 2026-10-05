import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', { autoConnect: true });

export default function ChatWidget({ therapistId, clientId, clientEmail, role = 'client', name = 'Client', accessToken, bookingSessionId }) {
  const resolvedClientId = clientId || '';
  const resolvedEmail = (clientEmail || '').trim().toLowerCase();
  const token = accessToken || (role === 'client' ? sessionStorage.getItem('clientChatToken') : localStorage.getItem('token'));
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [roomReady, setRoomReady] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    setRoomReady(false);
    const handleHistory = (history) => setMessages(history);
    const handleMessage = (message) => setMessages((prev) => [...prev, message]);
    const handleTyping = ({ sender, isTyping: typing }) => sender !== role && setIsTyping(typing);
    const handleRoomError = ({ message }) => {
      setRoomReady(false);
      setConnectionError(message);
    };
    const handleJoined = () => {
      setRoomReady(true);
      setConnectionError('');
      socket.emit('mark-read');
    };
    const joinRoom = () => socket.emit('join-room', { therapistId, clientId: resolvedClientId, clientEmail: resolvedEmail, role, name, token, bookingSessionId });
    const handleDisconnect = () => {
      setRoomReady(false);
      setConnectionError('Chat disconnected. Reconnecting...');
    };

    socket.on('joined-room', handleJoined);
    socket.on('chat-history', handleHistory);
    socket.on('receive-message', handleMessage);
    socket.on('typing-status', handleTyping);
    socket.on('room-error', handleRoomError);
    socket.on('connect', joinRoom);
    socket.on('disconnect', handleDisconnect);
    if (socket.connected) joinRoom();

    return () => {
      socket.emit('leave-room');
      socket.off('joined-room', handleJoined);
      socket.off('chat-history', handleHistory);
      socket.off('receive-message', handleMessage);
      socket.off('typing-status', handleTyping);
      socket.off('room-error', handleRoomError);
      socket.off('connect', joinRoom);
      socket.off('disconnect', handleDisconnect);
    };
  }, [therapistId, resolvedClientId, resolvedEmail, role, name, token, bookingSessionId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = () => {
    const message = draft.trim();
    if (!message || !roomReady || !socket.connected) return;

    socket.timeout(10000).emit('send-message', { message }, (error, response) => {
      if (error || !response?.ok) {
        setConnectionError(response?.message || 'Message could not be sent. Please try again.');
        return;
      }
      setDraft((currentDraft) => currentDraft === message ? '' : currentDraft);
      setConnectionError('');
      socket.emit('typing', { isTyping: false });
    });
  };

  return (
    <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#0B0B45]">Message therapist</h3>
        <span className="text-xs text-gray-500">{roomReady ? (isTyping ? 'Typing…' : 'Online') : 'Connecting…'}</span>
      </div>

      {connectionError && <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{connectionError}</p>}

      <div className="h-64 space-y-3 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-3">
        {messages.map((msg) => (
          <div key={msg._id || `${msg.createdAt}-${msg.message}`} className={`flex ${msg.senderRole === role ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs rounded-xl px-3 py-2 text-sm ${msg.senderRole === role ? 'bg-[#0B0B45] text-white' : 'bg-white text-gray-700 border border-gray-200'}`}>
              {msg.message}
              {msg.senderRole === role && msg.readAt && <span className="ml-2 text-xs opacity-70">Read</span>}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            socket.emit('typing', { isTyping: e.target.value.length > 0 });
          }}
          placeholder="Type a message"
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#F28C28]"
        />
        <button onClick={sendMessage} disabled={!roomReady || !draft.trim()} className="rounded-xl bg-[#F28C28] px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50">
          Send
        </button>
      </div>
    </div>
  );
}
