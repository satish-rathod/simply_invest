import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatSession',
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'assistant', 'system', 'tool'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    // For tool calls (optional)
    toolCallId: String,
    name: String,
}, { timestamps: true });

// Index for faster queries by session and time
chatMessageSchema.index({ sessionId: 1, createdAt: 1 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;
