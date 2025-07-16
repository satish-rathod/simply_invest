import conversation from '../models/conversation.js';
import { generateEnhancedChatResponse } from '../utils/aiService.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

// Get chat history
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await conversation.find({ userId }).sort({ createdAt: -1 }).limit(50);
    
    // Transform to expected format
    const messages = conversations.flatMap(conv => [
      { role: 'user', content: conv.userMessage },
      { role: 'assistant', content: conv.botResponse }
    ]);
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};

// Send message to AI
export const sendMessage = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const userId = req.user.id;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Generate enhanced AI response
    const aiResponse = await generateEnhancedChatResponse(message, conversationHistory, userId);
    
    // Save conversation to database
    const newConversation = new conversation({
      userId,
      userMessage: message,
      botResponse: aiResponse,
      createdAt: new Date()
    });
    
    await newConversation.save();
    
    res.json({
      response: aiResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      response: 'I apologize, but I\'m having trouble processing your request right now. Please try again later.'
    });
  }
};

// Clear chat history
export const clearChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    await conversation.deleteMany({ userId });
    res.json({ message: 'Chat history cleared successfully' });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
};

// Get chat statistics
export const getChatStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const totalConversations = await conversation.countDocuments({ userId });
    const recentConversations = await conversation.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    const stats = {
      totalConversations,
      recentActivity: recentConversations.map(conv => ({
        userMessage: conv.userMessage.substring(0, 100) + '...',
        timestamp: conv.createdAt
      }))
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching chat stats:', error);
    res.status(500).json({ error: 'Failed to fetch chat statistics' });
  }
};
