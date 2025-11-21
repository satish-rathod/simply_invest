
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import StockRecommendation from './models/StockRecommendation.js';
import StockMarket from './models/StockMarket.js';

dotenv.config({ path: './.env' });

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const recommendationCount = await StockRecommendation.countDocuments();
        const marketCount = await StockMarket.countDocuments();

        console.log(`StockRecommendation count: ${recommendationCount}`);
        console.log(`StockMarket count: ${marketCount}`);

        mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkData();
