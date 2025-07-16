import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getFeed,
  createPost,
  toggleLike,
  addComment,
  toggleFollow,
  getTrendingPosts,
  getLeaderboard,
  getUserProfile
} from '../controllers/socialController.js';

const router = express.Router();

// All social routes require authentication
router.use(authMiddleware);

// Social feed routes
router.get('/feed', getFeed);
router.get('/trending', getTrendingPosts);
router.post('/posts', createPost);
router.post('/posts/:postId/like', toggleLike);
router.post('/posts/:postId/comments', addComment);

// Follow system
router.post('/follow/:userId', toggleFollow);

// Leaderboard
router.get('/leaderboard', getLeaderboard);

// User profiles
router.get('/users/:userId', getUserProfile);

export default router;