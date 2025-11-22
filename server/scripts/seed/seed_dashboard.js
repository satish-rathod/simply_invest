
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import StockMarket from './models/StockMarket.js';
import StockRecommendation from './models/StockRecommendation.js';

dotenv.config({ path: './.env' });

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await StockMarket.deleteMany({});
        await StockRecommendation.deleteMany({});
        console.log('Cleared existing data');

        // Seed StockMarket data
        const marketData = [
            { indicesName: 'NIFTY 50', Price: 19675.45, priceChange: 120.50 },
            { indicesName: 'SENSEX', Price: 66023.80, priceChange: 350.20 },
            { indicesName: 'BANK NIFTY', Price: 44500.10, priceChange: -80.40 },
            { indicesName: 'NIFTY IT', Price: 32450.60, priceChange: 210.15 },
        ];
        await StockMarket.insertMany(marketData);
        console.log('Seeded StockMarket data');

        // Seed StockRecommendation data
        const recommendations = [
            {
                stockName: 'RELIANCE',
                tradePrice: 2450.00,
                action: 'BUY',
                stopLoss: 2400.00,
                target1: 2550.00,
                target2: 2600.00,
                reason: 'Strong quarterly results and positive breakout.',
            },
            {
                stockName: 'TCS',
                tradePrice: 3500.00,
                action: 'HOLD',
                stopLoss: 3400.00,
                target1: 3600.00,
                target2: 3700.00,
                reason: 'Consolidating near support levels.',
            },
            {
                stockName: 'INFY',
                tradePrice: 1450.00,
                action: 'BUY',
                stopLoss: 1400.00,
                target1: 1550.00,
                target2: 1600.00,
                reason: 'Undervalued compared to peers.',
            },
            {
                stockName: 'HDFCBANK',
                tradePrice: 1600.00,
                action: 'SELL',
                stopLoss: 1650.00,
                target1: 1550.00,
                target2: 1500.00,
                reason: 'Weak global cues affecting banking sector.',
            },
        ];
        await StockRecommendation.insertMany(recommendations);
        console.log('Seeded StockRecommendation data');

        mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
