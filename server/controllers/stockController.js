// server/controllers/stockController.js
import StockRecommendation from '../models/StockRecommendation.js';
import StockMarket from '../models/StockMarket.js';
import { getMarketQuotes, getAnalystRecommendations } from '../services/openbbService.js';

// Get stock recommendations - LIVE from OpenBB
export const getRecommendations = async (req, res) => {
    try {
        // Try to get live recommendations from OpenBB
        try {
            const liveRecommendations = await getAnalystRecommendations(['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'META', 'GOOGL', 'GS']);
            if (liveRecommendations && liveRecommendations.length > 0) {
                return res.status(200).json(liveRecommendations);
            }
        } catch (openbbError) {
            console.log('OpenBB unavailable, falling back to database');
        }

        // Fallback to database if OpenBB fails
        const recommendations = await StockRecommendation.find();
        res.status(200).json(recommendations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stock recommendations' });
    }
};

// Get stock market details - LIVE from OpenBB
export const getMarketDetails = async (req, res) => {
    try {
        // Try to get live market data from OpenBB
        try {
            const liveMarketData = await getMarketQuotes(['SPY', 'DIA', 'QQQ', 'IWM', 'VIX']);
            if (liveMarketData && liveMarketData.length > 0) {
                return res.status(200).json(liveMarketData);
            }
        } catch (openbbError) {
            console.log('OpenBB unavailable, falling back to database');
        }

        // Fallback to database if OpenBB fails
        const marketDetails = await StockMarket.find();
        res.status(200).json(marketDetails);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stock market details' });
    }
};

