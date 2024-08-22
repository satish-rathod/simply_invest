import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import UserProfile from './components/UserProfile';

const App = () => {
    const [user, setUser] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ duration: 0.5 }}
                className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white"
            >
                <nav className="bg-black bg-opacity-50 backdrop-filter backdrop-blur-lg">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <Link to="/" className="flex-shrink-0 flex items-center">
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="text-xl font-bold"
                                    >
                                        SimplyInvest
                                    </motion.div>
                                </Link>
                            </div>
                            <div className="hidden md:flex items-center space-x-4">
                                <NavLink to="/dashboard">Dashboard</NavLink>
                                <NavLink to="/chat">Chat</NavLink>
                                {user ? (
                                    <>
                                        <NavLink to="/profile">{user.name}</NavLink>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleLogout}
                                            className="text-white hover:text-gray-300 transition duration-150 ease-in-out"
                                        >
                                            Logout
                                        </motion.button>
                                    </>
                                ) : (
                                    <>
                                        <NavLink to="/login">Login</NavLink>
                                        <NavLink to="/register">Register</NavLink>
                                    </>
                                )}
                            </div>
                            <div className="md:hidden flex items-center">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-300 focus:outline-none"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                                    </svg>
                                </motion.button>
                            </div>
                        </div>
                    </div>
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="md:hidden"
                            >
                                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                                    <MobileNavLink to="/dashboard">Dashboard</MobileNavLink>
                                    <MobileNavLink to="/chat">Chat</MobileNavLink>
                                    {user ? (
                                        <>
                                            <MobileNavLink to="/profile">{user.name}</MobileNavLink>
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleLogout}
                                                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:text-gray-300 hover:bg-gray-700 transition duration-150 ease-in-out"
                                            >
                                                Logout
                                            </motion.button>
                                        </>
                                    ) : (
                                        <>
                                            <MobileNavLink to="/login">Login</MobileNavLink>
                                            <MobileNavLink to="/register">Register</MobileNavLink>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </nav>

                <main className="flex-grow flex overflow-hidden">
                    <AnimatePresence mode="wait">
                        <Routes>
                            <Route path="/register" element={<Register setUser={setUser} />} />
                            <Route path="/login" element={<Login setUser={setUser} />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/chat" element={<ChatInterface />} />
                            <Route path="/profile" element={user ? <UserProfile user={user} /> : <Navigate to="/login" />} />
                            <Route path="/" element={<Dashboard />} />
                        </Routes>
                    </AnimatePresence>
                </main>
            </motion.div>
        </Router>
    );
};

const NavLink = ({ to, children }) => (
    <Link to={to}>
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
        >
            {children}
        </motion.div>
    </Link>
);

const MobileNavLink = ({ to, children }) => (
    <Link to={to}>
        <motion.div
            whileTap={{ scale: 0.95 }}
            className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-gray-300 hover:bg-gray-700 transition duration-150 ease-in-out"
        >
            {children}
        </motion.div>
    </Link>
);

export default App;