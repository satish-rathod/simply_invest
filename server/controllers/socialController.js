import Post from '../models/Post.js';
import Community from '../models/Community.js';
import Following from '../models/Following.js';
import LeaderBoard from '../models/LeaderBoard.js';
import User from '../models/User.js';
import { analyzeSentiment } from '../utils/aiService.js';

// Get feed posts
export const getFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query; // Default limit to 10 as requested

    // Global feed: fetch all posts, sorted by date
    const posts = await Post.find({
      isPrivate: false
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate({
        path: 'userId',
        model: 'User',
        select: 'name email'
      });

    // Add user info and vote status
    const postsWithUserInfo = await Promise.all(posts.map(async (post) => {
      const user = await User.findById(post.userId);
      return {
        ...post.toObject(),
        author: {
          id: user?._id,
          name: user?.name || 'Unknown',
          email: user?.email
        },
        isUpvoted: post.upvotes?.includes(userId) || false,
        isDownvoted: post.downvotes?.includes(userId) || false,
        upvotesCount: post.upvotes?.length || 0,
        downvotesCount: post.downvotes?.length || 0,
        score: (post.upvotes?.length || 0) - (post.downvotes?.length || 0),
        commentsCount: post.comments.length
      };
    }));

    res.json(postsWithUserInfo);
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
};

// Create a new post
export const createPost = async (req, res) => {
  try {
    const { content, type, symbol, tags, tradeDetails } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Analyze sentiment
    const sentiment = analyzeSentiment(content);
    let sentimentLabel = 'NEUTRAL';
    if (sentiment.score > 0.1) sentimentLabel = 'BULLISH';
    else if (sentiment.score < -0.1) sentimentLabel = 'BEARISH';

    const post = new Post({
      userId: req.user.id,
      content,
      type: type || 'INSIGHT',
      symbol: symbol?.toUpperCase(),
      sentiment: sentimentLabel,
      tags: tags || [],
      tradeDetails: tradeDetails || {}
    });

    await post.save();

    // Get author info
    const author = await User.findById(req.user.id);

    res.status(201).json({
      ...post.toObject(),
      author: {
        id: author._id,
        name: author.name,
        email: author.email
      },
      isUpvoted: false,
      isDownvoted: false,
      upvotesCount: 0,
      downvotesCount: 0,
      score: 0,
      commentsCount: 0
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

// Upvote a post
export const toggleUpvote = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findOne({ id: postId });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Initialize arrays if they don't exist (for backward compatibility)
    if (!post.upvotes) post.upvotes = [];
    if (!post.downvotes) post.downvotes = [];

    const isUpvoted = post.upvotes.includes(userId);
    const isDownvoted = post.downvotes.includes(userId);

    // Remove from downvotes if present
    if (isDownvoted) {
      post.downvotes = post.downvotes.filter(id => id !== userId);
    }

    // Toggle upvote
    if (isUpvoted) {
      post.upvotes = post.upvotes.filter(id => id !== userId);
    } else {
      post.upvotes.push(userId);
    }

    await post.save();

    res.json({
      isUpvoted: !isUpvoted,
      isDownvoted: false,
      upvotesCount: post.upvotes.length,
      downvotesCount: post.downvotes.length,
      score: post.upvotes.length - post.downvotes.length
    });
  } catch (error) {
    console.error('Error toggling upvote:', error);
    res.status(500).json({ error: 'Failed to toggle upvote' });
  }
};

// Downvote a post
export const toggleDownvote = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findOne({ id: postId });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Initialize arrays if they don't exist (for backward compatibility)
    if (!post.upvotes) post.upvotes = [];
    if (!post.downvotes) post.downvotes = [];

    const isUpvoted = post.upvotes.includes(userId);
    const isDownvoted = post.downvotes.includes(userId);

    // Remove from upvotes if present
    if (isUpvoted) {
      post.upvotes = post.upvotes.filter(id => id !== userId);
    }

    // Toggle downvote
    if (isDownvoted) {
      post.downvotes = post.downvotes.filter(id => id !== userId);
    } else {
      post.downvotes.push(userId);
    }

    await post.save();

    res.json({
      isUpvoted: false,
      isDownvoted: !isDownvoted,
      upvotesCount: post.upvotes.length,
      downvotesCount: post.downvotes.length,
      score: post.upvotes.length - post.downvotes.length
    });
  } catch (error) {
    console.error('Error toggling downvote:', error);
    res.status(500).json({ error: 'Failed to toggle downvote' });
  }
};

// Add comment to post
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const post = await Post.findOne({ id: postId });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = {
      userId,
      content,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();

    // Get commenter info
    const commenter = await User.findById(userId);

    res.status(201).json({
      ...comment,
      author: {
        id: commenter._id,
        name: commenter.name,
        email: commenter.email
      }
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Follow/unfollow user
export const toggleFollow = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    if (userId === followerId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const existingFollow = await Following.findOne({
      follower: followerId,
      following: userId
    });

    if (existingFollow) {
      await Following.deleteOne({ _id: existingFollow._id });
      res.json({ isFollowing: false });
    } else {
      await Following.create({
        follower: followerId,
        following: userId
      });
      res.json({ isFollowing: true });
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    res.status(500).json({ error: 'Failed to toggle follow' });
  }
};

// Get trending posts
export const getTrendingPosts = async (req, res) => {
  try {
    const { period = '7d' } = req.query;

    let dateFilter = new Date();
    switch (period) {
      case '1d':
        dateFilter.setDate(dateFilter.getDate() - 1);
        break;
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30);
        break;
      default:
        dateFilter.setDate(dateFilter.getDate() - 7);
    }

    const posts = await Post.find({
      createdAt: { $gte: dateFilter },
      isPrivate: false
    })
      .limit(100); // Get more posts to sort by score

    // Calculate scores and sort
    const postsWithScores = posts.map(post => ({
      ...post.toObject(),
      calculatedScore: (post.upvotes?.length || 0) - (post.downvotes?.length || 0)
    }));

    // Sort by score, then comments, then date
    postsWithScores.sort((a, b) => {
      if (b.calculatedScore !== a.calculatedScore) {
        return b.calculatedScore - a.calculatedScore;
      }
      if (b.comments.length !== a.comments.length) {
        return b.comments.length - a.comments.length;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Take top 50
    const topPosts = postsWithScores.slice(0, 50);

    // Add user info
    const postsWithUserInfo = await Promise.all(topPosts.map(async (post) => {
      const user = await User.findById(post.userId);
      if (!user) return null; // Skip posts with deleted users

      return {
        ...post,
        author: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        isUpvoted: post.upvotes?.includes(req.user.id) || false,
        isDownvoted: post.downvotes?.includes(req.user.id) || false,
        upvotesCount: post.upvotes?.length || 0,
        downvotesCount: post.downvotes?.length || 0,
        score: post.calculatedScore,
        commentsCount: post.comments.length
      };
    }));

    // Filter out nulls
    res.json(postsWithUserInfo.filter(p => p !== null));
  } catch (error) {
    console.error('Error fetching trending posts:', error);
    res.status(500).json({ error: 'Failed to fetch trending posts' });
  }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const { period = 'MONTHLY' } = req.query;

    // Fetch all users and their portfolios to calculate total equity
    // Note: For a production app with many users, this should be aggregated in the DB or cached.
    // Given the current scale, we'll calculate it on the fly or use the LeaderBoard model if updated.

    // However, the requirement is to use the LeaderBoard model which should be updated on trades.
    // So we will fetch LeaderBoard entries, but we need to ensure they have the 'totalEquity' metric.
    // If we haven't updated the LeaderBoard model schema yet, we should probably do that or 
    // calculate it here dynamically for now to ensure it works immediately.

    // Let's calculate dynamically for now to be safe and ensure it's always up to date with User balance.
    const users = await User.find({});
    const leaderboardData = await Promise.all(users.map(async (user) => {
      const portfolio = await import('../models/Portfolio.js').then(m => m.default.findOne({ userId: user._id.toString() }));
      const totalValue = portfolio ? portfolio.totalValue : 0;
      const virtualBalance = user.virtualBalance || 50000;
      const totalEquity = virtualBalance + totalValue;

      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        metrics: {
          totalEquity,
          totalValue,
          virtualBalance
        },
        rank: 0 // Will assign after sort
      };
    }));

    // Sort by Total Equity
    leaderboardData.sort((a, b) => b.metrics.totalEquity - a.metrics.totalEquity);

    // Assign ranks and take top 50
    const top50 = leaderboardData.slice(0, 50).map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

    res.json(top50);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

// Get user's social profile
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's posts
    const posts = await Post.find({ userId, isPrivate: false })
      .sort({ createdAt: -1 })
      .limit(20);

    // Get followers/following counts
    const followersCount = await Following.countDocuments({ following: userId });
    const followingCount = await Following.countDocuments({ follower: userId });

    // Check if current user follows this user
    const isFollowing = await Following.findOne({
      follower: currentUserId,
      following: userId
    });

    // Get user's recent performance
    const leaderboardEntry = await LeaderBoard.findOne({
      userId,
      period: 'MONTHLY'
    });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      posts,
      stats: {
        postsCount: posts.length,
        followersCount,
        followingCount,
        isFollowing: !!isFollowing
      },
      performance: leaderboardEntry?.metrics || {}
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};