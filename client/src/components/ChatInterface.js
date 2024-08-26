import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const handleError = (error) => {
    if (error.response && error.response.status === 401) {
      setError('Your session has expired. Please log in again.');
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setError('Failed to send message. Please try again.');
    }
  };

  const fetchChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.get('http://localhost:5000/api/chat/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      handleError(error);
    }
  };


  const formatMessage = (content) => {
    const sections = content.split(/\*\*(?=Introduction|Conclusion)/);

    return sections.map((section, sectionIndex) => {
      if (section.startsWith('Introduction') || section.startsWith('Conclusion')) {
        const [title, ...paragraphs] = section.split('**');
        return (
          <div key={sectionIndex} className="mb-4">
            <h3 className="font-bold text-lg mb-2">{title.trim()}</h3>
            {paragraphs.map((para, paraIndex) => (
              <p key={paraIndex} className="mb-2">{para.trim()}</p>
            ))}
          </div>
        );
      }

      const points = section.split(/\d+\.\s+/);
      return (
        <ol key={sectionIndex} className="list-decimal list-inside mb-4 pl-4">
          {points.filter(point => point.trim()).map((point, pointIndex) => {
            const [title, ...details] = point.split('**');
            return (
              <li key={pointIndex} className="mb-2">
                <strong>{title.trim()}</strong>
                {details.map((detail, detailIndex) => (
                  <p key={detailIndex} className="ml-4 mt-1">{detail.trim()}</p>
                ))}
              </li>
            );
          })}
        </ol>
      );
    });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newMessage = { role: 'user', content: input };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInput('');
    setError('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token); // Add this line
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.post('http://localhost:5000/api/chat/message', 
        { 
          message: input,
          conversationHistory: messages
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Response:', response.data); // Add this line
      const botMessage = { role: 'assistant', content: response.data.response };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      console.log('Error response:', error.response); // Add this line
      handleError(error);
    } finally {
      setIsLoading(false);
    }
};

  return (
    <div className="flex flex-col h-full bg-gray-900 p-4">
      <div className="flex-grow overflow-hidden bg-gray-800 rounded-lg shadow-xl">
        <div className="bg-gray-700 p-4 text-xl font-bold text-white">
          Chat with AI Financial Assistant
        </div>
        <div className="flex flex-col h-[calc(100%-4rem)]">
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="bg-gray-700 p-4">
            {error && (
              <div className="text-red-400 text-center mb-2">
                {error}
              </div>
            )}
            <form onSubmit={sendMessage} className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow p-2 bg-gray-600 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;