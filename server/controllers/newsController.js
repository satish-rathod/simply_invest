import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2/everything';

console.log('NEWS_API_KEY:', NEWS_API_KEY); // Add this line for debugging

import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

export const getFinancialNews = async (req, res) => {
    try {
        const cacheKey = 'financial_news';
        const cachedNews = cache.get(cacheKey);

        if (cachedNews) {
            console.log('Returning cached news');
            return res.json(cachedNews);
        }

        console.log('Fetching fresh news from API');
        const response = await axios.get(BASE_URL, {
            params: {
                q: 'finance OR stock market OR economy',
                language: 'en',
                sortBy: 'publishedAt',
                pageSize: 10,
                apiKey: NEWS_API_KEY
            }
        });

        const articles = response.data.articles;
        cache.set(cacheKey, articles);
        res.json(articles);
    } catch (error) {
        console.error('Error fetching news:', error.response ? error.response.data : error.message);
        res.status(500).json({
            message: 'Error fetching news',
            error: error.response ? error.response.data : error.message
        });
    }
};