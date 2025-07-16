import BacktestResult from '../models/BacktestResult.js';
import { getHistoricalData } from '../utils/marketData.js';
import { calculateTechnicalIndicators } from '../utils/technicalAnalysis.js';

class BacktestEngine {
  constructor() {
    this.isRunning = false;
  }

  async runBacktest(userId, strategyConfig) {
    const startTime = Date.now();
    
    try {
      // Get historical data
      const historicalData = await getHistoricalData(
        strategyConfig.symbol,
        strategyConfig.timeframe,
        strategyConfig.interval
      );
      
      if (historicalData.length < 100) {
        throw new Error('Insufficient historical data for backtesting');
      }
      
      // Initialize backtest state
      const state = {
        balance: strategyConfig.initialBalance,
        initialBalance: strategyConfig.initialBalance,
        positions: [],
        trades: [],
        equity: [{ date: historicalData[0].date, equity: strategyConfig.initialBalance, drawdown: 0, returns: 0 }],
        maxDrawdown: 0,
        maxDrawdownPercent: 0,
        peakEquity: strategyConfig.initialBalance,
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        totalPnL: 0,
        grossProfit: 0,
        grossLoss: 0,
        largestWin: 0,
        largestLoss: 0,
        totalTimeInMarket: 0,
        totalTradeDuration: 0
      };
      
      // Run backtest simulation
      await this.simulateStrategy(historicalData, strategyConfig, state);
      
      // Calculate performance metrics
      const results = this.calculatePerformanceMetrics(state, strategyConfig);
      
      // Save backtest results
      const backtestResult = new BacktestResult({
        userId,
        strategyName: strategyConfig.name,
        symbol: strategyConfig.symbol,
        timeframe: strategyConfig.timeframe,
        startDate: new Date(historicalData[0].date),
        endDate: new Date(historicalData[historicalData.length - 1].date),
        initialBalance: strategyConfig.initialBalance,
        finalBalance: state.balance,
        totalReturn: state.balance - strategyConfig.initialBalance,
        totalReturnPercent: ((state.balance - strategyConfig.initialBalance) / strategyConfig.initialBalance) * 100,
        annualizedReturn: results.annualizedReturn,
        maxDrawdown: state.maxDrawdown,
        maxDrawdownPercent: state.maxDrawdownPercent,
        sharpeRatio: results.sharpeRatio,
        sortinoRatio: results.sortinoRatio,
        calmarRatio: results.calmarRatio,
        winRate: results.winRate,
        profitFactor: results.profitFactor,
        totalTrades: state.totalTrades,
        winningTrades: state.winningTrades,
        losingTrades: state.losingTrades,
        averageWin: results.averageWin,
        averageLoss: results.averageLoss,
        largestWin: state.largestWin,
        largestLoss: state.largestLoss,
        averageTradeReturn: results.averageTradeReturn,
        averageTimeInMarket: results.averageTimeInMarket,
        exposureTime: results.exposureTime,
        trades: state.trades,
        equityCurve: state.equity,
        monthlyReturns: results.monthlyReturns,
        strategyParameters: strategyConfig.parameters,
        marketData: {
          totalBars: historicalData.length,
          dataQuality: 100,
          missingBars: 0
        },
        executionTime: Date.now() - startTime
      });
      
      await backtestResult.save();
      return backtestResult;
      
    } catch (error) {
      console.error('Backtest error:', error);
      throw error;
    }
  }

  async simulateStrategy(historicalData, strategyConfig, state) {
    const lookbackPeriod = Math.max(
      strategyConfig.parameters.longPeriod || 50,
      strategyConfig.parameters.rsiPeriod || 14
    );
    
    // Process each bar
    for (let i = lookbackPeriod; i < historicalData.length; i++) {
      const currentBar = historicalData[i];
      const lookbackData = historicalData.slice(Math.max(0, i - lookbackPeriod), i + 1);
      
      // Calculate technical indicators
      const indicators = await calculateTechnicalIndicators(lookbackData, strategyConfig.parameters);
      
      // Generate signals
      const signals = this.generateSignals(strategyConfig, indicators, currentBar.close);
      
      // Execute trades
      await this.executeTrades(currentBar, signals, state, strategyConfig);
      
      // Update equity curve
      this.updateEquityCurve(currentBar, state);
    }
    
    // Close any remaining positions
    if (state.positions.length > 0) {
      const lastBar = historicalData[historicalData.length - 1];
      await this.closeAllPositions(lastBar, state);
    }
  }

