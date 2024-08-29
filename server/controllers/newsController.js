import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2/everything';

console.log('NEWS_API_KEY:', NEWS_API_KEY); // Add this line for debugging

export const getFinancialNews = async (req, res) => {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                q: 'finance OR stock market OR economy',
                language: 'en',
                sortBy: 'publishedAt',
                pageSize: 10,
                apiKey: NEWS_API_KEY
            }
        });

        res.json(response.data.articles);
    } catch (error) {
        console.error('Error fetching news:', error.response ? error.response.data : error.message);
        res.status(500).json({ 
            message: 'Error fetching news', 
            error: error.response ? error.response.data : error.message 
        });
    }
};