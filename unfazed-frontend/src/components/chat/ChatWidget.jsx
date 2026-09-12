import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', { autoConnect: true });

export default function ChatWidget({ therapistId = 'therapist-demo', clientId = 'client-demo' }) {
  const [messages, setMessages] = useState([
    { sender: 'therapist', text: 'Hi, welcome to your care plan.' },
    { sender: 'client', text: 'Thanks! I have a few questions.' }
  ]);
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const roomId = [therapistId, clientId].sort().join('-');
  const endRef = useRef(null);

  useEffect(() => {
    socket.emit('join-room', { therapistId, clientId });

    socket.on('receive-message', ({ sender, message }) => {
      setMessages((prev) => [...prev, { sender, text: message }]);
    });

    socket.on('typing-status', ({ sender, isTyping: typing }) => {
      if (sender !== 'self') {
        setIsTyping(typing);
      }
    });

    return () => {
      socket.off('receive-message');
      socket.off('typing-status');
    };
  }, [therapistId, clientId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = () => {
    if (!draft.trim()) return;

    const payload = { roomId, sender: 'self', message: draft.trim() };
    socket.emit('send-message', payload);
    setMessages((prev) => [...prev, { sender: 'self', text: payload.message }]);
    setDraft('');
  };

  return (
    <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#0B0B45]">Message therapist</h3>
        <span className="text-xs text-gray-500">{isTyping ? 'Typing…' : 'Online'}</span>
      </div>

      <div className="h-64 space-y-3 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-3">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'self' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs rounded-xl px-3 py-2 text-sm ${msg.sender === 'self' ? 'bg-[#0B0B45] text-white' : 'bg-white text-gray-700 border border-gray-200'}`}>
              {msg.text}
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
            socket.emit('typing', { roomId, sender: 'self', isTyping: e.target.value.length > 0 });
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
