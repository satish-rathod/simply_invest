import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, ThumbsUp, ThumbsDown, MessageCircle, Share2, TrendingUp, Users, Trophy } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import SocialSkeleton from './SocialSkeleton';
import config from '../config';

const SocialFeed = () => {
  const [posts, setPosts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('feed');
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    type: 'INSIGHT',
    symbol: '',
    tags: []
  });

  useEffect(() => {
    fetchFeedData();
  }, []);

  const fetchFeedData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [feedRes, trendingRes, leaderboardRes] = await Promise.all([
        axios.get(`${config.API_URL}/api/social/feed`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${config.API_URL}/api/social/trending`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${config.API_URL}/api/social/leaderboard`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setPosts(feedRes.data);
      setTrending(trendingRes.data);
      setLeaderboard(leaderboardRes.data);
    } catch (error) {
      console.error('Error fetching social data:', error);
      toast.error('Failed to load social feed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.content.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${config.API_URL}/api/social/posts`, newPost, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPosts([response.data, ...posts]);
      setNewPost({ content: '', type: 'INSIGHT', symbol: '', tags: [] });
      setShowCreatePost(false);
      toast.success('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  };

  const handleUpvote = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${config.API_URL}/api/social/posts/${postId}/upvote`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPosts(posts.map(post =>
        post.id === postId
          ? {
            ...post,
            isUpvoted: response.data.isUpvoted,
            isDownvoted: response.data.isDownvoted,
            upvotesCount: response.data.upvotesCount,
            downvotesCount: response.data.downvotesCount,
            score: response.data.score
          }
          : post
      ));
    } catch (error) {
      console.error('Error toggling upvote:', error);
      toast.error('Failed to upvote post');
    }
  };

  const handleDownvote = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${config.API_URL}/api/social/posts/${postId}/downvote`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPosts(posts.map(post =>
        post.id === postId
          ? {
            ...post,
            isUpvoted: response.data.isUpvoted,
            isDownvoted: response.data.isDownvoted,
            upvotesCount: response.data.upvotesCount,
            downvotesCount: response.data.downvotesCount,
            score: response.data.score
          }
          : post
      ));
    } catch (error) {
      console.error('Error toggling downvote:', error);
      toast.error('Failed to downvote post');
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'BULLISH': return 'text-green-400';
      case 'BEARISH': return 'text-red-400';
      case 'NEUTRAL': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getPostTypeIcon = (type) => {
    switch (type) {
      case 'TRADE': return '💰';
      case 'ANALYSIS': return '📊';
      case 'QUESTION': return '❓';
      case 'NEWS': return '📰';
      default: return '💡';
    }
  };

  if (loading) {
    return <SocialSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Social Trading
            </span>
          </h1>
          <p className="text-gray-300 mt-1">Connect with fellow investors and share insights</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreatePost(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all font-semibold"
        >
          <Plus className="w-5 h-5" />
          <span>Create Post</span>
        </motion.button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('feed')}
          className={`pb-2 px-1 font-medium ${activeTab === 'feed'
            ? 'text-blue-400 border-b-2 border-blue-400'
            : 'text-gray-400 hover:text-white'
            }`}
        >
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Feed</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('trending')}
          className={`pb-2 px-1 font-medium ${activeTab === 'trending'
            ? 'text-blue-400 border-b-2 border-blue-400'
            : 'text-gray-400 hover:text-white'
            }`}
        >
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Trending</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`pb-2 px-1 font-medium ${activeTab === 'leaderboard'
            ? 'text-blue-400 border-b-2 border-blue-400'
            : 'text-gray-400 hover:text-white'
            }`}
        >
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4" />
            <span>Leaderboard</span>
          </div>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all"
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-medium">
                    {post.author.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-white font-medium">{post.author.name}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500 text-sm">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400 text-sm">
                      {getPostTypeIcon(post.type)} {post.type}
                    </span>
                    {post.symbol && (
                      <>
                        <span className="text-gray-500">•</span>
                        <span className="text-blue-400 font-medium">${post.symbol}</span>
                      </>
                    )}
                    {post.sentiment && (
                      <>
                        <span className="text-gray-500">•</span>
                        <span className={`font-medium ${getSentimentColor(post.sentiment)}`}>
                          {post.sentiment}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-gray-300 mb-4">{post.content}</p>

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center space-x-6 text-gray-400">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleUpvote(post.id)}
                        className={`flex items-center space-x-1 hover:text-green-400 transition-colors ${post.isUpvoted ? 'text-green-400' : ''
                          }`}
                      >
                        <ThumbsUp className={`w-4 h-4 ${post.isUpvoted ? 'fill-current' : ''}`} />
                        <span>{post.upvotesCount || 0}</span>
                      </button>
                      <span className={`font-medium ${post.score > 0 ? 'text-green-400' : post.score < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                        {post.score || 0}
                      </span>
                      <button
                        onClick={() => handleDownvote(post.id)}
                        className={`flex items-center space-x-1 hover:text-red-400 transition-colors ${post.isDownvoted ? 'text-red-400' : ''
                          }`}
                      >
                        <ThumbsDown className={`w-4 h-4 ${post.isDownvoted ? 'fill-current' : ''}`} />
                        <span>{post.downvotesCount || 0}</span>
                      </button>
                    </div>
                    <button className="flex items-center space-x-2 hover:text-blue-400 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.commentsCount}</span>
                    </button>
                    <button className="flex items-center space-x-2 hover:text-gray-300 transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'trending' && (
        <div className="space-y-4">
          {trending.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 border-l-4 border-l-yellow-400 hover:border-gray-600 transition-all"
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-white font-medium">{post.author.name}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-yellow-400 text-sm font-medium">TRENDING</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500 text-sm">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-4">{post.content}</p>
                  <div className="flex items-center space-x-6 text-gray-400">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center space-x-1 text-green-400">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{post.upvotesCount || 0}</span>
                      </span>
                      <span className={`font-medium ${post.score > 0 ? 'text-green-400' : post.score < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                        {post.score || 0}
                      </span>
                      <span className="flex items-center space-x-1 text-red-400">
                        <ThumbsDown className="w-4 h-4" />
                        <span>{post.downvotesCount || 0}</span>
                      </span>
                    </div>
                    <span className="flex items-center space-x-2">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.commentsCount}</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Top Performers
            </span>
          </h2>
          <div className="space-y-4">
            {leaderboard.map((entry, index) => (
              <div key={entry.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-700 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${index === 0 ? 'bg-yellow-500 text-black' :
                  index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-amber-600 text-black' :
                      'bg-gray-600 text-white'
                  }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{entry.user.name}</p>
                  <p className="text-gray-400 text-sm">Equity: ${entry.metrics.totalEquity?.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-medium">{entry.metrics.returnPercentage}%</p>
                  <p className="text-gray-400 text-sm">Score: {entry.metrics.score}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowCreatePost(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glassmorphic rounded-xl p-8 w-full max-w-md border border-gray-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Create Post
              </span>
            </h3>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={newPost.type}
                  onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="INSIGHT">Insight</option>
                  <option value="TRADE">Trade</option>
                  <option value="ANALYSIS">Analysis</option>
                  <option value="QUESTION">Question</option>
                  <option value="NEWS">News</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Symbol (Optional)
                </label>
                <input
                  type="text"
                  value={newPost.symbol}
                  onChange={(e) => setNewPost({ ...newPost, symbol: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., AAPL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Content
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                  placeholder="Share your thoughts, analysis, or insights..."
                  required
                />
              </div>

              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 px-4 rounded-lg transition-all font-semibold shadow-lg hover:shadow-blue-500/50"
                >
                  Post
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setShowCreatePost(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-all font-semibold"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SocialFeed;