import ChatSession from '../models/ChatSession.js';
import ChatMessage from '../models/ChatMessage.js';
import { generateEnhancedChatResponse } from '../utils/aiService.js';

// Create a new chat session
export const createSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;

    const session = await ChatSession.create({
      userId,
      title: title || 'New Chat',
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating chat session:', error);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
};

// Get all chat sessions for a user
export const getSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await ChatSession.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(50) // Limit to 50 most recent sessions
      .lean(); // Return plain objects to reduce memory usage

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    res.status(500).json({ error: 'Failed to fetch chat sessions' });
  }
};

// Get messages for a specific session with pagination
export const getSessionMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 20, before } = req.query; // 'before' is a timestamp or ID for pagination

    const query = { sessionId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await ChatMessage.find(query)
      .sort({ createdAt: -1 }) // Newest first for pagination
      .limit(parseInt(limit))
      .lean(); // Return plain objects to reduce memory usage

    // Reverse to return oldest first (chronological order) for display
    res.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching session messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Send a message to a session
export const sendMessage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Verify session belongs to user
    const session = await ChatSession.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Save user message
    const userMsg = await ChatMessage.create({
      sessionId,
      role: 'user',
      content: message,
    });

    // Fetch recent conversation history for context (last 10 messages)
    const history = await ChatMessage.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(); // Return plain objects to reduce memory usage

    // Format history for AI service (reverse to chronological)
    const conversationHistory = history.reverse().map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Generate AI response
    const aiResponseContent = await generateEnhancedChatResponse(message, conversationHistory, userId);

    // Save AI response
    const aiMsg = await ChatMessage.create({
      sessionId,
      role: 'assistant',
      content: aiResponseContent,
    });

    // Update session timestamp and title if it's the first message
    const updateData = { updatedAt: new Date() };
    const messageCount = await ChatMessage.countDocuments({ sessionId });
    if (messageCount <= 2) {
      // Simple title generation: first 30 chars of user message
      updateData.title = message.substring(0, 30) + (message.length > 30 ? '...' : '');
    }
    await ChatSession.findByIdAndUpdate(sessionId, updateData);

    res.json({
      userMessage: userMsg,
      aiResponse: aiMsg,
    });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({
      error: 'Failed to process message',
      response: 'I apologize, but I\'m having trouble processing your request right now.'
    });
  }
};

// Delete a session
export const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await ChatSession.findOneAndDelete({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Delete all messages in the session
    await ChatMessage.deleteMany({ sessionId });

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
};

// Get chat statistics
export const getChatStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const totalSessions = await ChatSession.countDocuments({ userId });
    const totalMessages = await ChatMessage.countDocuments({
      sessionId: { $in: await ChatSession.find({ userId }).distinct('_id') }
    });

    res.json({
      totalSessions,
      totalMessages,
    });
  } catch (error) {
    console.error('Error fetching chat stats:', error);
    res.status(500).json({ error: 'Failed to fetch chat statistics' });
  }
};

// Legacy: Send message (backward compatibility)
export const sendMessageLegacy = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Find or create default session
    let session = await ChatSession.findOne({ userId, title: 'Default Session' });
    if (!session) {
      session = await ChatSession.create({ userId, title: 'Default Session' });
    }

    // Save user message
    await ChatMessage.create({
      sessionId: session._id,
      role: 'user',
      content: message,
    });

    // Generate AI response
    const aiResponseContent = await generateEnhancedChatResponse(message, conversationHistory, userId);

    // Save AI response
    await ChatMessage.create({
      sessionId: session._id,
      role: 'assistant',
      content: aiResponseContent,
    });

    // Update session
    await ChatSession.findByIdAndUpdate(session._id, { updatedAt: new Date() });

    // Return format expected by legacy frontend
    res.json({
      response: aiResponseContent,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing legacy message:', error);
    res.status(500).json({
      error: 'Failed to process message',
      response: 'I apologize, but I\'m having trouble processing your request right now.'
    });
  }
};

// Legacy: Get chat history (backward compatibility)
export const getChatHistoryLegacy = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find default session
    const session = await ChatSession.findOne({ userId, title: 'Default Session' });
    if (!session) {
      return res.json([]);
    }

    const messages = await ChatMessage.find({ sessionId: session._id })
      .sort({ createdAt: 1 }) // Oldest first
      .lean(); // Return plain objects to reduce memory usage

    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error('Error fetching legacy chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};

// Legacy: Clear chat history
export const clearChatHistoryLegacy = async (req, res) => {
  try {
    const userId = req.user.id;
    const session = await ChatSession.findOne({ userId, title: 'Default Session' });

    if (session) {
      await ChatMessage.deleteMany({ sessionId: session._id });
    }

    res.json({ message: 'Chat history cleared successfully' });
  } catch (error) {
    console.error('Error clearing legacy chat history:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
};
