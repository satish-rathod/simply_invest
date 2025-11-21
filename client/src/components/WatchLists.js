import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, List, Eye, TrendingUp, TrendingDown, Star, Edit, Trash2, Search } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const WatchLists = () => {
  const [watchLists, setWatchLists] = useState([]);
  const [selectedWatchList, setSelectedWatchList] = useState(null);
  const [watchListData, setWatchListData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateWatchList, setShowCreateWatchList] = useState(false);
  const [showAddSymbol, setShowAddSymbol] = useState(false);
  const [watchListForm, setWatchListForm] = useState({
    name: '',
    symbols: []
  });
  const [newSymbol, setNewSymbol] = useState('');

  useEffect(() => {
    fetchWatchLists();
  }, []);

  useEffect(() => {
    if (selectedWatchList) {
      fetchWatchListData(selectedWatchList);
    }
  }, [selectedWatchList]);

  const fetchWatchLists = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/watchlists', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWatchLists(response.data);
      if (response.data.length > 0 && !selectedWatchList) {
        setSelectedWatchList(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching watch lists:', error);
      toast.error('Failed to load watch lists');
    } finally {
      setLoading(false);
    }
  };

  const fetchWatchListData = async (watchListId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5001/api/watchlists/${watchListId}/prices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWatchListData(response.data);
    } catch (error) {
      console.error('Error fetching watch list data:', error);
      toast.error('Failed to load watch list data');
    }
  };

  const handleCreateWatchList = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5001/api/watchlists', watchListForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Watch list created successfully');
      setShowCreateWatchList(false);
      setWatchListForm({ name: '', symbols: [] });
      fetchWatchLists();
      setSelectedWatchList(response.data.id);
    } catch (error) {
      console.error('Error creating watch list:', error);
      toast.error(error.response?.data?.message || 'Failed to create watch list');
    }
  };

  const handleAddSymbol = async (e) => {
    e.preventDefault();
    if (!selectedWatchList || !newSymbol.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5001/api/watchlists/${selectedWatchList}/add-symbol`,
        { symbol: newSymbol.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Symbol added successfully');
      setShowAddSymbol(false);
      setNewSymbol('');
      fetchWatchLists();
      fetchWatchListData(selectedWatchList);
    } catch (error) {
      console.error('Error adding symbol:', error);
      toast.error(error.response?.data?.message || 'Failed to add symbol');
    }
  };

  const handleRemoveSymbol = async (symbol) => {
    if (!selectedWatchList) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5001/api/watchlists/${selectedWatchList}/remove-symbol`,
        { symbol },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Symbol removed successfully');
      fetchWatchLists();
      fetchWatchListData(selectedWatchList);
    } catch (error) {
      console.error('Error removing symbol:', error);
      toast.error('Failed to remove symbol');
    }
  };

  const handleDeleteWatchList = async (watchListId) => {
    if (!window.confirm('Are you sure you want to delete this watch list?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5001/api/watchlists/${watchListId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Watch list deleted successfully');
      fetchWatchLists();

      // If we deleted the selected watch list, select another one
      if (selectedWatchList === watchListId) {
        const remaining = watchLists.filter(wl => wl.id !== watchListId);
        setSelectedWatchList(remaining.length > 0 ? remaining[0].id : null);
        setWatchListData(null);
      }
    } catch (error) {
      console.error('Error deleting watch list:', error);
      toast.error('Failed to delete watch list');
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
          <h1 className="text-2xl font-bold text-white">Watch Lists</h1>
          <p className="text-gray-400">Track your favorite stocks and monitor their performance</p>
        </div>
        <button
          onClick={() => setShowCreateWatchList(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Watch List</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Watch Lists Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800 rounded-lg p-4"
        >
          <h2 className="text-lg font-semibold text-white mb-4">My Watch Lists</h2>

          {watchLists.length === 0 ? (
            <div className="text-center py-8">
              <List className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400">No watch lists yet</p>
              <p className="text-gray-500 text-sm">Create your first watch list</p>
            </div>
          ) : (
            <div className="space-y-2">
              {watchLists.map((watchList) => (
                <motion.div
                  key={watchList.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedWatchList === watchList.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  onClick={() => setSelectedWatchList(watchList.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{watchList.name}</p>
                      <p className="text-sm opacity-75">{watchList.symbols.length} symbols</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWatchList(watchList.id);
                      }}
                      className="p-1 rounded hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Watch List Content */}
        <div className="lg:col-span-3">
          {selectedWatchList && watchListData ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">{watchListData.name}</h2>
                  <p className="text-gray-400">{watchListData.symbols.length} symbols</p>
                </div>
                <button
                  onClick={() => setShowAddSymbol(true)}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Symbol</span>
                </button>
              </div>

              {watchListData.symbolsWithData && watchListData.symbolsWithData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-gray-400 text-sm">
                        <th className="text-left pb-3">Symbol</th>
                        <th className="text-left pb-3">Name</th>
                        <th className="text-right pb-3">Price</th>
                        <th className="text-right pb-3">Change</th>
                        <th className="text-right pb-3">Change %</th>
                        <th className="text-right pb-3">Volume</th>
                        <th className="text-right pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {watchListData.symbolsWithData.map((stock) => (
                        <tr key={stock.symbol} className="border-t border-gray-700">
                          <td className="py-3">
                            <div className="flex items-center space-x-2">
                              <Star className="w-4 h-4 text-yellow-400" />
                              <span className="text-white font-medium">{stock.symbol}</span>
                            </div>
                          </td>
                          <td className="py-3 text-gray-300">{stock.name || stock.symbol}</td>
                          <td className="py-3 text-right text-white font-medium">
                            ${stock.price?.toFixed(2) || 'N/A'}
                          </td>
                          <td className={`py-3 text-right ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                            {stock.change >= 0 ? '+' : ''}
                            ${stock.change?.toFixed(2) || 'N/A'}
                          </td>
                          <td className={`py-3 text-right ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                            <div className="flex items-center justify-end space-x-1">
                              {stock.changePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                              <span>
                                {stock.changePercent >= 0 ? '+' : ''}
                                {stock.changePercent?.toFixed(2) || 'N/A'}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 text-right text-gray-300">
                            {stock.volume ? stock.volume.toLocaleString() : 'N/A'}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleRemoveSymbol(stock.symbol)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No symbols in this watch list</p>
                  <p className="text-gray-500 text-sm">Add some symbols to start tracking</p>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-center py-12">
                <List className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Select a watch list to view</p>
                <p className="text-gray-500 text-sm">Or create a new watch list to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Watch List Modal */}
      <AnimatePresence>
        {showCreateWatchList && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-white mb-4">Create Watch List</h3>

              <form onSubmit={handleCreateWatchList} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Watch List Name
                  </label>
                  <input
                    type="text"
                    value={watchListForm.name}
                    onChange={(e) => setWatchListForm({ ...watchListForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Tech Stocks"
                    required
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateWatchList(false)}
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

      {/* Add Symbol Modal */}
      <AnimatePresence>
        {showAddSymbol && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-white mb-4">Add Symbol</h3>

              <form onSubmit={handleAddSymbol} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Stock Symbol
                  </label>
                  <input
                    type="text"
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., AAPL"
                    required
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Add Symbol
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddSymbol(false)}
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

export default WatchLists;