  generateSignals(strategyConfig, indicators, currentPrice) {
    const signals = { buy: false, sell: false, reason: '' };
    
    switch (strategyConfig.strategy) {
      case 'SMA_CROSSOVER':
        return this.generateSMACrossoverSignals(indicators, strategyConfig.parameters);
      case 'RSI_MEAN_REVERSION':
        return this.generateRSISignals(indicators, strategyConfig.parameters);
      case 'MACD_MOMENTUM':
        return this.generateMACDSignals(indicators, strategyConfig.parameters);
      case 'BOLLINGER_BANDS':
        return this.generateBollingerSignals(indicators, currentPrice, strategyConfig.parameters);
      case 'MULTI_INDICATOR':
        return this.generateMultiIndicatorSignals(indicators, currentPrice, strategyConfig.parameters);
      default:
        return signals;
    }
  }

  generateSMACrossoverSignals(indicators, parameters) {
    const signals = { buy: false, sell: false, reason: '' };
    
    if (indicators.shortSMA && indicators.longSMA && 
        indicators.shortSMA.length >= 2 && indicators.longSMA.length >= 2) {
      
      const shortCurrent = indicators.shortSMA[indicators.shortSMA.length - 1];
      const shortPrevious = indicators.shortSMA[indicators.shortSMA.length - 2];
      const longCurrent = indicators.longSMA[indicators.longSMA.length - 1];
      const longPrevious = indicators.longSMA[indicators.longSMA.length - 2];
      
      // Golden cross
      if (shortPrevious <= longPrevious && shortCurrent > longCurrent) {
        signals.buy = true;
        signals.reason = 'SMA Golden Cross';
      }
      
      // Death cross
      if (shortPrevious >= longPrevious && shortCurrent < longCurrent) {
        signals.sell = true;
        signals.reason = 'SMA Death Cross';
      }
    }
    
    return signals;
  }

  generateRSISignals(indicators, parameters) {
    const signals = { buy: false, sell: false, reason: '' };
    
    if (indicators.rsi && indicators.rsi.length >= 2) {
      const rsiCurrent = indicators.rsi[indicators.rsi.length - 1];
      const rsiPrevious = indicators.rsi[indicators.rsi.length - 2];
      
      // Oversold bounce
      if (rsiPrevious <= parameters.rsiOversold && rsiCurrent > parameters.rsiOversold) {
        signals.buy = true;
        signals.reason = `RSI Oversold Bounce (${rsiCurrent.toFixed(2)})`;
      }
      
      // Overbought reversal
      if (rsiPrevious >= parameters.rsiOverbought && rsiCurrent < parameters.rsiOverbought) {
        signals.sell = true;
        signals.reason = `RSI Overbought Reversal (${rsiCurrent.toFixed(2)})`;
      }
    }
    
    return signals;
  }

  generateMACDSignals(indicators, parameters) {
    const signals = { buy: false, sell: false, reason: '' };
    
    if (indicators.macd && indicators.macd.macd.length >= 2) {
      const macdCurrent = indicators.macd.macd[indicators.macd.macd.length - 1];
      const macdPrevious = indicators.macd.macd[indicators.macd.macd.length - 2];
      const signalCurrent = indicators.macd.signal[indicators.macd.signal.length - 1];
      const signalPrevious = indicators.macd.signal[indicators.macd.signal.length - 2];
      
      // Bullish crossover
      if (macdPrevious <= signalPrevious && macdCurrent > signalCurrent) {
        signals.buy = true;
        signals.reason = 'MACD Bullish Crossover';
      }
      
      // Bearish crossover
      if (macdPrevious >= signalPrevious && macdCurrent < signalCurrent) {
        signals.sell = true;
        signals.reason = 'MACD Bearish Crossover';
      }
    }
    
    return signals;
  }

  generateBollingerSignals(indicators, currentPrice, parameters) {
    const signals = { buy: false, sell: false, reason: '' };
    
    if (indicators.bollingerBands && indicators.bollingerBands.length > 0) {
      const bands = indicators.bollingerBands[indicators.bollingerBands.length - 1];
      
      // Price touching lower band (buy signal)
      if (currentPrice <= bands.lower) {
        signals.buy = true;
        signals.reason = 'Price at Lower Bollinger Band';
      }
      
      // Price touching upper band (sell signal)
      if (currentPrice >= bands.upper) {
        signals.sell = true;
        signals.reason = 'Price at Upper Bollinger Band';
      }
    }
    
    return signals;
  }

