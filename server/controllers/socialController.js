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
    const { page = 1, limit = 20 } = req.query;
    
    // Get users that the current user follows
    const following = await Following.find({ follower: userId });
    const followingIds = following.map(f => f.following);
    followingIds.push(userId); // Include own posts
    
    const posts = await Post.find({
      userId: { $in: followingIds },
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

    // Add user info and like status
    const postsWithUserInfo = await Promise.all(posts.map(async (post) => {
      const user = await User.findById(post.userId);
      return {
        ...post.toObject(),
        author: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        isLiked: post.likes.includes(userId),
        likesCount: post.likes.length,
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
      isLiked: false,
      likesCount: 0,
      commentsCount: 0
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

// Like/unlike a post
export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findOne({ id: postId });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const isLiked = post.likes.includes(userId);
    
    if (isLiked) {
      post.likes = post.likes.filter(id => id !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    
    res.json({ 
      isLiked: !isLiked, 
      likesCount: post.likes.length 
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
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
    .sort({ 
      'likes': -1,
      'comments': -1,
      createdAt: -1
    })
    .limit(50);

    // Add user info
    const postsWithUserInfo = await Promise.all(posts.map(async (post) => {
      const user = await User.findById(post.userId);
      return {
        ...post.toObject(),
        author: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        isLiked: post.likes.includes(req.user.id),
        likesCount: post.likes.length,
        commentsCount: post.comments.length
      };
    }));

    res.json(postsWithUserInfo);
  } catch (error) {
    console.error('Error fetching trending posts:', error);
    res.status(500).json({ error: 'Failed to fetch trending posts' });
  }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const { period = 'MONTHLY' } = req.query;
    
    const leaderboard = await LeaderBoard.find({ period })
      .sort({ score: -1, rank: 1 })
      .limit(50);

    // Add user info
    const leaderboardWithUserInfo = await Promise.all(leaderboard.map(async (entry) => {
      const user = await User.findById(entry.userId);
      return {
        ...entry.toObject(),
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      };
    }));

    res.json(leaderboardWithUserInfo);
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