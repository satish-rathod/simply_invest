import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const marketInsightSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  summary: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['MARKET_ANALYSIS', 'STOCK_PICK', 'SECTOR_ANALYSIS', 'ECONOMIC_NEWS', 'TRADING_TIPS'], 
    required: true 
  },
  symbols: [{ type: String }], // Related stock symbols
  author: { type: String, required: true },
  sentiment: { type: String, enum: ['BULLISH', 'BEARISH', 'NEUTRAL'], default: 'NEUTRAL' },
  tags: [{ type: String }],
  readTime: { type: Number, required: true }, // in minutes
  views: { type: Number, default: 0 },
  likes: [{ type: String }], // Array of user IDs
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

marketInsightSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = Date.now();
  }
  next();
});

const MarketInsight = mongoose.model('MarketInsight', marketInsightSchema);
export default MarketInsight;