import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const postSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  content: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['INSIGHT', 'QUESTION', 'TRADE', 'ANALYSIS', 'NEWS'], 
    default: 'INSIGHT' 
  },
  symbol: { type: String }, // Associated stock symbol
  sentiment: { type: String, enum: ['BULLISH', 'BEARISH', 'NEUTRAL'], default: 'NEUTRAL' },
  likes: [{ type: String }], // Array of user IDs who liked
  comments: [{
    id: { type: String, default: uuidv4 },
    userId: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  tags: [{ type: String }],
  isPrivate: { type: Boolean, default: false },
  tradeDetails: {
    action: { type: String, enum: ['BUY', 'SELL', 'HOLD'] },
    price: { type: Number },
    quantity: { type: Number },
    reasoning: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

postSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Post = mongoose.model('Post', postSchema);
export default Post;