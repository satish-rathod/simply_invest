import yahooFinance from 'yahoo-finance2';
import axios from 'axios';
import MarketData from '../models/MarketData.js';
import NodeCache from 'node-cache';

// Cache for 1 minute to avoid too many API calls
const cache = new NodeCache({ stdTTL: 60 });

// Get stock price with fallback options
export const getStockPrice = async (symbol) => {
  try {
    // Check cache first
    const cacheKey = `price_${symbol}`;
    const cachedPrice = cache.get(cacheKey);
    if (cachedPrice) {
      return cachedPrice;
    }

    let price = 0;

    // Try Yahoo Finance first
    try {
      const quote = await yahooFinance.quoteSummary(symbol, {
        modules: ['price']
      });
      price = quote.price.regularMarketPrice;
    } catch (yahooError) {
      console.log(`Yahoo Finance failed for ${symbol}, trying fallback...`);

      // Fallback to OpenBB
      try {
        const openbbUrl = process.env.OPENBB_API_URL || 'http://127.0.0.1:8000';
        // Using OpenBB equity price endpoint
        const response = await axios.get(
          `${openbbUrl}/api/v1/equity/price/quote?symbol=${symbol}&provider=yfinance`,
          { timeout: 10000 } // 10 second timeout
        );

        if (response.data && response.data.results && response.data.results.length > 0) {
          price = response.data.results[0].price;
        }
      } catch (openbbError) {
        // Silent failure for fallback
      }

      // If all else fails, return 0 to indicate invalid symbol
      if (price === 0) {
        console.warn(`Price fetch failed for ${symbol}, returning 0`);
        return 0;
      }
    }

    // Cache the price
    cache.set(cacheKey, price);

    // Store in database
    const marketData = new MarketData({
      symbol,
      price,
      timestamp: Date.now(),
      source: 'yahoo'
    });

    try {
      await marketData.save();
    } catch (dbError) {
      console.error('Error saving market data:', dbError);
    }

    // Ensure price is a valid number
    if (isNaN(price) || price === null || price === undefined) {
      console.warn(`Invalid price for ${symbol}: ${price}, defaulting to 0`);
      return 0;
    }

    return Number(price);
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return 0;
  }
};

// Get detailed stock information
export const getStockDetails = async (symbol) => {
  try {
    const cacheKey = `details_${symbol}`;
    const cachedDetails = cache.get(cacheKey);
    if (cachedDetails) {
      return cachedDetails;
    }

    let details = {};

    try {
      const quote = await yahooFinance.quoteSummary(symbol, {
        modules: ['price', 'summaryDetail', 'defaultKeyStatistics']
      });

      details = {
        name: quote.price.shortName || symbol,
        price: quote.price.regularMarketPrice,
        change: quote.price.regularMarketChange,
        changePercent: quote.price.regularMarketChangePercent,
        volume: quote.price.regularMarketVolume,
        marketCap: quote.price.marketCap,
        peRatio: quote.summaryDetail?.trailingPE,
        dividendYield: quote.summaryDetail?.dividendYield,
        fiftyTwoWeekHigh: quote.summaryDetail?.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: quote.summaryDetail?.fiftyTwoWeekLow,
        open: quote.price.regularMarketOpen,
        previousClose: quote.price.regularMarketPreviousClose
      };
    } catch (yahooError) {
      console.log(`Yahoo Finance details failed for ${symbol}, using fallback...`);

      // Fallback to basic price data
      const price = await getStockPrice(symbol);
      details = {
        name: symbol,
        price,
        change: 0,
        changePercent: 0,
        volume: 0,
        marketCap: 0,
        peRatio: 0,
        dividendYield: 0,
        fiftyTwoWeekHigh: price * 1.2,
        fiftyTwoWeekLow: price * 0.8,
        open: price,
        previousClose: price
      };
    }

    // Cache the details
    cache.set(cacheKey, details);
    return details;
  } catch (error) {
    console.error(`Error fetching details for ${symbol}:`, error);
    return {
      name: symbol,
      price: 0,
      change: 0,
      changePercent: 0,
      volume: 0,
      marketCap: 0,
      peRatio: 0,
      dividendYield: 0,
      fiftyTwoWeekHigh: 0,
      fiftyTwoWeekLow: 0,
      open: 0,
      previousClose: 0
    };
  }
};

