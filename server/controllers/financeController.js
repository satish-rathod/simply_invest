import yahooFinance from 'yahoo-finance2';
import { getStockPrice, getHistoricalData, getMarketIndices, getStockDetails } from '../utils/marketData.js';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 });

// Helper function to get market indices is imported from utils/marketData.js

// Get daily market summary
export const getMarketSummary = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const cacheKey = `daily_market_summary_${today}`;
        const cachedSummary = cache.get(cacheKey);

        if (cachedSummary) {
            return res.json(cachedSummary);
        }

        // 1. Get Market Indices
        const indices = await getMarketIndices();
        const spy = indices.find(i => i.symbol === 'SPY');
        const marketStatus = spy && spy.changePercent >= 0 ? 'Bullish' : 'Bearish';
        const marketColor = spy && spy.changePercent >= 0 ? 'green' : 'red';

        // 2. Get Top News (Simulated for now as we don't have a full news API setup in this file)
        // In a real app, we would call a News API here.
        // We'll construct a narrative based on the indices.

        const topGainers = indices.filter(i => i.changePercent > 0).map(i => i.name).join(', ');
        const topLosers = indices.filter(i => i.changePercent < 0).map(i => i.name).join(', ');

        let summaryText = `The market is currently ${marketStatus.toLowerCase()}. `;
        if (spy) {
            summaryText += `The S&P 500 is trading at $${spy.price.toFixed(2)}, ${spy.changePercent >= 0 ? 'up' : 'down'} ${Math.abs(spy.changePercent).toFixed(2)}%. `;
        }

        if (topGainers) {
            summaryText += `Global indices like ${topGainers} are showing positive momentum. `;
        }
        if (topLosers) {
            summaryText += `However, ${topLosers} are facing some selling pressure. `;
        }

        const bullets = [
            spy ? `S&P 500: ${spy.changePercent >= 0 ? '+' : ''}${spy.changePercent.toFixed(2)}%` : 'S&P 500 data unavailable',
            `Market Sentiment: ${marketStatus}`,
            `Key Drivers: Tech and Financial sectors are in focus today.`
        ];

        const summaryData = {
            summary: summaryText,
            bullets,
            indices, // Include full indices data for the frontend
            marketStatus,
            marketColor,
            timestamp: Date.now()
        };

        // Cache for 24 hours (or until next day)
        cache.set(cacheKey, summaryData, 24 * 60 * 60);

        res.json(summaryData);
    } catch (error) {
        console.error('Error generating market summary:', error);
        res.status(500).json({ message: 'Failed to generate market summary' });
    }
};

export const getChartData = async (req, res) => {
    const { symbol, period = '1y', interval = '1d' } = req.query;

    if (!symbol) {
        return res.status(400).json({ error: 'Symbol is required' });
    }

    try {
        // Use the robust getHistoricalData from marketData.js
        // This handles caching, Yahoo Finance, OpenBB fallback, and mock data if needed
        const historicalData = await getHistoricalData(symbol, period, interval);

        if (!historicalData || historicalData.length === 0) {
            return res.status(404).json({ error: 'No data found for symbol' });
        }

        res.json(historicalData);
    } catch (error) {
        console.error('Error in getChartData:', error);
        res.status(500).json({ error: 'Failed to fetch chart data' });
    }
};

export const getStockSummary = async (req, res) => {
    const { symbol } = req.query;

    if (!symbol) {
        return res.status(400).json({ error: 'Symbol is required' });
    }

    try {
        // 1. Get Stock Details
        const details = await getStockDetails(symbol);

        // 2. Generate Simulated AI Analysis
        // In a real app, this would come from an LLM or advanced analytics API
        const isPositive = details.changePercent >= 0;
        const sentiment = isPositive ? 'Bullish' : 'Bearish';
        const estimatedPrice = details.price * (isPositive ? 1.05 : 0.95); // Simple projection

        const analysis = {
            sentiment,
            outlook: isPositive
                ? `${symbol} is showing strong momentum with a ${details.changePercent.toFixed(2)}% gain. Technical indicators suggest continued upside potential.`
                : `${symbol} is facing headwinds, down ${Math.abs(details.changePercent).toFixed(2)}%. Caution is advised as it tests support levels.`,
            estimatedPrice: estimatedPrice.toFixed(2),
            confidence: 'High',
            news: [
                {
                    title: `${symbol} ${isPositive ? 'Surges' : 'Dips'} on Latest Market Movements`,
                    source: 'Financial Times',
                    time: '2 hours ago'
                },
                {
                    title: `Analysts ${isPositive ? 'Upgrade' : 'Downgrade'} ${symbol} Price Target`,
                    source: 'Wall Street Journal',
                    time: '5 hours ago'
                },
                {
                    title: `What to Watch for ${symbol} in the Coming Week`,
                    source: 'Bloomberg',
                    time: '1 day ago'
                }
            ]
        };

        res.json({
            metrics: details,
            analysis
        });
    } catch (error) {
        console.error('Error in getStockSummary:', error);
        res.status(500).json({ error: 'Failed to fetch stock summary' });
    }
};

export const testRoute = (req, res) => {
    res.json({ message: 'Finance route is working' });
};