import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Bell, TrendingUp, TrendingDown, Volume2, Newspaper, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AlertsSkeleton from './AlertsSkeleton';
import config from '../config';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [alertForm, setAlertForm] = useState({
    symbol: '',
    type: 'PRICE_ABOVE',
    targetValue: ''
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/api/alerts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${config.API_URL}/api/alerts`, alertForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Alert created successfully');
      setShowCreateAlert(false);
      setAlertForm({ symbol: '', type: 'PRICE_ABOVE', targetValue: '' });
      fetchAlerts();
    } catch (error) {
      console.error('Error creating alert:', error);
      toast.error(error.response?.data?.message || 'Failed to create alert');
    }
  };

  const handleToggleAlert = async (id, isActive) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${config.API_URL}/api/alerts/${id}`,
        { isActive: !isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(isActive ? 'Alert deactivated' : 'Alert activated');
      fetchAlerts();
    } catch (error) {
      console.error('Error toggling alert:', error);
      toast.error('Failed to toggle alert');
    }
  };

  const handleDeleteAlert = async (id) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${config.API_URL}/api/alerts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Alert deleted successfully');
      fetchAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast.error('Failed to delete alert');
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'PRICE_ABOVE':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'PRICE_BELOW':
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      case 'VOLUME_SPIKE':
        return <Volume2 className="w-5 h-5 text-yellow-400" />;
      case 'NEWS_MENTION':
        return <Newspaper className="w-5 h-5 text-blue-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getAlertTypeName = (type) => {
    switch (type) {
      case 'PRICE_ABOVE':
        return 'Price Above';
      case 'PRICE_BELOW':
        return 'Price Below';
      case 'VOLUME_SPIKE':
        return 'Volume Spike';
      case 'NEWS_MENTION':
        return 'News Mention';
      default:
        return type;
    }
  };

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
          <h1 className="text-2xl font-bold text-white">Price Alerts</h1>
          <p className="text-gray-400">Set up alerts to stay informed about price movements</p>
        </div>
        <button
          onClick={() => setShowCreateAlert(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Alert</span>
        </button>
      </div>

      {/* Alerts Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Alerts</p>
              <p className="text-2xl font-bold text-white">{alerts.length}</p>
            </div>
            <Bell className="w-8 h-8 text-blue-400" />
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
              <p className="text-gray-400 text-sm">Active Alerts</p>
              <p className="text-2xl font-bold text-green-400">
                {alerts.filter(alert => alert.isActive).length}
              </p>
            </div>
            <ToggleRight className="w-8 h-8 text-green-400" />
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
              <p className="text-gray-400 text-sm">Triggered</p>
              <p className="text-2xl font-bold text-yellow-400">
                {alerts.filter(alert => alert.isTriggered).length}
              </p>
            </div>
            <Bell className="w-8 h-8 text-yellow-400" />
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
              <p className="text-gray-400 text-sm">Inactive</p>
              <p className="text-2xl font-bold text-gray-400">
                {alerts.filter(alert => !alert.isActive).length}
              </p>
            </div>
            <ToggleLeft className="w-8 h-8 text-gray-400" />
          </div>
        </motion.div>
      </div>

      {/* Alerts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-lg p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4">My Alerts</h2>

        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No alerts created yet</p>
            <p className="text-gray-500 text-sm">Create your first alert to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-lg border-l-4 ${alert.isTriggered
                  ? 'bg-yellow-900 border-yellow-400'
                  : alert.isActive
                    ? 'bg-gray-700 border-green-400'
                    : 'bg-gray-700 border-gray-500'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{alert.symbol}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-300">{getAlertTypeName(alert.type)}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-300">${alert.targetValue}</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        Created: {new Date(alert.createdAt).toLocaleDateString()}
                        {alert.isTriggered && (
                          <span className="ml-2 text-yellow-400">
                            • Triggered: {new Date(alert.triggeredAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {alert.message && (
                        <p className="text-sm text-gray-300 mt-1">{alert.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleAlert(alert.id, alert.isActive)}
                      className={`p-2 rounded-lg ${alert.isActive
                        ? 'text-green-400 hover:bg-green-900'
                        : 'text-gray-400 hover:bg-gray-600'
                        }`}
                    >
                      {alert.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-900"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Create Alert Modal */}
      <AnimatePresence>
        {showCreateAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-white mb-4">Create Price Alert</h3>

              <form onSubmit={handleCreateAlert} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Stock Symbol
                  </label>
                  <input
                    type="text"
                    value={alertForm.symbol}
                    onChange={(e) => setAlertForm({ ...alertForm, symbol: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., AAPL"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Alert Type
                  </label>
                  <select
                    value={alertForm.type}
                    onChange={(e) => setAlertForm({ ...alertForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PRICE_ABOVE">Price Above</option>
                    <option value="PRICE_BELOW">Price Below</option>
                    <option value="VOLUME_SPIKE">Volume Spike</option>
                    <option value="NEWS_MENTION">News Mention</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Target Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={alertForm.targetValue}
                    onChange={(e) => setAlertForm({ ...alertForm, targetValue: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Target price or threshold"
                    min="0.01"
                    required
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Create Alert
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateAlert(false)}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Alerts;