// routes/chatRoutes.js
import express from 'express';
import { processChatMessage } from '../utils/chatbot.js';
import Conversation from '../models/conversation.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/message', protect, async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    const userId = req.user._id;

    const response = await processChatMessage(userId, message, conversationHistory);

    // Save the conversation
    await Conversation.findOneAndUpdate(
      { userId },
      {
        $push: {
          messages: [
            { role: 'user', content: message },
            { role: 'assistant', content: response }
          ]
        }
      },
      { upsert: true, new: true }
    );

    res.json({ response });
  } catch (error) {
    res.status(500).json({ message: 'Error processing message', error: error.message });
  }
});

router.get('/history', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const conversation = await Conversation.findOne({ userId }).sort({ 'messages.timestamp': -1 });
    res.json(conversation ? conversation.messages : []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversation history', error: error.message });
  }
});

export default router;