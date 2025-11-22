import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Brain,
    BarChart3,
    Users,
    BookOpen,
    Bell,
    Target,
    Shield,
    Zap,
    Globe,
    Award,
    ArrowRight
} from 'lucide-react';
import logoImage from '../logo.png';

const LandingPage = () => {
    const navigate = useNavigate();


    const features = [
        {
            icon: BarChart3,
            title: 'Portfolio Management',
            description: 'Track your investments with real-time P&L analysis and comprehensive portfolio insights.',
            gradient: 'from-blue-500 to-cyan-500'
        },
        {
            icon: Brain,
            title: 'AI Financial Advisor',
            description: 'Get personalized investment advice powered by advanced AI and machine learning.',
            gradient: 'from-purple-500 to-pink-500'
        },
        {
            icon: TrendingUp,
            title: 'Real-time Market Data',
            description: 'Access live stock prices, market updates, and comprehensive financial data.',
            gradient: 'from-green-500 to-emerald-500'
        },
        {
            icon: Target,
            title: 'Virtual Trading',
            description: 'Practice trading strategies risk-free with our advanced virtual trading platform.',
            gradient: 'from-orange-500 to-red-500'
        },
        {
            icon: Users,
            title: 'Social Trading',
            description: 'Follow top traders, share insights, and learn from the investment community.',
            gradient: 'from-indigo-500 to-blue-500'
        },
        {
            icon: BookOpen,
            title: 'Educational Resources',
            description: 'Learn investing fundamentals with structured courses and market insights.',
            gradient: 'from-yellow-500 to-orange-500'
        },
        {
            icon: Bell,
            title: 'Price Alerts',
            description: 'Set custom alerts for price movements and never miss an investment opportunity.',
            gradient: 'from-pink-500 to-rose-500'
        },
        {
            icon: BarChart3,
            title: 'Advanced Analytics',
            description: 'Deep dive into performance metrics, technical analysis, and risk assessment.',
            gradient: 'from-cyan-500 to-blue-500'
        }
    ];

    const benefits = [
        {
            icon: Shield,
            title: 'Secure & Reliable',
            description: 'Bank-level security with encrypted data and secure authentication.'
        },
        {
            icon: Zap,
            title: 'Lightning Fast',
            description: 'Real-time updates and instant execution for all your trading needs.'
        },
        {
            icon: Globe,
            title: 'Global Markets',
            description: 'Access to worldwide markets and comprehensive financial instruments.'
        },
        {
            icon: Award,
            title: 'Expert Insights',
            description: 'AI-powered recommendations backed by market analysis and trends.'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <img src={logoImage} alt="Simply Invest" className="h-10" />
                        </div>
                        <div className="flex items-center space-x-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/login')}
                                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                            >
                                Login
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/register')}
                                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                            >
                                Register
                            </motion.button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                {/* Animated background gradient */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute top-40 left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                                Invest Smarter
                            </span>
                            <br />
                            <span className="text-white">With AI-Powered Insights</span>
                        </h1>
                        <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                            Your completely free analytical platform for portfolio management, market analysis, and social trading.
                            Make informed decisions with real-time data and AI-driven recommendations.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/register')}
                                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all flex items-center gap-2"
                            >
                                Register Now - It's Free
                                <ArrowRight className="w-5 h-5" />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/login')}
                                className="px-8 py-4 bg-gray-800 border border-gray-700 rounded-lg font-semibold text-lg hover:bg-gray-700 transition-all"
                            >
                                Login
                            </motion.button>
                        </div>
                    </motion.div>


                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/50">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                            Powerful Features for
                            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Smart Investors</span>
                        </h2>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Everything you need to manage your investments, analyze markets, and grow your wealth.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all group"
                            >
                                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-gray-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                            Why Choose
                            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Simply Invest?</span>
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
                                    <benefit.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                                <p className="text-gray-400">{benefit.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>





            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
