import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/chat/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
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
    if (!input.trim()) return;

    const newMessage = { role: 'user', content: input };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInput('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/chat/message', 
        { 
          message: input,
          conversationHistory: messages
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const botMessage = { role: 'assistant', content: response.data.response };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      if (error.response && error.response.status === 401) {
        setError('Your session has expired. Please log in again.');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError('Failed to send message. Please try again.');
      }
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>Chat with AI Financial Assistant</CardHeader>
      <CardContent className="flex-grow overflow-auto mb-4">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-4 rounded-lg max-w-[80%] ${
              msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
            }`}>
              {msg.role === 'user' ? (
                <p>{msg.content}</p>
              ) : (
                <div className="prose prose-sm max-w-none">{formatMessage(msg.content)}</div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>
      {error && <div className="text-red-500 text-center mb-2">{error}</div>}
      <form onSubmit={sendMessage} className="flex p-4">
        <Input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Type your message..."
          className="flex-grow mr-2"
        />
        <Button type="submit">Send</Button>
      </form>
    </Card>
  );
};

export default ChatInterface;