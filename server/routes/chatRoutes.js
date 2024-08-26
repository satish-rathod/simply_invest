import express from 'express';
import { processChatMessage } from '../utils/chatbot.js';
import Conversation from '../models/conversation.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/message', protect, async (req, res) => {
  try {
    const { message } = req.body;
    console.log('User:', req.user); // Add this line
    const userId = req.user._id;

    console.log(`Received chat message from user ${userId}`);
    const response = await processChatMessage(userId, message);

    console.log('Saving conversation to database');
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

    console.log('Sending response back to client');
    res.json({ response });
  } catch (error) {
    console.error('Error in chat route:', error);
    res.status(500).json({ 
      message: 'Error processing message', 
      error: error.message || 'An unexpected error occurred'
    });
  }
});

router.get('/history', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(`Fetching conversation history for user ${userId}`);
    const conversation = await Conversation.findOne({ userId }).sort({ 'messages.timestamp': -1 });
    res.json(conversation ? conversation.messages : []);
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    res.status(500).json({ 
      message: 'Error fetching conversation history', 
      error: error.message || 'An unexpected error occurred'
    });
  }
});

export default router;