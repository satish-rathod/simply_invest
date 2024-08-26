import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { ArrowUpDown } from 'lucide-react';

const MarketOverview = () => {
    const [selectedIndex, setSelectedIndex] = useState('SPY');
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const indices = [
        { name: 'S&P 500 (US)', symbol: 'SPY' },
        { name: 'Dow Jones (US)', symbol: 'DIA' },
        { name: 'Nasdaq (US)', symbol: 'QQQ' },
        { name: 'Russell 2000 (US)', symbol: 'IWM' },
        { name: 'Nifty 50 (India)', symbol: 'NSEI' },
        { name: 'Sensex (India)', symbol: 'BSESN' },
        { name: 'FTSE 100 (UK)', symbol: 'FTSE' },
        { name: 'DAX (Germany)', symbol: 'GDAXI' },
        { name: 'Nikkei 225 (Japan)', symbol: 'N225' },
        { name: 'Hang Seng (Hong Kong)', symbol: 'HSI' },
    ];

    useEffect(() => {
        fetchChartData();
    }, [selectedIndex]);

    const fetchChartData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`http://localhost:5000/api/finance/chart?symbol=${selectedIndex}`);
            setChartData(response.data);
        } catch (err) {
            console.error('Error fetching chart data:', err);
            setError(`Failed to fetch chart data. Please try again later.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            className="bg-gray-800 rounded-lg shadow-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className="text-2xl font-bold mb-6 text-white">Market Overview</h2>
            <div className="mb-6">
                <label htmlFor="index-select" className="block text-sm font-medium text-gray-400 mb-2">
                    Choose an index:
                </label>
                <div className="relative">
                    <select
                        id="index-select"
                        value={selectedIndex}
                        onChange={(e) => setSelectedIndex(e.target.value)}
                        className="block w-full bg-gray-700 border border-gray-600 text-white py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:bg-gray-600 focus:border-gray-500"
                    >
                        {indices.map((index) => (
                            <option key={index.symbol} value={index.symbol}>
                                {index.name}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                        <ArrowUpDown size={20} />
                    </div>
                </div>
            </div>
            {loading && (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
            )}
            {error && (
                <div className="bg-red-500 text-white p-4 rounded-md mb-4">
                    {error}
                </div>
            )}
            {!loading && !error && (
                <div className="bg-gray-900 rounded-xl p-4 h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                                dataKey="date" 
                                stroke="#9CA3AF"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis 
                                stroke="#9CA3AF"
                                style={{ fontSize: '12px' }}
                                domain={['auto', 'auto']}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: 'none',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                }}
                                itemStyle={{ color: '#E5E7EB' }}
                                labelStyle={{ color: '#9CA3AF', fontWeight: 'bold' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="close" 
                                stroke="#10B981" 
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 8, fill: '#10B981', stroke: '#064E3B' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </motion.div>
    );
};

export default MarketOverview;