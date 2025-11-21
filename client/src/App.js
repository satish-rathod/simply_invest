import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, MessageSquare, TrendingUp, Newspaper, Briefcase, Bell, List, BarChart3, Settings, User, Users, BookOpen } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import io from 'socket.io-client';

// Import components
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import UserProfile from './components/UserProfile';
import MarketOverview from './components/MarketOverview';
import NewsSection from './components/NewsSection';
import Portfolio from './components/Portfolio';
import Alerts from './components/Alerts';
import WatchLists from './components/WatchLists';
import Analytics from './components/Analytics';
import SettingsComponent from './components/Settings';
import SocialFeed from './components/SocialFeed';
import Education from './components/Education';
import VirtualTrading from './components/VirtualTrading';
import ErrorBoundary from './components/ErrorBoundary';

// Import assets
import logoImage from './logo.png';
import defaultProfileImage from './profile1.png';

const App = () => {
    const [user, setUser] = useState(null);
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            try {
                const parsedUserData = JSON.parse(userData);
                setUser(parsedUserData);

                // Initialize socket connection
                const newSocket = io('http://localhost:5001');
                setSocket(newSocket);

                // Join user room for real-time updates
                newSocket.emit('join-user', parsedUserData.id);

                // Listen for notifications
                newSocket.on('alert-triggered', (alert) => {
                    setNotifications(prev => [...prev, alert]);
                });

                return () => {
                    newSocket.disconnect();
                };
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
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    };

    return (
        <Router>
            <ErrorBoundary>
                <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            className: 'bg-gray-800 text-white',
                            duration: 4000,
                        }}
                    />

                    <Sidebar user={user} />

                    <div className="flex flex-col flex-1 border-l border-gray-700">
                        <Header user={user} onLogout={handleLogout} notifications={notifications} />

                        <main className="flex-1 overflow-auto bg-gray-900">
                            <Routes>
                                <Route path="/register" element={<Register setUser={setUser} />} />
                                <Route path="/login" element={<Login setUser={setUser} />} />
                                <Route path="/dashboard" element={<Dashboard socket={socket} />} />
                                <Route path="/chat" element={<ChatInterface />} />
                                <Route path="/profile" element={user ? <UserProfile user={user} /> : <Login setUser={setUser} />} />
                                <Route path="/market-overview" element={<MarketOverview socket={socket} />} />
                                <Route path="/news" element={<NewsSection />} />
                                <Route path="/portfolio" element={user ? <Portfolio /> : <Login setUser={setUser} />} />
                                <Route path="/alerts" element={user ? <Alerts /> : <Login setUser={setUser} />} />
                                <Route path="/watchlists" element={user ? <WatchLists /> : <Login setUser={setUser} />} />
                                <Route path="/analytics" element={user ? <Analytics /> : <Login setUser={setUser} />} />
                                <Route path="/social" element={user ? <SocialFeed /> : <Login setUser={setUser} />} />
                                <Route path="/virtual-trading" element={user ? <VirtualTrading /> : <Login setUser={setUser} />} />
                                <Route path="/education" element={<Education />} />
                                <Route path="/settings" element={user ? <SettingsComponent /> : <Login setUser={setUser} />} />
                                <Route path="/" element={<Dashboard socket={socket} />} />
                            </Routes>
                        </main>
                    </div>
                </div>
            </ErrorBoundary>
        </Router>
    );
};

