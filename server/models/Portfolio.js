import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const portfolioSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['PERSONAL', 'VIRTUAL'],
    default: 'PERSONAL'
  },
  holdings: [{
    symbol: { type: String, required: true },
    quantity: { type: Number, required: true },
    averagePrice: { type: Number, required: true },
    currentPrice: { type: Number, default: 0 },
    purchaseDate: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now }
  }],
  totalValue: { type: Number, default: 0 },
  totalInvestment: { type: Number, default: 0 },
  totalGainLoss: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

portfolioSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);
export default Portfolio;