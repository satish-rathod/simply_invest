import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 });

export const getChartData = async (req, res) => {
    console.log('getChartData called with query:', req.query);
    const { symbol } = req.query;
    
    if (!symbol) {
        return res.status(400).json({ error: 'Symbol is required' });
    }

    // Check if data is in cache
    const cachedData = cache.get(symbol);
    if (cachedData) {
        console.log('Returning cached data for', symbol);
        return res.json(cachedData);
    }

    try {
        console.log('Fetching data from Alpha Vantage for', symbol);
        const response = await axios.get(`https://www.alphavantage.co/query`, {
            params: {
                function: 'TIME_SERIES_DAILY',
                symbol: symbol,
                outputsize: 'compact',
                apikey: process.env.ALPHA_VANTAGE_API_KEY
            }
        });

        console.log('Alpha Vantage response:', response.data);

        const timeSeriesData = response.data['Time Series (Daily)'];
        if (!timeSeriesData) {
            throw new Error('Invalid data received from Alpha Vantage');
        }

        const formattedData = Object.entries(timeSeriesData)
            .map(([date, values]) => ({
                date,
                close: parseFloat(values['4. close'])
            }))
            .reverse()
            .slice(0, 30);

        console.log('Formatted data:', formattedData);

        cache.set(symbol, formattedData);

        res.json(formattedData);
    } catch (error) {
        console.error('Error in getChartData:', error);
        res.status(500).json({ error: 'Failed to fetch chart data' });
    }
};

export const testRoute = (req, res) => {
    res.json({ message: 'Finance route is working' });
};