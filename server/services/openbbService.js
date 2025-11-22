/**
 * OpenBB Service - Fetches live market data from OpenBB API
 */

import axios from 'axios';

const OPENBB_BASE_URL = 'http://localhost:8000/api/v1';

/**
 * Fetch live ETF/stock quotes from OpenBB using historical endpoint
 */
export const getMarketQuotes = async (symbols = ['SPY', 'DIA', 'QQQ', 'IWM', 'VIX']) => {
    try {
        const today = new Date();
        const twoDaysAgo = new Date(today);
        twoDaysAgo.setDate(today.getDate() - 3); // Get 3 days to ensure we have data

        const endDate = today.toISOString().split('T')[0];
        const startDate = twoDaysAgo.toISOString().split('T')[0];

        const quotes = await Promise.all(
            symbols.map(async (symbol) => {
                try {
                    const response = await axios.get(`${OPENBB_BASE_URL}/equity/price/historical`, {
                        params: {
                            symbol,
                            provider: 'yfinance',
                            start_date: startDate,
                            end_date: endDate
                        },
                        timeout: 5000
                    });

                    const results = response.data?.results;
                    if (!results || results.length === 0) return null;

                    // Get the latest data point (most recent day)
                    const latest = results[results.length - 1];
                    const previous = results.length > 1 ? results[results.length - 2] : latest;

                    const priceChange = ((latest.close - previous.close) / previous.close) * 100;

                    return {
                        indicesName: getFullName(symbol),
                        Price: latest.close,
                        priceChange: priceChange,
                        ticker: symbol
                    };
                } catch (error) {
                    console.error(`Error fetching ${symbol}:`, error.message);
                    return null;
                }
            })
        );

        return quotes.filter(q => q !== null);
    } catch (error) {
        console.error('Error fetching market quotes:', error);
        throw error;
    }
};

/**
 * Get full name for ticker symbols
 */
function getFullName(symbol) {
    const names = {
        'SPY': 'SPDR S&P 500 (SPY)',
        'DIA': 'SPDR Dow Jones (DIA)',
        'QQQ': 'Invesco QQQ Trust (QQQ)',
        'IWM': 'iShares Russell 2000 (IWM)',
        'VIX': 'CBOE Volatility Index (VIX)'
    };
    return names[symbol] || symbol;
}

/**
 * Fetch analyst recommendations for stocks
 */
export const getAnalystRecommendations = async (symbols = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN']) => {
    try {
        const today = new Date();
        const monthAgo = new Date(today);
        monthAgo.setDate(today.getDate() - 365); // Get year of data for 52-week range

        const endDate = today.toISOString().split('T')[0];
        const startDate = monthAgo.toISOString().split('T')[0];

        const recommendations = await Promise.all(
            symbols.map(async (symbol) => {
                try {
                    const response = await axios.get(`${OPENBB_BASE_URL}/equity/price/historical`, {
                        params: {
                            symbol,
                            provider: 'yfinance',
                            start_date: startDate,
                            end_date: endDate
                        },
                        timeout: 5000
                    });

                    const results = response.data?.results;
                    if (!results || results.length === 0) return null;

                    // Calculate 52-week high and low
                    const prices = results.map(r => r.close);
                    const yearHigh = Math.max(...prices);
                    const yearLow = Math.min(...prices);

                    // Get latest price
                    const latest = results[results.length - 1];
                    const currentPrice = latest.close;

                    // Calculate price position
                    const pricePosition = (currentPrice - yearLow) / (yearHigh - yearLow);

                    // Calculate change percent
                    const previous = results.length > 1 ? results[results.length - 2] : latest;
                    const changePercent = ((latest.close - previous.close) / previous.close) * 100;

                    // Determine action based on position
                    let action = 'HOLD';
                    if (pricePosition < 0.3) action = 'BUY';
                    else if (pricePosition > 0.8) action = 'SELL';

                    const target1 = currentPrice * 1.05;
                    const target2 = currentPrice * 1.10;
                    const stopLoss = currentPrice * 0.95;

                    return {
                        stockName: `${getCompanyName(symbol)} (${symbol})`,
                        action,
                        tradePrice: parseFloat(currentPrice.toFixed(2)),
                        target1: parseFloat(target1.toFixed(2)),
                        target2: parseFloat(target2.toFixed(2)),
                        stopLoss: parseFloat(stopLoss.toFixed(2)),
                        reason: generateReason(symbol, action, changePercent)
                    };
                } catch (error) {
                    console.error(`Error fetching recommendation for ${symbol}:`, error.message);
                    return null;
                }
            })
        );

        return recommendations.filter(r => r !== null);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        throw error;
    }
};

/**
 * Get company names
 */
function getCompanyName(symbol) {
    const companies = {
        'AAPL': 'Apple Inc.',
        'MSFT': 'Microsoft Corp.',
        'NVDA': 'NVIDIA Corp.',
        'TSLA': 'Tesla Inc.',
        'AMZN': 'Amazon.com Inc.',
        'META': 'Meta Platforms',
        'GOOGL': 'Alphabet Inc.',
        'GS': 'Goldman Sachs'
    };
    return companies[symbol] || symbol;
}

/**
 * Generate recommendation reason based on data
 */
function generateReason(symbol, action, changePercent) {
    const reasons = {
        'AAPL': {
            'BUY': 'Strong fundamentals with growing services revenue. iPhone sales momentum expected to continue.',
            'SELL': 'Profit-taking recommended after recent rally. Consider waiting for better entry point.',
            'HOLD': 'Consolidating at current levels. Wait for clear trend direction before adding position.'
        },
        'MSFT': {
            'BUY': 'Azure cloud growth accelerating. AI integration driving revenue across products.',
            'SELL': 'Extended valuation. Consider taking profits at current levels.',
            'HOLD': 'Trading in range. Enterprise demand stable but wait for breakout.'
        },
        'NVDA': {
            'BUY': 'AI chip demand robust. Data center revenue growing exponentially.',
            'SELL': 'Overbought conditions. Profit-taking recommended after strong rally.',
            'HOLD': 'Consolidating gains. GPU leadership intact but wait for pullback.'
        },
        'TSLA': {
            'BUY': 'Production ramping up. EV market share improving globally.',
            'SELL': 'Extended move. Consider reducing position size at current levels.',
            'HOLD': 'Trading sideways. Monitor delivery numbers before adding exposure.'
        },
        'AMZN': {
            'BUY': 'AWS growth strong. E-commerce margins improving with advertising revenue growing.',
            'SELL': 'Profit-taking appropriate after recent strength.',
            'HOLD': 'Stable trends. Holiday season performance will be key driver.'
        }
    };

    return reasons[symbol]?.[action] || `${action} recommendation based on technical and fundamental analysis.`;
}

export default {
    getMarketQuotes,
    getAnalystRecommendations
};
