import Portfolio from '../models/Portfolio.js';
import Transaction from '../models/Transaction.js';
import MarketData from '../models/MarketData.js';
import { getStockPrice } from '../utils/marketData.js';

// Get user's portfolio
export const getPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user.id });
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    // Update current prices for all holdings
    for (let holding of portfolio.holdings) {
      try {
        const currentPrice = await getStockPrice(holding.symbol);
        holding.currentPrice = currentPrice;
        holding.lastUpdated = Date.now();
      } catch (error) {
        console.error(`Error updating price for ${holding.symbol}:`, error);
      }
    }

    // Calculate portfolio totals
    portfolio.totalValue = portfolio.holdings.reduce((total, holding) => {
      return total + (holding.currentPrice * holding.quantity);
    }, 0);

    portfolio.totalInvestment = portfolio.holdings.reduce((total, holding) => {
      return total + (holding.averagePrice * holding.quantity);
    }, 0);

    portfolio.totalGainLoss = portfolio.totalValue - portfolio.totalInvestment;

    await portfolio.save();

    res.json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create or update portfolio
export const createPortfolio = async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ userId: req.user.id });
    
    if (!portfolio) {
      portfolio = new Portfolio({
        userId: req.user.id,
        holdings: [],
        totalValue: 0,
        totalInvestment: 0,
        totalGainLoss: 0
      });
    }

    await portfolio.save();
    res.status(201).json(portfolio);
  } catch (error) {
    console.error('Error creating portfolio:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add stock to portfolio
export const addStock = async (req, res) => {
  try {
    const { symbol, quantity, price } = req.body;
    
    if (!symbol || !quantity || !price) {
      return res.status(400).json({ message: 'Symbol, quantity, and price are required' });
    }

    let portfolio = await Portfolio.findOne({ userId: req.user.id });
    
    if (!portfolio) {
      portfolio = new Portfolio({ userId: req.user.id });
    }

    // Check if stock already exists in portfolio
    const existingHolding = portfolio.holdings.find(h => h.symbol === symbol);
    
    if (existingHolding) {
      // Update existing holding (average price calculation)
      const totalQuantity = existingHolding.quantity + quantity;
      const totalValue = (existingHolding.averagePrice * existingHolding.quantity) + (price * quantity);
      existingHolding.averagePrice = totalValue / totalQuantity;
      existingHolding.quantity = totalQuantity;
      existingHolding.lastUpdated = Date.now();
    } else {
      // Add new holding
      portfolio.holdings.push({
        symbol,
        quantity,
        averagePrice: price,
        currentPrice: price,
        purchaseDate: Date.now(),
        lastUpdated: Date.now()
      });
    }

    // Create transaction record
    const transaction = new Transaction({
      userId: req.user.id,
      portfolioId: portfolio.id,
      symbol,
      type: 'BUY',
      quantity,
      price,
      totalAmount: quantity * price
    });

    await transaction.save();
    await portfolio.save();

    res.status(201).json({ portfolio, transaction });
  } catch (error) {
    console.error('Error adding stock:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove stock from portfolio
export const removeStock = async (req, res) => {
  try {
    const { symbol, quantity, price } = req.body;
    
    if (!symbol || !quantity || !price) {
      return res.status(400).json({ message: 'Symbol, quantity, and price are required' });
    }

    const portfolio = await Portfolio.findOne({ userId: req.user.id });
    
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const holdingIndex = portfolio.holdings.findIndex(h => h.symbol === symbol);
    
    if (holdingIndex === -1) {
      return res.status(404).json({ message: 'Stock not found in portfolio' });
    }

    const holding = portfolio.holdings[holdingIndex];
    
    if (holding.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient quantity to sell' });
    }

    if (holding.quantity === quantity) {
      // Remove holding completely
      portfolio.holdings.splice(holdingIndex, 1);
    } else {
      // Reduce quantity
      holding.quantity -= quantity;
      holding.lastUpdated = Date.now();
    }

    // Create transaction record
    const transaction = new Transaction({
      userId: req.user.id,
      portfolioId: portfolio.id,
      symbol,
      type: 'SELL',
      quantity,
      price,
      totalAmount: quantity * price
    });

    await transaction.save();
    await portfolio.save();

    res.json({ portfolio, transaction });
  } catch (error) {
    console.error('Error removing stock:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get portfolio performance
export const getPortfolioPerformance = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user.id });
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
    
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    // Calculate performance metrics
    const totalGainLossPercent = portfolio.totalInvestment > 0 ? 
      (portfolio.totalGainLoss / portfolio.totalInvestment) * 100 : 0;

    const performance = {
      totalValue: portfolio.totalValue,
      totalInvestment: portfolio.totalInvestment,
      totalGainLoss: portfolio.totalGainLoss,
      totalGainLossPercent,
      holdingsCount: portfolio.holdings.length,
      topPerformers: portfolio.holdings
        .map(h => ({
          symbol: h.symbol,
          gainLoss: (h.currentPrice - h.averagePrice) * h.quantity,
          gainLossPercent: ((h.currentPrice - h.averagePrice) / h.averagePrice) * 100
        }))
        .sort((a, b) => b.gainLoss - a.gainLoss)
        .slice(0, 5),
      recentTransactions: transactions.slice(0, 10)
    };

    res.json(performance);
  } catch (error) {
    console.error('Error fetching portfolio performance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get transactions
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};