import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const tradeSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  userId: { type: String, required: true, ref: 'User' },
  botId: { type: String, ref: 'TradingBot' },
  symbol: { type: String, required: true },
  side: { type: String, enum: ['BUY', 'SELL'], required: true },
  type: { type: String, enum: ['MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT'], required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  stopPrice: { type: Number },
  limitPrice: { type: Number },
  status: { 
    type: String, 
    enum: ['PENDING', 'FILLED', 'PARTIALLY_FILLED', 'CANCELLED', 'REJECTED'], 
    default: 'PENDING' 
  },
  orderType: { type: String, enum: ['ENTRY', 'EXIT', 'STOP_LOSS', 'TAKE_PROFIT'], required: true },
  executedQuantity: { type: Number, default: 0 },
  executedPrice: { type: Number },
  commission: { type: Number, default: 0 },
  pnl: { type: Number, default: 0 },
  brokerOrderId: { type: String },
  brokerageProvider: { type: String, default: 'PAPER' },
  reason: { type: String }, // Trade reason/strategy signal
  metadata: {
    indicators: { type: Object },
    signals: { type: Object },
    technicalAnalysis: { type: Object }
  },
  executedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

tradeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Trade = mongoose.model('Trade', tradeSchema);
export default Trade;