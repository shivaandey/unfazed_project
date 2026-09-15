import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', { autoConnect: true });

const getClientId = (therapistId) => {
  const key = `unfazed-chat-client-${therapistId}`;
  let id = localStorage.getItem(key);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(key, id); }
  return id;
};

export default function ChatWidget({ therapistId, clientId, role = 'client', name = 'Client' }) {
  const resolvedClientId = clientId || getClientId(therapistId);
  const roomId = [therapistId, resolvedClientId].sort().join('-');
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    const handleHistory = (history) => setMessages(history);
    const handleMessage = (message) => setMessages((prev) => [...prev, message]);
    const handleTyping = ({ sender, isTyping: typing }) => sender !== role && setIsTyping(typing);
    socket.emit('join-room', { therapistId, clientId: resolvedClientId, role, name });
    socket.emit('mark-read');
    socket.on('chat-history', handleHistory);
    socket.on('receive-message', handleMessage);
    socket.on('typing-status', handleTyping);

    return () => {
      socket.off('chat-history', handleHistory);
      socket.off('receive-message', handleMessage);
      socket.off('typing-status', handleTyping);
    };
  }, [therapistId, resolvedClientId, role, name]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = () => {
    if (!draft.trim()) return;

    socket.emit('send-message', { roomId, message: draft.trim() });
    socket.emit('typing', { isTyping: false });
    setDraft('');
  };

  return (
    <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#0B0B45]">Message therapist</h3>
        <span className="text-xs text-gray-500">{isTyping ? 'Typing…' : 'Online'}</span>
      </div>

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
        <button onClick={sendMessage} className="rounded-xl bg-[#F28C28] px-4 py-2 text-sm font-bold text-white hover:bg-orange-600">
          Send
        </button>
      </div>
    </div>
  );
}
