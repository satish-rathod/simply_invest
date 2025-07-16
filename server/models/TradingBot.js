import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const tradingBotSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  userId: { type: String, required: true, ref: 'User' },
  name: { type: String, required: true },
  description: { type: String },
  strategy: {
    type: { type: String, enum: ['SMA', 'EMA', 'RSI', 'MACD', 'BOLLINGER', 'CUSTOM'], required: true },
    parameters: {
      shortPeriod: { type: Number, default: 10 },
      longPeriod: { type: Number, default: 20 },
      rsiPeriod: { type: Number, default: 14 },
      rsiOverbought: { type: Number, default: 70 },
      rsiOversold: { type: Number, default: 30 },
      stopLoss: { type: Number, default: 5 }, // percentage
      takeProfit: { type: Number, default: 10 }, // percentage
      maxPositionSize: { type: Number, default: 1000 }, // USD
      customCode: { type: String }
    }
  },
  watchedSymbols: [{ type: String }],
  isActive: { type: Boolean, default: false },
  isLive: { type: Boolean, default: false }, // false = paper trading
  balance: { type: Number, default: 10000 }, // Paper trading balance
  performance: {
    totalTrades: { type: Number, default: 0 },
    winningTrades: { type: Number, default: 0 },
    losingTrades: { type: Number, default: 0 },
    totalPnL: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 },
    maxDrawdown: { type: Number, default: 0 },
    sharpeRatio: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  riskManagement: {
    maxDailyLoss: { type: Number, default: 500 },
    maxPositionsPerSymbol: { type: Number, default: 1 },
    maxTotalPositions: { type: Number, default: 5 },
    allowedTradingHours: {
      start: { type: String, default: '09:30' },
      end: { type: String, default: '16:00' },
      timezone: { type: String, default: 'America/New_York' }
    }
  },
  brokerageConfig: {
    provider: { type: String, enum: ['ALPACA', 'INTERACTIVE_BROKERS', 'TD_AMERITRADE', 'PAPER'], default: 'PAPER' },
    apiKey: { type: String },
    apiSecret: { type: String },
    baseUrl: { type: String },
    accountId: { type: String }
  },
  lastRunAt: { type: Date },
  nextRunAt: { type: Date },
  status: { type: String, enum: ['ACTIVE', 'PAUSED', 'STOPPED', 'ERROR'], default: 'STOPPED' },
  logs: [{
    timestamp: { type: Date, default: Date.now },
    level: { type: String, enum: ['INFO', 'WARNING', 'ERROR'] },
    message: { type: String },
    data: { type: Object }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

tradingBotSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const TradingBot = mongoose.model('TradingBot', tradingBotSchema);
export default TradingBot;