const Sidebar = ({ user }) => {
    const location = useLocation();

    const navItems = [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: Briefcase, label: 'Portfolio', path: '/portfolio', requiresAuth: true },
        { icon: TrendingUp, label: 'Virtual Trading', path: '/virtual-trading', requiresAuth: true },
        { icon: TrendingUp, label: 'Market Overview', path: '/market-overview' },
        { icon: MessageSquare, label: 'AI Chat', path: '/chat' },
        { icon: List, label: 'Watch Lists', path: '/watchlists', requiresAuth: true },
        { icon: Bell, label: 'Alerts', path: '/alerts', requiresAuth: true },
        { icon: BarChart3, label: 'Analytics', path: '/analytics', requiresAuth: true },
        { icon: Users, label: 'Social', path: '/social', requiresAuth: true },
        { icon: BookOpen, label: 'Education', path: '/education' },
        { icon: Newspaper, label: 'News', path: '/news' },
    ];

    const filteredNavItems = navItems.filter(item =>
        !item.requiresAuth || (item.requiresAuth && user)
    );

    return (
        <aside className="w-64 bg-gray-900 text-white flex flex-col">
            <div className="pt-2 flex flex-col items-center justify-center">
                <div className="w-full max-w-[200px]">
                    <img src={logoImage} alt="Simply Invest Logo" className="w-full" />
                </div>
            </div>

            <nav className="mt-4 flex-grow">
                {filteredNavItems.map((item) => (
                    <Link key={item.path} to={item.path}>
                        <motion.div
                            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                            className={`flex items-center px-6 py-3 ${location.pathname === item.path ? 'bg-gray-800 border-r-2 border-blue-500' : ''
                                }`}
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.label}
                        </motion.div>
                    </Link>
                ))}
            </nav>

            {/* User section at bottom */}
            {user && (
                <div className="p-4 border-t border-gray-700">
                    <Link to="/settings">
                        <motion.div
                            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                            className="flex items-center px-2 py-2 rounded"
                        >
                            <Settings className="w-5 h-5 mr-3" />
                            Settings
                        </motion.div>
                    </Link>
                </div>
            )}
        </aside>
    );
};

const Header = ({ user, onLogout, notifications }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const menuRef = useRef(null);
    const notificationRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    const getCurrentPageName = () => {
        const path = location.pathname;
        switch (path) {
            case '/': return 'Dashboard';
            case '/dashboard': return 'Dashboard';
            case '/portfolio': return 'Portfolio';
            case '/market-overview': return 'Market Overview';
            case '/chat': return 'AI Chat';
            case '/watchlists': return 'Watch Lists';
            case '/alerts': return 'Alerts';
            case '/analytics': return 'Analytics';
            case '/news': return 'News';
            case '/settings': return 'Settings';
            case '/profile': return 'Profile';
            default: return 'Simply Invest';
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
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

                <div className="flex items-center space-x-4">
                    {/* Real-time market ticker */}
                    <div className="hidden lg:flex items-center space-x-4 text-sm">
                        <div className="text-green-400">SPY: $456.78 ↑</div>
                        <div className="text-red-400">QQQ: $389.45 ↓</div>
                    </div>

                    {/* Notifications */}
                    {user && (
                        <div className="relative" ref={notificationRef}>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className="relative p-2 text-gray-400 hover:text-white"
                            >
                                <Bell className="w-5 h-5" />
                                {notifications.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {notifications.length}
                                    </span>
                                )}
                            </motion.button>

                            <AnimatePresence>
                                {isNotificationOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-md shadow-lg py-2 z-50"
                                    >
                                        <div className="px-4 py-2 text-sm text-gray-400 border-b border-gray-700">
                                            Notifications
                                        </div>
                                        {notifications.length === 0 ? (
                                            <div className="px-4 py-3 text-sm text-gray-400">
                                                No new notifications
                                            </div>
                                        ) : (
                                            notifications.map((notification, index) => (
                                                <div key={index} className="px-4 py-3 text-sm hover:bg-gray-700">
                                                    {notification.message}
                                                </div>
                                            ))
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* User menu */}
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
                                    className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50"
                                >
                                    {user ? (
                                        <>
                                            <Link
                                                to="/profile"
                                                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                                                onClick={() => handleMenuItemClick('profile')}
                                            >
                                                <User className="w-4 h-4 mr-2" />
                                                Profile
                                            </Link>
                                            <Link
                                                to="/settings"
                                                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                                                onClick={() => handleMenuItemClick('settings')}
                                            >
                                                <Settings className="w-4 h-4 mr-2" />
                                                Settings
                                            </Link>
                                            <button
                                                onClick={() => handleMenuItemClick('logout')}
                                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
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
            </div>
        </header>
    );
};

export default App;