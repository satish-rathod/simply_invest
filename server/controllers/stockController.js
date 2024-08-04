// server/controllers/stockController.js
import StockRecommendation from '../models/StockRecommendation.js';
import StockMarket from '../models/StockMarket.js';

// Get stock recommendations
export const getRecommendations = async (req, res) => {
    try {
        const recommendations = await StockRecommendation.find();
        res.status(200).json(recommendations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stock recommendations' });
    }
};

// Get stock market details
export const getMarketDetails = async (req, res) => {
    try {
        const marketDetails = await StockMarket.find();
        res.status(200).json(marketDetails);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stock market details' });
    }
};
