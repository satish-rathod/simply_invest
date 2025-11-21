import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import ModernChart from './ModernChart';
import StackedRecommendationCards from './StackedRecommendationCards';

const Dashboard = () => {
  const [marketData, setMarketData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const [marketResponse, recommendationsResponse, summaryResponse] = await Promise.all([
          axios.get('http://localhost:5001/api/stocks/market-details'),
          axios.get('http://localhost:5001/api/stocks/recommendations'),
          axios.get('http://localhost:5001/api/dashboard/summary', config)
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
    return <div className="flex justify-center items-center h-full text-white">Loading...</div>;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden p-6 space-y-6">
      {/* Top Row: Portfolio Summary & Market Overview */}
      <div className="flex h-1/2 space-x-6">
        {/* Portfolio Summary */}
        <motion.div
          className="w-1/3 bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-4 text-white">Virtual Portfolio</h2>
          {dashboardSummary?.portfolio ? (
            <div className="flex flex-col justify-center h-full space-y-4">
              <div>
                <p className="text-gray-400 text-sm">Total Value</p>
                <p className="text-3xl font-bold text-green-400">
                  ${dashboardSummary.portfolio.totalValue.toLocaleString()}
                </p>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Gain/Loss</p>
                  <p className={`text-xl font-semibold ${dashboardSummary.portfolio.totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {dashboardSummary.portfolio.totalGainLoss >= 0 ? '+' : ''}{dashboardSummary.portfolio.totalGainLoss.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Day's Gain</p>
                  <p className={`text-xl font-semibold ${dashboardSummary.portfolio.dayGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {dashboardSummary.portfolio.dayGain >= 0 ? '+' : ''}{dashboardSummary.portfolio.dayGain.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No portfolio data available
            </div>
          )}
        </motion.div>

        {/* Market Overview */}
        <motion.div
          className="w-2/3 bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold mb-4 text-white">Market Overview</h2>
          <div className="flex-grow">
            <ModernChart data={marketData} />
          </div>
        </motion.div>
      </div>

      {/* Bottom Row: Recent Activity & Recommendations */}
      <div className="flex h-1/2 space-x-6">
        {/* Recent Activity */}
        <motion.div
          className="w-2/3 bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold mb-4 text-white">Recent Activity (Virtual)</h2>
          <div className="flex-grow overflow-auto">
            {dashboardSummary?.recentTransactions?.length > 0 ? (
              <table className="w-full text-left text-gray-300">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Symbol</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Quantity</th>
                    <th className="pb-2">Price</th>
                    <th className="pb-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardSummary.recentTransactions.map((tx) => (
                    <tr key={tx._id} className="border-b border-gray-700 last:border-0 hover:bg-gray-700 transition-colors">
                      <td className="py-3">{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 font-semibold text-white">{tx.symbol}</td>
                      <td className={`py-3 ${tx.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>{tx.type}</td>
                      <td className="py-3">{tx.quantity}</td>
                      <td className="py-3">${tx.price.toLocaleString()}</td>
                      <td className="py-3 font-bold text-white">${tx.totalAmount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No recent transactions
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Recommendations */}
        <motion.div
          className="w-1/3 bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold mb-4 text-white">Top Recommendations</h2>
          <div className="flex-grow overflow-hidden">
            <StackedRecommendationCards recommendations={recommendations} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;