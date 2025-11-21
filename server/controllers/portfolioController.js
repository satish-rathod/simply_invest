import Portfolio from '../models/Portfolio.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import MarketData from '../models/MarketData.js';
import { getStockPrice } from '../utils/marketData.js';

// Get user's portfolio
export const getPortfolio = async (req, res) => {
  try {
    const { type = 'PERSONAL' } = req.query;
    const portfolio = await Portfolio.findOne({ userId: req.user.id, type });

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
      const price = Number(holding.currentPrice) || 0;
      return total + (price * holding.quantity);
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
    const { type = 'PERSONAL' } = req.body;
    let portfolio = await Portfolio.findOne({ userId: req.user.id, type });

    if (!portfolio) {
      portfolio = new Portfolio({
        userId: req.user.id,
        type,
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
    const { symbol, quantity, price, type = 'PERSONAL' } = req.body;

    if (!symbol || !quantity) {
      return res.status(400).json({ message: 'Symbol and quantity are required' });
    }

    if (type === 'PERSONAL' && !price) {
      return res.status(400).json({ message: 'Price is required for personal portfolio' });
    }

    // Validate symbol against market data
    const marketPrice = await getStockPrice(symbol);
    if (!marketPrice || marketPrice === 0) {
      return res.status(400).json({ message: `Invalid symbol: ${symbol}` });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let executionPrice = price;

    // Virtual Trading Logic
    if (type === 'VIRTUAL') {
      executionPrice = marketPrice; // Enforce market price
      const totalCost = quantity * executionPrice;
      const currentBalance = user.virtualBalance || 50000;

      if (currentBalance < totalCost) {
        return res.status(400).json({ message: `Insufficient funds. Balance: $${currentBalance.toFixed(2)}, Cost: $${totalCost.toFixed(2)}` });
      }

      // Deduct balance
      user.virtualBalance = currentBalance - totalCost;
      await user.save();
    }

    let portfolio = await Portfolio.findOne({ userId: req.user.id, type });

    if (!portfolio) {
      portfolio = new Portfolio({ userId: req.user.id, type });
    }

    // Check if stock already exists in portfolio
    const existingHolding = portfolio.holdings.find(h => h.symbol === symbol);

    if (existingHolding) {
      // Update existing holding (average price calculation)
      const totalQuantity = existingHolding.quantity + quantity;
      const totalValue = (existingHolding.averagePrice * existingHolding.quantity) + (executionPrice * quantity);
      existingHolding.averagePrice = totalValue / totalQuantity;
      existingHolding.quantity = totalQuantity;
      existingHolding.lastUpdated = Date.now();
    } else {
      // Add new holding
      portfolio.holdings.push({
        symbol,
        quantity,
        averagePrice: executionPrice,
        currentPrice: executionPrice,
        purchaseDate: Date.now(),
        lastUpdated: Date.now()
      });
    }

    // Update portfolio totals
    portfolio.totalValue = portfolio.holdings.reduce((total, holding) => {
      return total + (holding.currentPrice || holding.averagePrice) * holding.quantity;
    }, 0);

    // Create transaction record
    const transaction = new Transaction({
      userId: req.user.id,
      portfolioId: portfolio.id,
      symbol,
      type: 'BUY',
      quantity,
      price: executionPrice,
      totalAmount: quantity * executionPrice
    });

    await transaction.save();
    await portfolio.save();

    res.status(201).json({ portfolio, transaction, newBalance: user.virtualBalance });
  } catch (error) {
    console.error('Error adding stock:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove stock from portfolio
export const removeStock = async (req, res) => {
  try {
    const { symbol, quantity, price, type = 'PERSONAL' } = req.body;

    if (!symbol || !quantity) {
      return res.status(400).json({ message: 'Symbol and quantity are required' });
    }

    if (type === 'PERSONAL' && !price) {
      return res.status(400).json({ message: 'Price is required for personal portfolio' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const portfolio = await Portfolio.findOne({ userId: req.user.id, type });

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

    let executionPrice = price;

    // Virtual Trading Logic
    if (type === 'VIRTUAL') {
      const marketPrice = await getStockPrice(symbol);
      executionPrice = marketPrice; // Enforce market price

      const totalSale = quantity * executionPrice;

      // Add to balance
      user.virtualBalance = (user.virtualBalance || 50000) + totalSale;
      await user.save();
    }

    if (holding.quantity === quantity) {
      // Remove holding completely
      portfolio.holdings.splice(holdingIndex, 1);
    } else {
      // Reduce quantity
      holding.quantity -= quantity;
      holding.lastUpdated = Date.now();
    }

    // Update portfolio totals
    portfolio.totalValue = portfolio.holdings.reduce((total, holding) => {
      return total + (holding.currentPrice || holding.averagePrice) * holding.quantity;
    }, 0);

    // Create transaction record
    const transaction = new Transaction({
      userId: req.user.id,
      portfolioId: portfolio.id,
      symbol,
      type: 'SELL',
      quantity,
      price: executionPrice,
      totalAmount: quantity * executionPrice
    });

    await transaction.save();
    await portfolio.save();

    res.json({ portfolio, transaction, newBalance: user.virtualBalance });
  } catch (error) {
    console.error('Error removing stock:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get portfolio performance
export const getPortfolioPerformance = async (req, res) => {
  try {
    const { type = 'PERSONAL' } = req.query;
    const portfolio = await Portfolio.findOne({ userId: req.user.id, type });

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const transactions = await Transaction.find({
      userId: req.user.id,
      portfolioId: portfolio.id
    }).sort({ createdAt: -1 });

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
    const { type = 'PERSONAL' } = req.query;

    // First find the portfolio to get its ID
    const portfolio = await Portfolio.findOne({ userId: req.user.id, type });

    if (!portfolio) {
      return res.json([]); // Return empty array if portfolio doesn't exist yet
    }

    const transactions = await Transaction.find({
      userId: req.user.id,
      portfolioId: portfolio.id
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};