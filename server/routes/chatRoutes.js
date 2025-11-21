import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
    createSession,
    getSessions,
    getSessionMessages,
    sendMessage,
    deleteSession,
    getChatStats,
    sendMessageLegacy,
    getChatHistoryLegacy,
    clearChatHistoryLegacy
} from '../controllers/chatController.js';

const router = express.Router();

// All chat routes require authentication
router.use(authMiddleware);

// Session routes
router.post('/sessions', createSession);
router.get('/sessions', getSessions);
router.get('/sessions/:sessionId/messages', getSessionMessages);
router.post('/sessions/:sessionId/message', sendMessage);
router.delete('/sessions/:sessionId', deleteSession);

// Stats
router.get('/stats', getChatStats);

// Legacy routes (backward compatibility)
router.post('/message', sendMessageLegacy);
router.get('/history', getChatHistoryLegacy);
router.delete('/history', clearChatHistoryLegacy);

export default router;