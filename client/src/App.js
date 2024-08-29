import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, MessageSquare, TrendingUp, Newspaper } from 'lucide-react';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import UserProfile from './components/UserProfile';
import MarketOverview from './components/MarketOverview'; // Add this import
import logoImage from './logo.png';
import defaultProfileImage from './profile1.png';
import NewsSection from './components/NewsSection';


const App = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            try {
                const parsedUserData = JSON.parse(userData);
                setUser(parsedUserData);
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <Router>
        <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 border-l border-gray-700">
            <Header user={user} onLogout={handleLogout} />
            <main className="flex-1 overflow-auto bg-gray-900">
              <Routes>
                            <Route path="/register" element={<Register setUser={setUser} />} />
                            <Route path="/login" element={<Login setUser={setUser} />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/chat" element={<ChatInterface />} />
                            <Route path="/profile" element={user ? <UserProfile user={user} /> : <Login setUser={setUser} />} />
                            <Route path="/market-overview" element={<MarketOverview />} /> {/* Add this route */}
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/news" element={<NewsSection />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </Router>
    );
};

const Sidebar = () => {
    const location = useLocation();

    const navItems = [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: MessageSquare, label: 'Chat', path: '/chat' },
        { icon: TrendingUp, label: 'Market Overview', path: '/market-overview' },
        { icon: Newspaper, label: 'News', path: '/news' },
      ];

    return (
        <aside className="w-64 bg-gray-900 text-white flex flex-col">
            <div className="pt-2 flex flex-col items-center justify-center">
                <div className="w-full max-w-[200px] ">
                    <img src={logoImage} alt="Simply Invest Logo" className="w-full" />
                </div>
            </div>
            <nav className="mt-4 flex-grow">
                {navItems.map((item) => (
                    <Link key={item.path} to={item.path}>
                        <motion.div
                            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                            className={`flex items-center px-6 py-3 ${
                                location.pathname === item.path ? 'bg-gray-800' : ''
                            }`}
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.label}
                        </motion.div>
                    </Link>
                ))}
            </nav>
        </aside>
    );
};


const Header = ({ user, onLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    const getCurrentPageName = () => {
        const path = location.pathname;
        if (path === '/') return 'Dashboard';
        return path.charAt(1).toUpperCase() + path.slice(2);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleMenuItemClick = (action) => {
        setIsMenuOpen(false);
        if (action === 'logout') {
            onLogout();
            navigate('/login');
        }
    };

    return (
        <header className="bg-gray-900 shadow-md border-b border-gray-700">
            <div className="flex items-center justify-between px-6 py-4">
                <h2 className="text-xl font-semibold text-white">{getCurrentPageName()}</h2>
                <div className="relative" ref={menuRef}>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center space-x-2 text-white"
                    >
                        <img
                            src={user?.profileImage || defaultProfileImage}
                            alt="User profile"
                            className="w-8 h-8 rounded-full object-cover"
                        />
                        <span>{user ? user.name : 'Guest'}</span>
                    </motion.button>
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10"
                            >
                                {user ? (
                                    <>
                                        <Link 
                                            to="/profile" 
                                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                                            onClick={() => handleMenuItemClick('profile')}
                                        >
                                            Profile
                                        </Link>
                                        <button 
                                            onClick={() => handleMenuItemClick('logout')} 
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link 
                                            to="/login" 
                                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                                            onClick={() => handleMenuItemClick('login')}
                                        >
                                            Login
                                        </Link>
                                        <Link 
                                            to="/register" 
                                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                                            onClick={() => handleMenuItemClick('register')}
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

export default App;