  generateMultiIndicatorSignals(indicators, currentPrice, parameters) {
    const signals = { buy: false, sell: false, reason: '' };
    let bullishSignals = 0;
    let bearishSignals = 0;
    const reasons = [];
    
    // RSI analysis
    if (indicators.rsi && indicators.rsi.length > 0) {
      const rsi = indicators.rsi[indicators.rsi.length - 1];
      if (rsi < parameters.rsiOversold) {
        bullishSignals++;
        reasons.push('RSI Oversold');
      } else if (rsi > parameters.rsiOverbought) {
        bearishSignals++;
        reasons.push('RSI Overbought');
      }
    }
    
    // MACD analysis
    if (indicators.macd && indicators.macd.macd.length > 0) {
      const macd = indicators.macd.macd[indicators.macd.macd.length - 1];
      const signal = indicators.macd.signal[indicators.macd.signal.length - 1];
      
      if (macd > signal) {
        bullishSignals++;
        reasons.push('MACD Bullish');
      } else {
        bearishSignals++;
        reasons.push('MACD Bearish');
      }
    }
    
    // Moving Average analysis
    if (indicators.shortSMA && indicators.longSMA && 
        indicators.shortSMA.length > 0 && indicators.longSMA.length > 0) {
      const shortMA = indicators.shortSMA[indicators.shortSMA.length - 1];
      const longMA = indicators.longSMA[indicators.longSMA.length - 1];
      
      if (shortMA > longMA) {
        bullishSignals++;
        reasons.push('SMA Bullish');
      } else {
        bearishSignals++;
        reasons.push('SMA Bearish');
      }
    }
    
    // Require at least 2 confirming signals
    if (bullishSignals >= 2) {
      signals.buy = true;
      signals.reason = `Multi-Indicator Buy: ${reasons.join(', ')}`;
    } else if (bearishSignals >= 2) {
      signals.sell = true;
      signals.reason = `Multi-Indicator Sell: ${reasons.join(', ')}`;
    }
    
    return signals;
  }

  async executeTrades(currentBar, signals, state, strategyConfig) {
    const currentPrice = currentBar.close;
    const commission = strategyConfig.commission || 0;
    
    // Check for buy signals
    if (signals.buy && state.positions.length === 0) {
      const positionSize = this.calculatePositionSize(state.balance, currentPrice, strategyConfig);
      const shares = Math.floor(positionSize / currentPrice);
      
      if (shares > 0) {
        const totalCost = shares * currentPrice + commission;
        
        if (totalCost <= state.balance) {
          // Enter position
          state.positions.push({
            entryDate: new Date(currentBar.date),
            entryPrice: currentPrice,
            shares: shares,
            stopLoss: currentPrice * (1 - (strategyConfig.parameters.stopLoss || 0.05)),
            takeProfit: currentPrice * (1 + (strategyConfig.parameters.takeProfit || 0.1))
          });
          
          state.balance -= totalCost;
          console.log(`BUY: ${shares} shares at $${currentPrice} - ${signals.reason}`);
        }
      }
    }
    
    // Check for sell signals or exit conditions
    if (state.positions.length > 0) {
      const position = state.positions[0];
      let shouldExit = false;
      let exitReason = '';
      
      // Check stop loss
      if (currentPrice <= position.stopLoss) {
        shouldExit = true;
        exitReason = 'Stop Loss';
      }
      
      // Check take profit
      if (currentPrice >= position.takeProfit) {
        shouldExit = true;
        exitReason = 'Take Profit';
      }
      
      // Check sell signal
      if (signals.sell) {
        shouldExit = true;
        exitReason = signals.reason;
      }
      
      if (shouldExit) {
        await this.closePosition(position, currentBar, state, exitReason, commission);
      }
    }
  }

  async closePosition(position, currentBar, state, reason, commission) {
    const exitPrice = currentBar.close;
    const pnl = (exitPrice - position.entryPrice) * position.shares - commission;
    const pnlPercent = (pnl / (position.entryPrice * position.shares)) * 100;
    const duration = (new Date(currentBar.date) - position.entryDate) / (1000 * 60); // minutes
    
    // Update state
    state.balance += position.shares * exitPrice - commission;
    state.totalTrades++;
    state.totalPnL += pnl;
    state.totalTradeDuration += duration;
    
    if (pnl > 0) {
      state.winningTrades++;
      state.grossProfit += pnl;
      state.largestWin = Math.max(state.largestWin, pnl);
    } else {
      state.losingTrades++;
      state.grossLoss += Math.abs(pnl);
      state.largestLoss = Math.min(state.largestLoss, pnl);
    }
    
    // Record trade
    state.trades.push({
      entryDate: position.entryDate,
      exitDate: new Date(currentBar.date),
      entryPrice: position.entryPrice,
      exitPrice: exitPrice,
      quantity: position.shares,
      side: 'LONG',
      pnl: pnl,
      pnlPercent: pnlPercent,
      duration: duration,
      reason: reason
    });
    
    // Remove position
    state.positions = [];
    
    console.log(`SELL: ${position.shares} shares at $${exitPrice} - ${reason} - P&L: $${pnl.toFixed(2)}`);
  }

  async closeAllPositions(lastBar, state) {
    for (const position of state.positions) {
      await this.closePosition(position, lastBar, state, 'End of Backtest', 0);
    }
  }

