// routes/chatRoutes.js
import express from 'express';
import { processChatMessage } from '../utils/chatbot.js';
import Conversation from '../models/conversation.js';
import { protect } from '../middleware/authMiddleware.js'; // Assuming you have this middleware

const router = express.Router();

// Send a message and get a response
router.post('/message', protect, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    const response = await processChatMessage(userId, message);

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

// Get conversation history
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