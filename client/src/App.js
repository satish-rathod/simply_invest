import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import UserProfile from './components/UserProfile';

const App = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <Router>
            <div className="min-h-screen bg-gray-100">
                <nav className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex">
                                <Link to="/" className="flex-shrink-0 flex items-center">
                                    SimplyInvest
                                </Link>
                                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                    <Link to="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                        Dashboard
                                    </Link>
                                    <Link to="/chat" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                        Chat
                                    </Link>
                                </div>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:items-center">
                                {user ? (
                                    <>
                                        <Link to="/profile" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                                            {user.name}
                                        </Link>
                                        <button onClick={handleLogout} className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                                            Login
                                        </Link>
                                        <Link to="/register" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <Routes>
                        <Route path="/register" element={<Register setUser={setUser} />} />
                        <Route path="/login" element={<Login setUser={setUser} />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/chat" element={<ChatInterface />} />
                        <Route path="/profile" element={user ? <UserProfile user={user} /> : <Navigate to="/login" />} />
                        <Route path="/" element={<Dashboard />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;