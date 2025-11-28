import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Search, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import config from '../config';

import MarketOverviewSkeleton from './MarketOverviewSkeleton';
import { Skeleton } from './ui/Skeleton';


const MarketOverview = () => {
    const [symbol, setSymbol] = useState('SPY');
    const [searchInput, setSearchInput] = useState('');
    const [chartData, setChartData] = useState([]);
    const [marketSummary, setMarketSummary] = useState(null);
    const [stockSummary, setStockSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedRange, setSelectedRange] = useState('1Y');
    const [viewMode, setViewMode] = useState('MARKET'); // 'MARKET' or 'STOCK'

    const timeRanges = [
        { label: '1D', period: '1d', interval: '5m' },
        { label: '1W', period: '5d', interval: '15m' },
        { label: '1M', period: '1mo', interval: '1d' },
        { label: '3M', period: '3mo', interval: '1d' },
        { label: '1Y', period: '1y', interval: '1d' },
        { label: 'ALL', period: 'max', interval: '1wk' }
    ];

    useEffect(() => {
        fetchChartData(symbol, '1y', '1d');
        fetchMarketSummary();
    }, []);

    const fetchChartData = async (sym, period, interval) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${config.API_URL}/api/finance/chart`, {
                params: { symbol: sym, period, interval }
            });
            setChartData(response.data);
            setSymbol(sym);
        } catch (err) {
            console.error('Error fetching chart data:', err);
            setError(`Failed to fetch chart data for ${sym}. Please try a valid symbol.`);
        } finally {
            setLoading(false);
        }
    };

    const fetchStockSummary = async (sym) => {
        try {
            const response = await axios.get(`${config.API_URL}/api/finance/stock-summary`, {
                params: { symbol: sym }
            });
            setStockSummary(response.data);
            setViewMode('STOCK');
        } catch (err) {
            console.error('Error fetching stock summary:', err);
        }
    };

    const handleRangeChange = (range) => {
        setSelectedRange(range.label);
        fetchChartData(symbol, range.period, range.interval);
    };

    const fetchMarketSummary = async () => {
        try {
            const response = await axios.get(`${config.API_URL}/api/finance/market-summary`);
            setMarketSummary(response.data);
        } catch (err) {
            console.error('Error fetching market summary:', err);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            const sym = searchInput.toUpperCase();
            const currentRange = timeRanges.find(r => r.label === selectedRange);
            fetchChartData(sym, currentRange.period, currentRange.interval);
            fetchStockSummary(sym);
            setSearchInput('');
        }
    };

    const handleIndexClick = (indexSymbol) => {
        const currentRange = timeRanges.find(r => r.label === selectedRange);
        fetchChartData(indexSymbol, currentRange.period, currentRange.interval);
        // Keep viewMode as MARKET when clicking indices
    };

    const handleBackToMarket = () => {
        setViewMode('MARKET');
        const currentRange = timeRanges.find(r => r.label === selectedRange);
        fetchChartData('SPY', currentRange.period, currentRange.interval);
    };

    if (loading && !chartData.length) {
        return <MarketOverviewSkeleton />;
    }

    return (
        <motion.div
            className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <h2 className="text-2xl font-bold text-white mr-4">Market Overview</h2>
                    {viewMode === 'STOCK' && (
                        <button
                            onClick={handleBackToMarket}
                            className="text-xs bg-gray-700 hover:bg-gray-600 text-blue-400 px-3 py-1 rounded-full transition-colors"
                        >
                            ← Back to Market
                        </button>
                    )}
                </div>
                <form onSubmit={handleSearch} className="flex items-center">
                    <div className="relative flex">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search Symbol"
                            className="bg-gray-700 text-white px-4 py-2 rounded-l-lg focus:outline-none focus:ring-blue-500 w-48"
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors"
                        >
                            <Search size={20} />
                        </button>
                    </div>
                </form>
            </div>

            {/* Chart Section */}
            <div className="mb-6 flex-grow">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-300">{symbol} Performance</h3>
                    <div className="flex space-x-2 bg-gray-700 rounded-lg p-1">
                        {timeRanges.map((range) => (
                            <button
                                key={range.label}
                                onClick={() => handleRangeChange(range)}
                                className={`px-3 py-1 text-xs rounded-md transition-colors ${selectedRange === range.label
                                    ? 'bg-blue-600 text-white font-bold'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-600'
                                    }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>
                {loading ? (
                    <div className="bg-gray-900 rounded-xl p-4 h-96">
                        <Skeleton className="w-full h-full rounded-lg" />
                    </div>
                ) : error ? (
                    <div className="flex flex-col justify-center items-center h-96 bg-gray-900 rounded-xl text-red-400">
                        <AlertCircle size={48} className="mb-2" />
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="bg-gray-900 rounded-xl p-4 h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#9CA3AF"
                                    style={{ fontSize: '10px' }}
                                    tickFormatter={(tick) => tick.substring(5)} // Show MM-DD
                                />
                                <YAxis
                                    stroke="#9CA3AF"
                                    style={{ fontSize: '10px' }}
                                    domain={['auto', 'auto']}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: 'none',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    }}
                                    itemStyle={{ color: '#E5E7EB' }}
                                    labelStyle={{ color: '#9CA3AF' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="close"
                                    stroke="#3B82F6"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 6, fill: '#3B82F6' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Info Grid - Conditional Rendering based on View Mode */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-auto">

                {/* Left Column */}
                {viewMode === 'MARKET' && marketSummary ? (
                    <div className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-white flex items-center">
                                Daily Market Pulse
                                <span className={`ml-3 text-xs px-2 py-1 rounded-full ${marketSummary.marketColor === 'green' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                    {marketSummary.marketStatus}
                                </span>
                            </h3>
                            <span className="text-xs text-gray-400">
                                {new Date(marketSummary.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-3 leading-relaxed">{marketSummary.summary}</p>
                        <div className="space-y-1">
                            {marketSummary.bullets.map((bullet, index) => (
                                <div key={index} className="flex items-start text-xs text-gray-400">
                                    <span className="mr-2 mt-1">•</span>
                                    <span>{bullet}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : viewMode === 'STOCK' && stockSummary ? (
                    <div className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-white flex items-center">
                                Stock Pulse: {stockSummary.metrics.name}
                                <span className={`ml-3 text-xs px-2 py-1 rounded-full ${stockSummary.metrics.changePercent >= 0 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                    {stockSummary.metrics.changePercent >= 0 ? '+' : ''}{stockSummary.metrics.changePercent.toFixed(2)}%
                                </span>
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-800 p-3 rounded-lg">
                                <p className="text-xs text-gray-400">Price</p>
                                <p className="text-lg font-bold text-white">${stockSummary.metrics.price.toFixed(2)}</p>
                            </div>
                            <div className="bg-gray-800 p-3 rounded-lg">
                                <p className="text-xs text-gray-400">Market Cap</p>
                                <p className="text-lg font-bold text-white">${(stockSummary.metrics.marketCap / 1e9).toFixed(2)}B</p>
                            </div>
                            <div className="bg-gray-800 p-3 rounded-lg">
                                <p className="text-xs text-gray-400">P/E Ratio</p>
                                <p className="text-lg font-bold text-white">{stockSummary.metrics.peRatio ? stockSummary.metrics.peRatio.toFixed(2) : 'N/A'}</p>
                            </div>
                            <div className="bg-gray-800 p-3 rounded-lg">
                                <p className="text-xs text-gray-400">52W High</p>
                                <p className="text-lg font-bold text-white">${stockSummary.metrics.fiftyTwoWeekHigh ? stockSummary.metrics.fiftyTwoWeekHigh.toFixed(2) : 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                ) : null}

                {/* Right Column */}
                {viewMode === 'MARKET' && marketSummary ? (
                    <div className="bg-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                            <TrendingUp className="mr-2" size={20} />
                            Market Snapshot
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-300">
                                <thead className="text-xs text-gray-400 uppercase bg-gray-800">
                                    <tr>
                                        <th className="px-3 py-2 rounded-l-lg">Index</th>
                                        <th className="px-3 py-2">Price</th>
                                        <th className="px-3 py-2 rounded-r-lg">Change</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {marketSummary.indices && marketSummary.indices.map((index) => (
                                        <tr
                                            key={index.symbol}
                                            className="border-b border-gray-600 hover:bg-gray-600 cursor-pointer transition-colors"
                                            onClick={() => handleIndexClick(index.symbol)}
                                        >
                                            <td className="px-3 py-2 font-medium text-white">
                                                {index.name}
                                                <span className="block text-xs text-gray-500">{index.symbol}</span>
                                            </td>
                                            <td className="px-3 py-2">${index.price.toFixed(2)}</td>
                                            <td className={`px-3 py-2 font-bold ${index.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : viewMode === 'STOCK' && stockSummary ? (
                    <div className="bg-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                            <TrendingUp className="mr-2" size={20} />
                            AI Insight
                        </h3>
                        <div className="mb-3">
                            <p className="text-sm text-gray-300 mb-1"><span className="font-bold text-blue-400">Outlook:</span> {stockSummary.analysis.outlook}</p>
                            <p className="text-sm text-gray-300"><span className="font-bold text-purple-400">Est. Price:</span> ${stockSummary.analysis.estimatedPrice}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-gray-400 uppercase">Recent News</p>
                            {stockSummary.analysis.news.map((item, index) => (
                                <div key={index} className="bg-gray-800 p-2 rounded border-l-2 border-blue-500">
                                    <p className="text-xs text-white font-medium truncate">{item.title}</p>
                                    <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                                        <span>{item.source}</span>
                                        <span>{item.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>
        </motion.div>
    );
};

export default MarketOverview;