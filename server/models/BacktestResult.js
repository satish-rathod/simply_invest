import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const backtestResultSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  userId: { type: String, required: true, ref: 'User' },
  strategyName: { type: String, required: true },
  symbol: { type: String, required: true },
  timeframe: { type: String, required: true }, // 1m, 5m, 1h, 1d, etc.
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  initialBalance: { type: Number, required: true },
  finalBalance: { type: Number, required: true },
  totalReturn: { type: Number, required: true },
  totalReturnPercent: { type: Number, required: true },
  annualizedReturn: { type: Number, required: true },
  maxDrawdown: { type: Number, required: true },
  maxDrawdownPercent: { type: Number, required: true },
  sharpeRatio: { type: Number, required: true },
  sortinoRatio: { type: Number, required: true },
  calmarRatio: { type: Number, required: true },
  winRate: { type: Number, required: true },
  profitFactor: { type: Number, required: true },
  totalTrades: { type: Number, required: true },
  winningTrades: { type: Number, required: true },
  losingTrades: { type: Number, required: true },
  averageWin: { type: Number, required: true },
  averageLoss: { type: Number, required: true },
  largestWin: { type: Number, required: true },
  largestLoss: { type: Number, required: true },
  averageTradeReturn: { type: Number, required: true },
  averageTimeInMarket: { type: Number, required: true }, // in minutes
  exposureTime: { type: Number, required: true }, // percentage
  trades: [{
    entryDate: { type: Date, required: true },
    exitDate: { type: Date, required: true },
    entryPrice: { type: Number, required: true },
    exitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    side: { type: String, enum: ['LONG', 'SHORT'], required: true },
    pnl: { type: Number, required: true },
    pnlPercent: { type: Number, required: true },
    duration: { type: Number, required: true }, // in minutes
    reason: { type: String },
    signals: { type: Object }
  }],
  equityCurve: [{
    date: { type: Date, required: true },
    equity: { type: Number, required: true },
    drawdown: { type: Number, required: true },
    returns: { type: Number, required: true }
  }],
  monthlyReturns: [{
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    return: { type: Number, required: true },
    returnPercent: { type: Number, required: true }
  }],
  strategyParameters: { type: Object, required: true },
  marketData: {
    totalBars: { type: Number, required: true },
    dataQuality: { type: Number, required: true }, // percentage
    missingBars: { type: Number, default: 0 }
  },
  executionTime: { type: Number, required: true }, // in milliseconds
  createdAt: { type: Date, default: Date.now }
});

const BacktestResult = mongoose.model('BacktestResult', backtestResultSchema);
export default BacktestResult;