// Get historical data for charts
export const getHistoricalData = async (symbol, period = '1y', interval = '1d') => {
  try {
    const cacheKey = `historical_${symbol}_${period}_${interval}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    let historical = [];

    try {
      let daysBack = 30;
      if (period === '1d') daysBack = 1;
      else if (period === '5d') daysBack = 5;
      else if (period === '1mo') daysBack = 30;
      else if (period === '3mo') daysBack = 90;
      else if (period === '1y') daysBack = 365;
      else if (period === 'max') daysBack = 365 * 5; // 5 years for max

      const queryOptions = {
        period1: new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000),
        period2: new Date(),
        interval: interval
      };

      // Use chart() instead of historical() for better interval support
      const result = await yahooFinance.chart(symbol, queryOptions);
      console.log(`Yahoo Finance returned ${result.quotes ? result.quotes.length : 0} records`);

      if (result.quotes) {
        historical = result.quotes.map(item => ({
          date: item.date.toISOString().split('T')[0],
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume
        }));
      }
    } catch (yahooError) {
      console.log(`Yahoo Finance historical failed for ${symbol}, trying OpenBB...`);

      try {
        const openbbUrl = process.env.OPENBB_API_URL || 'http://127.0.0.1:8000';
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - (period === '1y' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const response = await axios.get(`${openbbUrl}/api/v1/equity/price/historical`, {
          params: {
            symbol: symbol,
            start_date: startDate,
            end_date: endDate,
            provider: 'yfinance'
          },
          timeout: 10000 // 10 second timeout
        });

        if (response.data && response.data.results) {
          historical = response.data.results.map(item => ({
            date: item.date.split('T')[0],
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            volume: item.volume
          }));
        }
      } catch (openbbError) {
        console.log(`OpenBB historical failed for ${symbol}`);
      }

      if (historical.length === 0) {
        // Generate mock historical data
        // Use the same daysBack calculated above
        const days = daysBack;
        const basePrice = await getStockPrice(symbol) || 100;

        // Adjust number of points based on interval
        let points = days;
        if (interval === '5m') points = days * 78; // ~78 5-min bars in a trading day
        else if (interval === '15m') points = days * 26;
        else if (interval === '1wk') points = Math.ceil(days / 7);
        else if (interval === '1mo') points = Math.ceil(days / 30);

        // Limit max points for mock data to avoid huge arrays
        if (points > 1000) points = 1000;

        for (let i = points; i >= 0; i--) {
          const date = new Date(Date.now() - i * (days * 24 * 60 * 60 * 1000 / points));
          const randomChange = (Math.random() - 0.5) * 0.02; // ±1% random change
          const price = basePrice * (1 + randomChange);

          historical.push({
            date: date.toISOString().split('T')[0],
            open: price,
            high: price * 1.02,
            low: price * 0.98,
            close: price,
            volume: Math.floor(Math.random() * 1000000)
          });
        }
      }
    }

    // Cache with shorter TTL for historical data
    cache.set(cacheKey, historical, 300); // 5 minutes
    return historical;
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    return [];
  }
};

// Get market indices
export const getMarketIndices = async () => {
  try {
    const indices = ['SPY', 'DIA', 'QQQ', 'IWM', '^VIX'];
    const indexData = await Promise.all(
      indices.map(async (symbol) => {
        try {
          const details = await getStockDetails(symbol);
          return {
            symbol,
            name: details.name,
            price: details.price,
            change: details.change,
            changePercent: details.changePercent
          };
        } catch (error) {
          console.error(`Error fetching index data for ${symbol}:`, error);
          return {
            symbol,
            name: symbol,
            price: 0,
            change: 0,
            changePercent: 0
          };
        }
      })
    );

    return indexData;
  } catch (error) {
    console.error('Error fetching market indices:', error);
    return [];
  }
};

// Get trending stocks
export const getTrendingStocks = async () => {
  try {
    const cacheKey = 'trending_stocks';
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    let trending = [];

    try {
      const trendingSymbols = await yahooFinance.trendingSymbols('US');

      trending = await Promise.all(
        trendingSymbols.quotes.slice(0, 10).map(async (stock) => {
          try {
            const details = await getStockDetails(stock.symbol);
            return {
              symbol: stock.symbol,
              name: details.name,
              price: details.price,
              change: details.change,
              changePercent: details.changePercent
            };
          } catch (error) {
            return {
              symbol: stock.symbol,
              name: stock.symbol,
              price: 0,
              change: 0,
              changePercent: 0
            };
          }
        })
      );
    } catch (yahooError) {
      console.log('Yahoo Finance trending failed, using fallback stocks...');

      // Fallback to popular stocks
      const popularSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX'];

      trending = await Promise.all(
        popularSymbols.map(async (symbol) => {
          try {
            const details = await getStockDetails(symbol);
            return {
              symbol,
              name: details.name,
              price: details.price,
              change: details.change,
              changePercent: details.changePercent
            };
          } catch (error) {
            return {
              symbol,
              name: symbol,
              price: 0,
              change: 0,
              changePercent: 0
            };
          }
        })
      );
    }

    // Cache for 5 minutes
    cache.set(cacheKey, trending, 300);
    return trending;
  } catch (error) {
    console.error('Error fetching trending stocks:', error);
    return [];
  }
};