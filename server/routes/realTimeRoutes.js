import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getStockPrice,
  getStockDetails,
  getHistoricalData,
  getMarketIndices,
  getTrendingStocks
} from '../utils/marketData.js';
import { generateStockPrediction } from '../utils/aiService.js';

const router = express.Router();

// Get current stock price
router.get('/price/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const price = await getStockPrice(symbol);
    res.json({ symbol, price });
  } catch (error) {
    console.error('Error fetching stock price:', error);
    res.status(500).json({ error: 'Failed to fetch stock price' });
  }
});

// Get detailed stock information
router.get('/stock/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const details = await getStockDetails(symbol);
    res.json(details);
  } catch (error) {
    console.error('Error fetching stock details:', error);
    res.status(500).json({ error: 'Failed to fetch stock details' });
  }
});

// Get historical data
router.get('/historical/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = '1y', interval = '1d' } = req.query;
    const data = await getHistoricalData(symbol, period, interval);
    res.json(data);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// Get market indices
router.get('/indices', async (req, res) => {
  try {
    const indices = await getMarketIndices();
    res.json(indices);
  } catch (error) {
    console.error('Error fetching market indices:', error);
    res.status(500).json({ error: 'Failed to fetch market indices' });
  }
});

// Get trending stocks
router.get('/trending', async (req, res) => {
  try {
    const trending = await getTrendingStocks();
    res.json(trending);
  } catch (error) {
    console.error('Error fetching trending stocks:', error);
    res.status(500).json({ error: 'Failed to fetch trending stocks' });
  }
});

// Get stock prediction (requires authentication)
router.get('/prediction/:symbol', authMiddleware, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { days = 7 } = req.query;
    const prediction = await generateStockPrediction(symbol, parseInt(days));
    res.json(prediction);
  } catch (error) {
    console.error('Error generating stock prediction:', error);
    res.status(500).json({ error: 'Failed to generate stock prediction' });
  }
});

export default router;