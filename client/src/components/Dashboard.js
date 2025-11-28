import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Activity, BarChart2 } from 'lucide-react';
import ModernChart from './ModernChart';
import StackedRecommendationCards from './StackedRecommendationCards';
import DashboardSkeleton from './DashboardSkeleton';
import config from '../config';

const Dashboard = () => {
  const [marketData, setMarketData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const authConfig = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const [marketResponse, recommendationsResponse, summaryResponse] = await Promise.all([
          axios.get(`${config.API_URL}/api/stocks/market-details`),
          axios.get(`${config.API_URL}/api/stocks/recommendations`),
          axios.get(`${config.API_URL}/api/dashboard/summary`, authConfig)
        ]);

        const transformedMarketData = marketResponse.data.map(item => ({
          name: item.indicesName,
          value: item.Price
        }));

        setMarketData(transformedMarketData);
        setRecommendations(recommendationsResponse.data);
        setDashboardSummary(summaryResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden p-6 space-y-6">
      {/* Top Row: Portfolio Summary & Market Overview */}
      <div className="flex h-1/2 space-x-6">
        {/* Virtual Portfolio Summary */}
        <motion.div
          className="w-1/3 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-6 flex flex-col hover:-translate-y-1 transition-transform duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Personal Portfolio</h2>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
          </div>
          {dashboardSummary?.portfolio ? (
            <div className="flex flex-col h-full space-y-4">
              {/* Main Stats */}
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Portfolio Value</p>
                  <p className="text-3xl font-bold text-white">
                    ${dashboardSummary.portfolio.totalValue?.toFixed(2) || '0.00'}
                  </p>
                </div>

                {/* Return Percentage */}
                {dashboardSummary.portfolio.totalInvestment > 0 && (
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${((dashboardSummary.portfolio.totalValue - dashboardSummary.portfolio.totalInvestment) / dashboardSummary.portfolio.totalInvestment * 100) >= 0
                      ? 'text-green-400'
                      : 'text-red-400'
                      }`}>
                      {((dashboardSummary.portfolio.totalValue - dashboardSummary.portfolio.totalInvestment) / dashboardSummary.portfolio.totalInvestment * 100).toFixed(2)}%
                    </span>
                    <span className="text-xs text-gray-400">
                      ({dashboardSummary.portfolio.totalGainLoss >= 0 ? '+' : ''}${dashboardSummary.portfolio.totalGainLoss?.toFixed(2) || '0'})
                    </span>
                  </div>
                )}
              </div>

              {/* Secondary Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                  <p className="text-gray-400 text-xs mb-1">Holdings</p>
                  <p className="text-lg font-bold text-white">
                    {dashboardSummary.portfolio.holdingsCount || 0}
                  </p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                  <p className="text-gray-400 text-xs mb-1">Invested</p>
                  <p className="text-lg font-bold text-white">
                    ${dashboardSummary.portfolio.totalInvestment?.toFixed(0) || '0'}
                  </p>
                </div>
              </div>

              {/* Top/Worst Performers */}
              {dashboardSummary.portfolio.topPerformers && dashboardSummary.portfolio.topPerformers.length > 0 && (
                <div className="flex-1 space-y-2 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 font-medium">Top Performers</p>
                  </div>
                  <div className="space-y-2">
                    {dashboardSummary.portfolio.topPerformers.slice(0, 2).map((stock, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-900/30 rounded-lg p-2 border border-gray-700/50">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-8 rounded-full ${stock.gainLoss >= 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
                          <div>
                            <p className="text-sm font-semibold text-white">{stock.symbol}</p>
                            <p className="text-xs text-gray-400">{stock.gainLossPercent?.toFixed(1)}%</p>
                          </div>
                        </div>
                        <p className={`text-sm font-bold ${stock.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stock.gainLoss >= 0 ? '+' : ''}${stock.gainLoss?.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <TrendingUp className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">No portfolio data</p>
              <p className="text-xs mt-1 text-gray-500">Start trading to see stats</p>
            </div>
          )}
        </motion.div>

        {/* Market Overview */}
        <motion.div
          className="w-2/3 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-6 flex flex-col hover:-translate-y-1 transition-transform duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Market Overview</h2>
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-grow">
            <ModernChart data={marketData} />
          </div>
        </motion.div>
      </div>

      {/* Bottom Row: Recent Activity & Recommendations */}
      <div className="flex h-1/2 space-x-6">
        {/* Recent Activity */}
        <motion.div
          className="w-2/3 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-6 flex flex-col hover:-translate-y-1 transition-transform duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Activity (Virtual)</h2>
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-grow overflow-auto">
            {dashboardSummary?.recentTransactions?.length > 0 ? (
              <table className="w-full text-left text-gray-300">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="pb-3 text-gray-400 font-medium text-sm">Date</th>
                    <th className="pb-3 text-gray-400 font-medium text-sm">Symbol</th>
                    <th className="pb-3 text-gray-400 font-medium text-sm">Type</th>
                    <th className="pb-3 text-gray-400 font-medium text-sm">Quantity</th>
                    <th className="pb-3 text-gray-400 font-medium text-sm">Price</th>
                    <th className="pb-3 text-gray-400 font-medium text-sm">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardSummary.recentTransactions.map((tx, index) => (
                    <motion.tr
                      key={tx._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-700/50 last:border-0 hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="py-3 text-sm">{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 font-semibold text-white">{tx.symbol}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${tx.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3">{tx.quantity}</td>
                      <td className="py-3">${tx.price.toLocaleString()}</td>
                      <td className="py-3 font-bold text-white">${tx.totalAmount.toLocaleString()}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Activity className="w-12 h-12 mb-2 opacity-50" />
                <p>No recent transactions</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Recommendations */}
        <motion.div
          className="w-1/3 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-6 flex flex-col hover:-translate-y-1 transition-transform duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recommendations</h2>
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-grow overflow-hidden">
            <StackedRecommendationCards recommendations={recommendations} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;