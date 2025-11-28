import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../config';

const ChatInterface = () => {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const API_BASE = `${config.API_URL}/api/chat`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (activeSessionId) {
      fetchMessages(activeSessionId);
    }
  }, [activeSessionId]);

  const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return null;
    }
    return token;
  };

  const handleError = (error) => {
    if (error.response && error.response.status === 401) {
      setError('Your session has expired. Please log in again.');
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setError(error.response?.data?.error || 'An error occurred. Please try again.');
    }
  };

  const fetchSessions = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await axios.get(`${API_BASE}/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSessions(response.data);

      // If no active session and sessions exist, select the first one
      if (!activeSessionId && response.data.length > 0) {
        setActiveSessionId(response.data[0]._id);
      }

      // If no sessions exist, create a default one
      if (response.data.length === 0) {
        await createNewSession();
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      handleError(error);
    }
  };

  const fetchMessages = async (sessionId) => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await axios.get(`${API_BASE}/sessions/${sessionId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      handleError(error);
    }
  };

  const createNewSession = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await axios.post(
        `${API_BASE}/sessions`,
        { title: 'New Chat' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newSession = response.data;
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSession._id);
      setMessages([]);
      setError('');
    } catch (error) {
      console.error('Error creating session:', error);
      handleError(error);
    }
  };

  const deleteSession = async (sessionId, e) => {
    e.stopPropagation(); // Prevent session selection when clicking delete

    if (!window.confirm('Are you sure you want to delete this chat session?')) {
      return;
    }

    try {
      const token = getToken();
      if (!token) return;

      await axios.delete(`${API_BASE}/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSessions(prev => prev.filter(s => s._id !== sessionId));

      // If deleted session was active, switch to another session
      if (activeSessionId === sessionId) {
        const remainingSessions = sessions.filter(s => s._id !== sessionId);
        if (remainingSessions.length > 0) {
          setActiveSessionId(remainingSessions[0]._id);
        } else {
          // Create a new session if no sessions remain
          await createNewSession();
        }
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      handleError(error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !activeSessionId) return;

    const userMessage = input.trim();
    setInput('');
    setError('');
    setIsLoading(true);

    // Optimistically add user message to UI
    const tempUserMsg = {
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await axios.post(
        `${API_BASE}/sessions/${activeSessionId}/message`,
        { message: userMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Replace temp message with actual messages from server
      setMessages(prev => [
        ...prev.slice(0, -1), // Remove temp message
        response.data.userMessage,
        response.data.aiResponse
      ]);

      // We don't need to re-fetch all sessions here as it causes excessive requests
      // The current session is already updated locally
      // fetchSessions();
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temp message on error
      setMessages(prev => prev.slice(0, -1));
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex h-full bg-gray-900">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-gray-800 border-r border-gray-700 flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={createNewSession}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/50 transition-all font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        <div className="flex-grow overflow-y-auto">
          {sessions.map(session => (
            <div
              key={session._id}
              onClick={() => setActiveSessionId(session._id)}
              className={`p-3 cursor-pointer hover:bg-gray-700 border-b border-gray-700 group ${activeSessionId === session._id ? 'bg-gray-700' : ''
                }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-grow min-w-0">
                  <div className="text-white text-sm truncate">{session.title}</div>
                  <div className="text-gray-400 text-xs mt-1">
                    {formatTimestamp(session.updatedAt)}
                  </div>
                </div>
                <button
                  onClick={(e) => deleteSession(session._id, e)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1 rounded transition-opacity"
                  title="Delete session"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-grow flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 p-4 border-b border-gray-700 flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Financial Advisor
            </span>
          </h1>
        </div>

        {/* Messages */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-8">
              <p className="text-lg mb-2">👋 Welcome to Simply Invest AI Chat!</p>
              <p className="text-sm">Ask me about stocks, market trends, or investment advice.</p>
            </div>
          )}
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-xl shadow-lg ${msg.role === 'user'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                : 'bg-gray-800 text-gray-200 border border-gray-700'
                }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-gray-200 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-pulse">Thinking...</div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-gray-800 p-4 border-t border-gray-700">
          {error && (
            <div className="text-red-400 text-center mb-2 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about stocks, market trends, or investment advice..."
              className="flex-grow p-3 bg-gray-700 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading || !activeSessionId}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim() || !activeSessionId}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/50 transition-all font-semibold"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;