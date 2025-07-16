import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const marketDataSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  symbol: { type: String, required: true },
  price: { type: Number, required: true },
  volume: { type: Number, default: 0 },
  high: { type: Number, default: 0 },
  low: { type: Number, default: 0 },
  open: { type: Number, default: 0 },
  close: { type: Number, default: 0 },
  previousClose: { type: Number, default: 0 },
  change: { type: Number, default: 0 },
  changePercent: { type: Number, default: 0 },
  marketCap: { type: Number, default: 0 },
  peRatio: { type: Number, default: 0 },
  dividendYield: { type: Number, default: 0 },
  fiftyTwoWeekHigh: { type: Number, default: 0 },
  fiftyTwoWeekLow: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
  source: { type: String, default: 'yahoo' }
});

marketDataSchema.index({ symbol: 1, timestamp: -1 });

const MarketData = mongoose.model('MarketData', marketDataSchema);
export default MarketData;