import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, AlertCircle, PieChart, BarChart3, Activity, Shield } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';
import axios from 'axios';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('risk');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [riskRes, performanceRes] = await Promise.all([
        axios.get('http://localhost:5000/api/analytics/portfolio-risk', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/analytics/performance', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setRiskAnalysis(riskRes.data);
      setPerformance(performanceRes.data);

      // Fetch predictions for top holdings
      if (performanceRes.data.stockPerformance) {
        const topStocks = performanceRes.data.stockPerformance.slice(0, 5);
        const predictionPromises = topStocks.map(stock => 
          axios.get(`http://localhost:5000/api/analytics/prediction/${stock.symbol}`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(err => ({ data: null }))
        );
        
        const predictionResults = await Promise.all(predictionPromises);
        setPredictions(predictionResults.filter(res => res.data).map(res => res.data));
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Low': return 'text-green-400';
      case 'Moderate': return 'text-yellow-400';
      case 'High': return 'text-orange-400';
      case 'Very High': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getPredictionColor = (prediction) => {
    switch (prediction) {
      case 'bullish': return 'text-green-400';
      case 'bearish': return 'text-red-400';
      case 'neutral': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getPredictionIcon = (prediction) => {
    switch (prediction) {
      case 'bullish': return <TrendingUp className="w-5 h-5" />;
      case 'bearish': return <TrendingDown className="w-5 h-5" />;
      case 'neutral': return <Activity className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Portfolio Analytics</h1>
          <p className="text-gray-400">Advanced analysis of your investment portfolio</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('risk')}
          className={`pb-2 px-1 font-medium ${
            activeTab === 'risk'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Risk Analysis
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`pb-2 px-1 font-medium ${
            activeTab === 'performance'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Performance
        </button>
        <button
          onClick={() => setActiveTab('predictions')}
          className={`pb-2 px-1 font-medium ${
            activeTab === 'predictions'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          AI Predictions
        </button>
      </div>

      {/* Risk Analysis Tab */}
      {activeTab === 'risk' && riskAnalysis && (
        <div className="space-y-6">
          {/* Risk Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Risk Score</p>
                  <p className={`text-2xl font-bold ${getRiskColor(riskAnalysis.riskLevel)}`}>
                    {riskAnalysis.riskScore}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-orange-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Risk Level</p>
                  <p className={`text-xl font-bold ${getRiskColor(riskAnalysis.riskLevel)}`}>
                    {riskAnalysis.riskLevel}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Volatility</p>
                  <p className="text-2xl font-bold text-white">
                    {riskAnalysis.portfolioVolatility}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-purple-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Diversification</p>
                  <p className="text-2xl font-bold text-green-400">
                    {riskAnalysis.diversificationScore}
                  </p>
                </div>
                <PieChart className="w-8 h-8 text-green-400" />
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Risk Analysis */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Stock Risk Breakdown</h3>
              <div className="space-y-3">
                {riskAnalysis.stockAnalysis.map((stock, index) => (
                  <div key={stock.symbol} className="flex items-center justify-between py-2 border-b border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-white font-medium">{stock.symbol}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-300">{stock.weight}</p>
                      <p className="text-sm text-gray-400">Vol: {stock.volatility}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Risk Recommendations</h3>
              <div className="space-y-3">
                {riskAnalysis.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-700 rounded-lg">
                    <Target className="w-5 h-5 text-blue-400 mt-0.5" />
                    <p className="text-gray-300 text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && performance && (
        <div className="space-y-6">
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Value</p>
                  <p className="text-2xl font-bold text-white">
                    ${performance.totalValue.toFixed(2)}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Return</p>
                  <p className={`text-2xl font-bold ${performance.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${performance.totalReturn.toFixed(2)}
                  </p>
                </div>
                {performance.totalReturn >= 0 ? 
                  <TrendingUp className="w-8 h-8 text-green-400" /> : 
                  <TrendingDown className="w-8 h-8 text-red-400" />
                }
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Return %</p>
                  <p className={`text-2xl font-bold ${performance.totalReturnPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {performance.totalReturnPercent}%
                  </p>
                </div>
                <Activity className="w-8 h-8 text-purple-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Investment</p>
                  <p className="text-2xl font-bold text-white">
                    ${performance.totalInvestment.toFixed(2)}
                  </p>
                </div>
                <Target className="w-8 h-8 text-yellow-400" />
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Portfolio Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performance.performanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                    labelStyle={{ color: '#9CA3AF' }}
                  />
                  <Line type="monotone" dataKey="investment" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Stock Performance */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Stock Performance</h3>
              <div className="space-y-3">
                {performance.stockPerformance.slice(0, 5).map((stock, index) => (
                  <div key={stock.symbol} className="flex items-center justify-between py-2 border-b border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-white font-medium">{stock.symbol}</span>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${stock.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${stock.gainLoss.toFixed(2)}
                      </p>
                      <p className={`text-sm ${stock.gainLossPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stock.gainLossPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Predictions Tab */}
      {activeTab === 'predictions' && (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">AI Stock Predictions</h3>
            
            {predictions.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No predictions available</p>
                <p className="text-gray-500 text-sm">Add stocks to your portfolio to get AI predictions</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {predictions.map((prediction, index) => (
                  <motion.div
                    key={prediction.symbol}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-white">{prediction.symbol}</h4>
                      <div className={`flex items-center space-x-1 ${getPredictionColor(prediction.prediction)}`}>
                        {getPredictionIcon(prediction.prediction)}
                        <span className="font-medium capitalize">{prediction.prediction}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Confidence:</span>
                        <span className="text-white">{prediction.confidence.toFixed(1)}%</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Current Price:</span>
                        <span className="text-white">${prediction.currentPrice.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Target Price:</span>
                        <span className="text-white">${prediction.targetPrice.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <p className="text-xs text-gray-400">{prediction.reasoning}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Analytics;