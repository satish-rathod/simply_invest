import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, TrendingDown, DollarSign, Activity, ArrowDownCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import axios from 'axios';
import toast from 'react-hot-toast';
import PortfolioSkeleton from './PortfolioSkeleton';
import config from '../config';

const VirtualTrading = () => {
    const [portfolio, setPortfolio] = useState(null);
    const [performance, setPerformance] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBuyStock, setShowBuyStock] = useState(false);
    const [showSellStock, setShowSellStock] = useState(false);
    const [virtualBalance, setVirtualBalance] = useState(0);
    const [selectedHolding, setSelectedHolding] = useState(null);
    const [stockForm, setStockForm] = useState({
        symbol: '',
        quantity: '',
        price: ''
    });
    const [sellForm, setSellForm] = useState({
        quantity: ''
    });

    const fetchPortfolioData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const [portfolioRes, performanceRes, transactionsRes, profileRes] = await Promise.all([
                axios.get(`${config.API_URL}/api/portfolio?type=VIRTUAL`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${config.API_URL}/api/portfolio/performance?type=VIRTUAL`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${config.API_URL}/api/portfolio/transactions?type=VIRTUAL`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${config.API_URL}/api/auth/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setPortfolio(portfolioRes.data);
            setPerformance(performanceRes.data);
            setTransactions(transactionsRes.data);
            setVirtualBalance(profileRes.data.virtualBalance);
        } catch (error) {
            if (error.response?.status === 404) {
                // Create portfolio if it doesn't exist
                await createPortfolio();
            } else {
                console.error('Error fetching portfolio:', error);
                toast.error('Failed to load portfolio data');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPortfolioData();
    }, [fetchPortfolioData]);

    const createPortfolio = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${config.API_URL}/api/portfolio`, { type: 'VIRTUAL' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPortfolio(response.data);
            setPerformance({
                totalValue: 0,
                totalInvestment: 0,
                totalGainLoss: 0,
                totalGainLossPercent: 0,
                holdingsCount: 0,
                topPerformers: [],
                recentTransactions: []
            });
        } catch (error) {
            console.error('Error creating portfolio:', error);
            toast.error('Failed to create portfolio');
        }
    };

    const handleBuyStock = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            // Convert quantity to number to prevent string concatenation bug
            await axios.post(`${config.API_URL}/api/portfolio/add-stock`, {
                symbol: stockForm.symbol,
                quantity: Number(stockForm.quantity),
                type: 'VIRTUAL'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Stock bought successfully');
            setShowBuyStock(false);
            setStockForm({ symbol: '', quantity: '' });
            fetchPortfolioData();
        } catch (error) {
            console.error('Error buying stock:', error);
            toast.error(error.response?.data?.message || 'Failed to buy stock');
        }
    };

    const openSellModal = (holding) => {
        setSelectedHolding(holding);
        setSellForm({
            quantity: ''
        });
        setShowSellStock(true);
    };

    const handleSellStock = async (e) => {
        e.preventDefault();
        try {
            const quantity = parseFloat(sellForm.quantity);

            if (quantity > selectedHolding.quantity) {
                toast.error('Cannot sell more than you own');
                return;
            }

            if (quantity <= 0) {
                toast.error('Quantity must be greater than 0');
                return;
            }

            const token = localStorage.getItem('token');
            await axios.post(`${config.API_URL}/api/portfolio/remove-stock`,
                {
                    symbol: selectedHolding.symbol,
                    quantity,
                    type: 'VIRTUAL'
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success('Stock sold successfully');
            setShowSellStock(false);
            setSelectedHolding(null);
            setSellForm({ quantity: '' });
            fetchPortfolioData();
        } catch (error) {
            console.error('Error selling stock:', error);
            toast.error(error.response?.data?.message || 'Failed to sell stock');
        }
    };

    const getPieChartData = () => {
        if (!portfolio?.holdings) return [];

        return portfolio.holdings.map(holding => ({
            name: holding.symbol,
            value: holding.currentPrice * holding.quantity,
            percentage: ((holding.currentPrice * holding.quantity) / portfolio.totalValue * 100).toFixed(1)
        }));
    };

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

    if (loading) {
        return <PortfolioSkeleton />;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Virtual Trading</h1>
                <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg">
                    <span className="text-gray-400">Virtual Balance:</span>
                    <span className="text-xl font-bold text-yellow-400">${virtualBalance?.toFixed(2)}</span>
                </div>
            </div>

            {/* Portfolio Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-800 rounded-lg p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Portfolio Value</p>
                            <p className="text-2xl font-bold text-white">
                                ${performance?.totalValue?.toFixed(2) || '0.00'}
                            </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-400" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-800 rounded-lg p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Gain/Loss</p>
                            <p className={`text - 2xl font - bold ${performance?.totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'} `}>
                                ${performance?.totalGainLoss?.toFixed(2) || '0.00'}
                            </p>
                        </div>
                        {performance?.totalGainLoss >= 0 ?
                            <TrendingUp className="w-8 h-8 text-green-400" /> :
                            <TrendingDown className="w-8 h-8 text-red-400" />
                        }
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-800 rounded-lg p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Return %</p>
                            <p className={`text - 2xl font - bold ${performance?.totalGainLossPercent >= 0 ? 'text-green-400' : 'text-red-400'} `}>
                                {performance?.totalGainLossPercent?.toFixed(2) || '0.00'}%
                            </p>
                        </div>
                        <Activity className="w-8 h-8 text-purple-400" />
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Holdings Table */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gray-800 rounded-lg p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">Your Positions</h2>
                        <button
                            onClick={() => setShowBuyStock(true)}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Buy Stock</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-gray-400 text-sm">
                                    <th className="text-left pb-2">Symbol</th>
                                    <th className="text-right pb-2">Qty</th>
                                    <th className="text-right pb-2">Avg Price</th>
                                    <th className="text-right pb-2">Current</th>
                                    <th className="text-right pb-2">P&L</th>
                                    <th className="text-right pb-2">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {portfolio?.holdings?.map((holding) => {
                                    const gainLoss = (holding.currentPrice - holding.averagePrice) * holding.quantity;
                                    const gainLossPercent = ((holding.currentPrice - holding.averagePrice) / holding.averagePrice) * 100;

                                    return (
                                        <tr key={holding.symbol} className="border-t border-gray-700">
                                            <td className="py-3 text-white font-medium">{holding.symbol}</td>
                                            <td className="py-3 text-right text-gray-300">{holding.quantity}</td>
                                            <td className="py-3 text-right text-gray-300">${holding.averagePrice.toFixed(2)}</td>
                                            <td className="py-3 text-right text-gray-300">${holding.currentPrice.toFixed(2)}</td>
                                            <td className={`py - 3 text - right ${gainLoss >= 0 ? 'text-green-400' : 'text-red-400'} `}>
                                                ${gainLoss.toFixed(2)} ({gainLossPercent.toFixed(2)}%)
                                            </td>
                                            <td className="py-3 text-right">
                                                <button
                                                    onClick={() => openSellModal(holding)}
                                                    className="text-blue-400 hover:text-blue-300"
                                                    title="Sell stock"
                                                >
                                                    <ArrowDownCircle className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {(!portfolio?.holdings || portfolio.holdings.length === 0) && (
                            <div className="text-center py-8 text-gray-400">
                                No active positions. Start trading to build your virtual portfolio!
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Portfolio Allocation */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gray-800 rounded-lg p-6"
                >
                    <h2 className="text-xl font-bold text-white mb-4">Allocation</h2>

                    {portfolio?.holdings?.length > 0 ? (
                        <div className="flex items-center justify-center">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={getPieChartData()}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percentage }) => `${name} ${percentage}% `}
                                    >
                                        {getPieChartData().map((entry, index) => (
                                            <Cell key={`cell - ${index} `} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `$${value.toFixed(2)} `} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            Buy stocks to see your portfolio allocation
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Recent Transactions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-lg p-6"
            >
                <h2 className="text-xl font-bold text-white mb-4">Recent Trades</h2>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-gray-400 text-sm">
                                <th className="text-left pb-2">Date</th>
                                <th className="text-left pb-2">Symbol</th>
                                <th className="text-left pb-2">Type</th>
                                <th className="text-right pb-2">Quantity</th>
                                <th className="text-right pb-2">Price</th>
                                <th className="text-right pb-2">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions?.slice(0, 10).map((transaction) => (
                                <tr key={transaction.id} className="border-t border-gray-700">
                                    <td className="py-3 text-gray-300">
                                        {new Date(transaction.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 text-white font-medium">{transaction.symbol}</td>
                                    <td className="py-3">
                                        <span className={`px - 2 py - 1 rounded text - xs ${transaction.type === 'BUY' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                                            } `}>
                                            {transaction.type}
                                        </span>
                                    </td>
                                    <td className="py-3 text-right text-gray-300">{transaction.quantity}</td>
                                    <td className="py-3 text-right text-gray-300">${transaction.price.toFixed(2)}</td>
                                    <td className="py-3 text-right text-gray-300">${transaction.totalAmount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {transactions?.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                            No trades yet
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Buy Stock Modal */}
            {showBuyStock && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
                    >
                        <h3 className="text-xl font-bold text-white mb-4">Buy Stock</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Trades are executed at current market price.
                        </p>

                        <form onSubmit={handleBuyStock} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Stock Symbol
                                </label>
                                <input
                                    type="text"
                                    value={stockForm.symbol}
                                    onChange={(e) => setStockForm({ ...stockForm, symbol: e.target.value.toUpperCase() })}
                                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., AAPL"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Quantity
                                </label>
                                <input
                                    type="number"
                                    value={stockForm.quantity}
                                    onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Number of shares"
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="bg-gray-700 rounded-lg p-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Available Balance:</span>
                                        <span className="text-white font-semibold">${virtualBalance?.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Buy at Market Price
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowBuyStock(false)}
                                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Sell Stock Modal */}
            {showSellStock && selectedHolding && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
                    >
                        <h3 className="text-xl font-bold text-white mb-4">Sell {selectedHolding.symbol}</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Trades are executed at current market price.
                        </p>

                        <div className="bg-gray-700 rounded-lg p-4 mb-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-400">Owned Quantity</p>
                                    <p className="text-white font-semibold">{selectedHolding.quantity}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Current Price</p>
                                    <p className="text-white font-semibold">${selectedHolding.currentPrice.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSellStock} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Quantity to Sell
                                </label>
                                <input
                                    type="number"
                                    value={sellForm.quantity}
                                    onChange={(e) => setSellForm({ ...sellForm, quantity: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={`Max: ${selectedHolding.quantity} `}
                                    min="1"
                                    max={selectedHolding.quantity}
                                    step="1"
                                    required
                                />
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Sell at Market Price
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowSellStock(false);
                                        setSelectedHolding(null);
                                        setSellForm({ quantity: '' });
                                    }}
                                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default VirtualTrading;