  calculatePositionSize(balance, price, strategyConfig) {
    const riskPercent = strategyConfig.parameters.riskPercent || 2; // 2% risk per trade
    const stopLossPercent = strategyConfig.parameters.stopLoss || 0.05; // 5% stop loss
    
    const riskAmount = balance * (riskPercent / 100);
    const positionSize = riskAmount / stopLossPercent;
    
    return Math.min(positionSize, balance * 0.25); // Max 25% of balance per trade
  }

  updateEquityCurve(currentBar, state) {
    let currentEquity = state.balance;
    
    // Add unrealized P&L from open positions
    for (const position of state.positions) {
      currentEquity += (currentBar.close - position.entryPrice) * position.shares;
    }
    
    // Update peak equity and drawdown
    if (currentEquity > state.peakEquity) {
      state.peakEquity = currentEquity;
    }
    
    const drawdown = state.peakEquity - currentEquity;
    const drawdownPercent = (drawdown / state.peakEquity) * 100;
    
    state.maxDrawdown = Math.max(state.maxDrawdown, drawdown);
    state.maxDrawdownPercent = Math.max(state.maxDrawdownPercent, drawdownPercent);
    
    // Calculate returns
    const returns = state.equity.length > 0 ? 
      (currentEquity - state.equity[state.equity.length - 1].equity) / state.equity[state.equity.length - 1].equity : 0;
    
    state.equity.push({
      date: new Date(currentBar.date),
      equity: currentEquity,
      drawdown: drawdown,
      returns: returns
    });
  }

  calculatePerformanceMetrics(state, strategyConfig) {
    const totalDays = (state.equity[state.equity.length - 1].date - state.equity[0].date) / (1000 * 60 * 60 * 24);
    const annualizedReturn = Math.pow(state.balance / state.initialBalance, 365 / totalDays) - 1;
    
    // Calculate Sharpe ratio
    const returns = state.equity.slice(1).map((e, i) => e.returns);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const returnStdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length);
    const sharpeRatio = returnStdDev > 0 ? (avgReturn / returnStdDev) * Math.sqrt(252) : 0;
    
    // Calculate Sortino ratio (downside deviation)
    const negativeReturns = returns.filter(r => r < 0);
    const downsideDeviation = negativeReturns.length > 0 ? 
      Math.sqrt(negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / negativeReturns.length) : 0;
    const sortinoRatio = downsideDeviation > 0 ? (avgReturn / downsideDeviation) * Math.sqrt(252) : 0;
    
    // Calculate Calmar ratio
    const calmarRatio = state.maxDrawdownPercent > 0 ? (annualizedReturn * 100) / state.maxDrawdownPercent : 0;
    
    const winRate = state.totalTrades > 0 ? (state.winningTrades / state.totalTrades) * 100 : 0;
    const profitFactor = state.grossLoss > 0 ? state.grossProfit / state.grossLoss : 0;
    const averageWin = state.winningTrades > 0 ? state.grossProfit / state.winningTrades : 0;
    const averageLoss = state.losingTrades > 0 ? state.grossLoss / state.losingTrades : 0;
    const averageTradeReturn = state.totalTrades > 0 ? state.totalPnL / state.totalTrades : 0;
    const averageTimeInMarket = state.totalTrades > 0 ? state.totalTradeDuration / state.totalTrades : 0;
    
    // Calculate monthly returns
    const monthlyReturns = this.calculateMonthlyReturns(state.equity);
    
    // Calculate exposure time
    const exposureTime = state.totalTradeDuration / (totalDays * 24 * 60) * 100;
    
    return {
      annualizedReturn: annualizedReturn * 100,
      sharpeRatio,
      sortinoRatio,
      calmarRatio,
      winRate,
      profitFactor,
      averageWin,
      averageLoss,
      averageTradeReturn,
      averageTimeInMarket,
      exposureTime,
      monthlyReturns
    };
  }

  calculateMonthlyReturns(equity) {
    const monthlyReturns = [];
    const monthlyEquity = new Map();
    
    // Group equity by month
    equity.forEach(e => {
      const date = new Date(e.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (!monthlyEquity.has(key)) {
        monthlyEquity.set(key, {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          startEquity: e.equity,
          endEquity: e.equity
        });
      } else {
        monthlyEquity.get(key).endEquity = e.equity;
      }
    });
    
    // Calculate monthly returns
    monthlyEquity.forEach(data => {
      const returnAmount = data.endEquity - data.startEquity;
      const returnPercent = (returnAmount / data.startEquity) * 100;
      
      monthlyReturns.push({
        year: data.year,
        month: data.month,
        return: returnAmount,
        returnPercent: returnPercent
      });
    });
    
    return monthlyReturns;
  }
}

// Export singleton instance
const backtestEngine = new BacktestEngine();
export default backtestEngine;