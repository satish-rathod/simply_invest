import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getChatHistory, sendMessage, clearChatHistory, getChatStats } from '../controllers/chatController.js';

const router = express.Router();

// All chat routes require authentication
router.use(authMiddleware);

// Chat routes
router.get('/history', getChatHistory);
router.post('/message', sendMessage);
router.delete('/history', clearChatHistory);
router.get('/stats', getChatStats);

export default router;