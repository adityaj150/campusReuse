import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getUser } from '../services/auth';
import { getTripById } from '../services/api';
import type { Trip } from '../services/api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

type ChatMessage = {
  messageId?: number;
  chatRoomId?: number;
  senderId: number;
  senderName?: string;
  content: string;
  timestamp?: string;
};

export default function TripChat() {
  const { tripId } = useParams();
  const user = getUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [expired, setExpired] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const stompRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load trip details
  useEffect(() => {
    if (tripId) {
      getTripById(Number(tripId)).then(setTrip).catch(console.error);
    }
  }, [tripId]);

  // Load chat history via REST
  useEffect(() => {
    if (!tripId) return;

    const token = localStorage.getItem('campusreuse_token');
    fetch(`${API_BASE}/api/chat/${tripId}/messages`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (res.ok) return res.json();
        return [];
      })
      .then((data) => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch(() => {
        // Chat room might not exist yet, that's okay
      });

    // Fetch chat room status
    fetch(`${API_BASE}/api/chat/${tripId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (res.ok) return res.json();
      })
      .then((data) => {
        if (data && data.status === 'EXPIRED') {
          setExpired(true);
          setWarning('Chat has expired and is now closed.');
        }
      })
      .catch(console.error);
  }, [tripId]);

  // Connect WebSocket
  useEffect(() => {
    if (!tripId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE || 'http://localhost:8080'}/ws`),
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/trip/${tripId}`, (msg) => {
          const body = JSON.parse(msg.body);
          if (body.type === 'WARNING') {
            setWarning(body.content);
          } else if (body.type === 'EXPIRED') {
            setWarning(body.content);
            setExpired(true);
          } else {
            setMessages((prev) => [...prev, body]);
          }
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
    });

    client.activate();
    stompRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [tripId]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stompRef.current?.connected || !input.trim() || !user) return;

    const payload = {
      senderId: user.id,
      content: input.trim(),
    };

    stompRef.current.publish({
      destination: `/app/chat/send/${tripId}`,
      body: JSON.stringify(payload),
    });
    setInput('');
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[650px] border border-border dark:border-darkBorder rounded-xl overflow-hidden bg-surface dark:bg-darkSurface shadow-lg">
      {/* Header */}
      <div className="bg-accent text-white p-4 font-semibold text-lg flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link to="/rideshare" className="text-white/80 hover:text-white text-sm">← Back</Link>
          <span>
            {trip ? `${trip.source} ➔ ${trip.destination}` : 'Trip Chat'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {trip && (
            <span className="text-sm bg-white/20 px-2 py-1 rounded">
              {trip.currentMembers}/{trip.maxMembers} Members
            </span>
          )}
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} title={connected ? 'Connected' : 'Disconnected'} />
        </div>
      </div>
      
      {/* Warning Banner */}
      {warning && (
        <div className="bg-red-500/10 text-red-500 p-2 text-center text-sm font-medium border-b border-red-500/20">
          ⚠️ {warning}
        </div>
      )}

      {!connected && !expired && (
        <div className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 p-2 text-center text-sm font-medium border-b border-yellow-500/20">
          🔄 Connecting to chat...
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            <p className="text-lg">💬</p>
            <p className="text-sm mt-2">No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map((msg, idx) => {
          const isMe = user && msg.senderId === user.id;
          return (
            <div key={msg.messageId || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-xl p-3 text-sm ${isMe
                ? 'bg-accent text-white rounded-br-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-textHeading dark:text-darkText rounded-bl-sm'
              }`}>
                {!isMe && (
                  <p className="text-xs font-medium text-accent dark:text-accent mb-1">
                    {msg.senderName || `User #${msg.senderId}`}
                  </p>
                )}
                <p>{msg.content}</p>
                {msg.timestamp && (
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border dark:border-darkBorder bg-surface dark:bg-darkSurface">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            className="flex-1 rounded-lg border border-border dark:border-darkBorder bg-transparent p-2.5 text-textHeading dark:text-darkText focus:border-accent focus:ring-1 focus:ring-accent placeholder:text-gray-400"
            placeholder={expired ? 'Chat is closed' : (connected ? 'Type your message...' : 'Connecting...')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!connected || expired}
          />
          <button
            type="submit"
            disabled={!connected || expired || !input.trim()}
            className="bg-accent text-white px-5 py-2.5 rounded-lg font-medium hover:bg-accent/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
