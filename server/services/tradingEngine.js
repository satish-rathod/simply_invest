import TradingBot from '../models/TradingBot.js';
import Trade from '../models/Trade.js';
import { getStockPrice, getHistoricalData } from '../utils/marketData.js';
import { calculateTechnicalIndicators } from '../utils/technicalAnalysis.js';
import { sendEmail } from '../utils/email.js';

class TradingEngine {
  constructor() {
    this.activeBots = new Map();
    this.isRunning = false;
  }

  async start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🤖 Trading Engine started');
    
    // Load active bots
    await this.loadActiveBots();
    
    // Start main execution loop
    this.startExecutionLoop();
    
    // Schedule periodic bot checks
    setInterval(() => this.checkBots(), 60000); // Check every minute
  }

  async loadActiveBots() {
    try {
      const bots = await TradingBot.find({ isActive: true });
      
      for (const bot of bots) {
        this.activeBots.set(bot.id, {
          bot,
          lastExecution: null,
          positions: new Map()
        });
      }
      
      console.log(`📊 Loaded ${bots.length} active trading bots`);
    } catch (error) {
      console.error('Error loading active bots:', error);
    }
  }

  async checkBots() {
    const now = new Date();
    
    for (const [botId, botData] of this.activeBots) {
      const { bot } = botData;
      
      // Check if bot should run
      if (this.shouldRunBot(bot, now)) {
        await this.executeBotStrategy(botId);
      }
    }
  }

  shouldRunBot(bot, now) {
    // Check trading hours
    const tradingHours = bot.riskManagement.allowedTradingHours;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const [startHour, startMinute] = tradingHours.start.split(':').map(Number);
    const [endHour, endMinute] = tradingHours.end.split(':').map(Number);
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    if (currentTime < startTime || currentTime > endTime) {
      return false;
    }
    
    // Check if enough time has passed since last execution
    const timeSinceLastRun = bot.lastRunAt ? now - bot.lastRunAt : Infinity;
    const minInterval = 60000; // 1 minute minimum
    
    return timeSinceLastRun >= minInterval;
  }

  async executeBotStrategy(botId) {
    const botData = this.activeBots.get(botId);
    if (!botData) return;
    
    const { bot } = botData;
    
    try {
      // Update bot status
      bot.status = 'ACTIVE';
      bot.lastRunAt = new Date();
      await bot.save();
      
      // Execute strategy for each watched symbol
      for (const symbol of bot.watchedSymbols) {
        await this.executeStrategyForSymbol(bot, symbol);
      }
      
      // Log successful execution
      await this.logBotActivity(bot, 'INFO', 'Strategy executed successfully');
      
    } catch (error) {
      console.error(`Error executing bot ${botId}:`, error);
      
      // Update bot status to error
      bot.status = 'ERROR';
      await bot.save();
      
      // Log error
      await this.logBotActivity(bot, 'ERROR', `Strategy execution failed: ${error.message}`);
    }
  }

  async executeStrategyForSymbol(bot, symbol) {
    // Get current market data
    const currentPrice = await getStockPrice(symbol);
    const historicalData = await getHistoricalData(symbol, '1mo', '1d');
    
    if (!currentPrice || !historicalData.length) {
      await this.logBotActivity(bot, 'WARNING', `No data available for ${symbol}`);
      return;
    }
    
    // Calculate technical indicators
    const indicators = await calculateTechnicalIndicators(historicalData, bot.strategy.parameters);
    
    // Generate trading signals
    const signals = this.generateSignals(bot.strategy, indicators, currentPrice);
    
    // Check current positions
    const currentPositions = await this.getCurrentPositions(bot.id, symbol);
    
    // Execute trades based on signals
    if (signals.buy && currentPositions.length === 0) {
      await this.executeBuyOrder(bot, symbol, currentPrice, signals, indicators);
    } else if (signals.sell && currentPositions.length > 0) {
      await this.executeSellOrder(bot, symbol, currentPrice, signals, indicators, currentPositions);
    }
    
    // Check stop loss and take profit
    if (currentPositions.length > 0) {
      await this.checkStopLossAndTakeProfit(bot, symbol, currentPrice, currentPositions);
    }
  }

  generateSignals(strategy, indicators, currentPrice) {
    const signals = { buy: false, sell: false, reason: '' };
    
    switch (strategy.type) {
      case 'SMA':
        return this.generateSMASignals(strategy.parameters, indicators, currentPrice);
      case 'RSI':
        return this.generateRSISignals(strategy.parameters, indicators, currentPrice);
      case 'MACD':
        return this.generateMACDSignals(strategy.parameters, indicators, currentPrice);
      default:
        return signals;
    }
  }

  generateSMASignals(params, indicators, currentPrice) {
    const { shortSMA, longSMA } = indicators;
    const signals = { buy: false, sell: false, reason: '' };
    
    if (shortSMA && longSMA && shortSMA.length >= 2 && longSMA.length >= 2) {
      const shortCurrent = shortSMA[shortSMA.length - 1];
      const shortPrevious = shortSMA[shortSMA.length - 2];
      const longCurrent = longSMA[longSMA.length - 1];
      const longPrevious = longSMA[longSMA.length - 2];
      
      // Golden cross (bullish signal)
      if (shortPrevious <= longPrevious && shortCurrent > longCurrent) {
        signals.buy = true;
        signals.reason = 'Golden Cross: Short SMA crossed above Long SMA';
      }
      
      // Death cross (bearish signal)
      if (shortPrevious >= longPrevious && shortCurrent < longCurrent) {
        signals.sell = true;
        signals.reason = 'Death Cross: Short SMA crossed below Long SMA';
      }
    }
    
    return signals;
  }

  generateRSISignals(params, indicators, currentPrice) {
    const { rsi } = indicators;
    const signals = { buy: false, sell: false, reason: '' };
    
    if (rsi && rsi.length >= 2) {
      const rsiCurrent = rsi[rsi.length - 1];
      const rsiPrevious = rsi[rsi.length - 2];
      
      // Oversold condition (bullish signal)
      if (rsiPrevious <= params.rsiOversold && rsiCurrent > params.rsiOversold) {
        signals.buy = true;
        signals.reason = `RSI oversold recovery: ${rsiCurrent.toFixed(2)}`;
      }
      
      // Overbought condition (bearish signal)
      if (rsiPrevious >= params.rsiOverbought && rsiCurrent < params.rsiOverbought) {
        signals.sell = true;
        signals.reason = `RSI overbought reversal: ${rsiCurrent.toFixed(2)}`;
      }
    }
    
    return signals;
  }

  generateMACDSignals(params, indicators, currentPrice) {
    const { macd } = indicators;
    const signals = { buy: false, sell: false, reason: '' };
    
    if (macd && macd.length >= 2) {
      const macdCurrent = macd[macd.length - 1];
      const macdPrevious = macd[macd.length - 2];
      
      // MACD line crosses above signal line (bullish)
      if (macdPrevious.macd <= macdPrevious.signal && macdCurrent.macd > macdCurrent.signal) {
        signals.buy = true;
        signals.reason = 'MACD bullish crossover';
      }
      
      // MACD line crosses below signal line (bearish)
      if (macdPrevious.macd >= macdPrevious.signal && macdCurrent.macd < macdCurrent.signal) {
        signals.sell = true;
        signals.reason = 'MACD bearish crossover';
      }
    }
    
    return signals;
  }

  async getCurrentPositions(botId, symbol) {
    return await Trade.find({
      botId,
      symbol,
      status: 'FILLED',
      orderType: 'ENTRY'
    });
  }

  async executeBuyOrder(bot, symbol, currentPrice, signals, indicators) {
    const positionSize = Math.min(bot.strategy.parameters.maxPositionSize, bot.balance * 0.1);
    const quantity = Math.floor(positionSize / currentPrice);
    
    if (quantity <= 0) return;
    
    const trade = new Trade({
      userId: bot.userId,
      botId: bot.id,
      symbol,
      side: 'BUY',
      type: 'MARKET',
      quantity,
      price: currentPrice,
      orderType: 'ENTRY',
      status: 'FILLED',
      executedQuantity: quantity,
      executedPrice: currentPrice,
      executedAt: new Date(),
      reason: signals.reason,
      metadata: {
        indicators,
        signals,
        technicalAnalysis: {}
      }
    });
    
    await trade.save();
    
    // Update bot balance (for paper trading)
    if (!bot.isLive) {
      bot.balance -= quantity * currentPrice;
      await bot.save();
    }
    
    await this.logBotActivity(bot, 'INFO', `BUY order executed: ${quantity} shares of ${symbol} at $${currentPrice}`);
  }

  async executeSellOrder(bot, symbol, currentPrice, signals, indicators, positions) {
    for (const position of positions) {
      const pnl = (currentPrice - position.executedPrice) * position.executedQuantity;
      
      const trade = new Trade({
        userId: bot.userId,
        botId: bot.id,
        symbol,
        side: 'SELL',
        type: 'MARKET',
        quantity: position.executedQuantity,
        price: currentPrice,
        orderType: 'EXIT',
        status: 'FILLED',
        executedQuantity: position.executedQuantity,
        executedPrice: currentPrice,
        executedAt: new Date(),
        pnl,
        reason: signals.reason,
        metadata: {
          indicators,
          signals,
          technicalAnalysis: {}
        }
      });
      
      await trade.save();
      
      // Update bot balance and performance
      if (!bot.isLive) {
        bot.balance += position.executedQuantity * currentPrice;
        bot.performance.totalPnL += pnl;
        bot.performance.totalTrades += 1;
        
        if (pnl > 0) {
          bot.performance.winningTrades += 1;
        } else {
          bot.performance.losingTrades += 1;
        }
        
        bot.performance.winRate = (bot.performance.winningTrades / bot.performance.totalTrades) * 100;
        await bot.save();
      }
      
      await this.logBotActivity(bot, 'INFO', `SELL order executed: ${position.executedQuantity} shares of ${symbol} at $${currentPrice}, P&L: $${pnl.toFixed(2)}`);
    }
  }

  async checkStopLossAndTakeProfit(bot, symbol, currentPrice, positions) {
    const stopLossPercent = bot.strategy.parameters.stopLoss / 100;
    const takeProfitPercent = bot.strategy.parameters.takeProfit / 100;
    
    for (const position of positions) {
      const entryPrice = position.executedPrice;
      const stopLossPrice = entryPrice * (1 - stopLossPercent);
      const takeProfitPrice = entryPrice * (1 + takeProfitPercent);
      
      let shouldExit = false;
      let reason = '';
      
      if (currentPrice <= stopLossPrice) {
        shouldExit = true;
        reason = `Stop loss triggered at $${currentPrice} (${stopLossPercent * 100}% loss)`;
      } else if (currentPrice >= takeProfitPrice) {
        shouldExit = true;
        reason = `Take profit triggered at $${currentPrice} (${takeProfitPercent * 100}% profit)`;
      }
      
      if (shouldExit) {
        const pnl = (currentPrice - entryPrice) * position.executedQuantity;
        
        const trade = new Trade({
          userId: bot.userId,
          botId: bot.id,
          symbol,
          side: 'SELL',
          type: 'MARKET',
          quantity: position.executedQuantity,
          price: currentPrice,
          orderType: currentPrice <= stopLossPrice ? 'STOP_LOSS' : 'TAKE_PROFIT',
          status: 'FILLED',
          executedQuantity: position.executedQuantity,
          executedPrice: currentPrice,
          executedAt: new Date(),
          pnl,
          reason
        });
        
        await trade.save();
        
        // Update bot performance
        if (!bot.isLive) {
          bot.balance += position.executedQuantity * currentPrice;
          bot.performance.totalPnL += pnl;
          bot.performance.totalTrades += 1;
          
          if (pnl > 0) {
            bot.performance.winningTrades += 1;
          } else {
            bot.performance.losingTrades += 1;
          }
          
          bot.performance.winRate = (bot.performance.winningTrades / bot.performance.totalTrades) * 100;
          await bot.save();
        }
        
        await this.logBotActivity(bot, 'INFO', `${reason} - P&L: $${pnl.toFixed(2)}`);
      }
    }
  }

  async logBotActivity(bot, level, message, data = null) {
    bot.logs.push({
      timestamp: new Date(),
      level,
      message,
      data
    });
    
    // Keep only last 100 logs
    if (bot.logs.length > 100) {
      bot.logs = bot.logs.slice(-100);
    }
    
    await bot.save();
    
    // Send email notification for errors
    if (level === 'ERROR') {
      try {
        const User = (await import('../models/User.js')).default;
        const user = await User.findById(bot.userId);
        
        if (user && user.email) {
          await sendEmail(
            user.email,
            `Trading Bot Error - ${bot.name}`,
            `Your trading bot "${bot.name}" encountered an error:\n\n${message}\n\nPlease check your bot configuration and logs.`
          );
        }
      } catch (error) {
        console.error('Error sending bot notification email:', error);
      }
    }
  }
}

// Export singleton instance
const tradingEngine = new TradingEngine();
export default tradingEngine;