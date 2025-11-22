
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Portfolio from './models/Portfolio.js';
import Transaction from './models/Transaction.js';
import StockMarket from './models/StockMarket.js';
import StockRecommendation from './models/StockRecommendation.js';

dotenv.config({ path: './.env' });

const seedFullData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Portfolio.deleteMany({});
        await Transaction.deleteMany({});
        await StockMarket.deleteMany({});
        await StockRecommendation.deleteMany({});
        console.log('Cleared existing data');

        // 1. Create Test User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: hashedPassword
        });
        console.log(`Created test user: ${user.email} / password123`);

        // 2. Create Portfolio
        const portfolio = await Portfolio.create({
            userId: user._id,
            holdings: [
                { symbol: 'AAPL', quantity: 10, averagePrice: 150, currentPrice: 175, purchaseDate: new Date('2023-01-15') },
                { symbol: 'MSFT', quantity: 5, averagePrice: 280, currentPrice: 320, purchaseDate: new Date('2023-02-20') },
                { symbol: 'GOOGL', quantity: 8, averagePrice: 100, currentPrice: 130, purchaseDate: new Date('2023-03-10') }
            ],
            totalValue: 10 * 175 + 5 * 320 + 8 * 130, // 1750 + 1600 + 1040 = 4390
            totalInvestment: 10 * 150 + 5 * 280 + 8 * 100, // 1500 + 1400 + 800 = 3700
            totalGainLoss: 4390 - 3700 // 690
        });
        console.log('Created portfolio');

        // 3. Create Transactions
        const transactions = [
            {
                userId: user._id,
                portfolioId: portfolio._id,
                symbol: 'AAPL',
                type: 'BUY',
                quantity: 10,
                price: 150,
                totalAmount: 1500,
                createdAt: new Date('2023-01-15')
            },
            {
                userId: user._id,
                portfolioId: portfolio._id,
                symbol: 'MSFT',
                type: 'BUY',
                quantity: 5,
                price: 280,
                totalAmount: 1400,
                createdAt: new Date('2023-02-20')
            },
            {
                userId: user._id,
                portfolioId: portfolio._id,
                symbol: 'GOOGL',
                type: 'BUY',
                quantity: 8,
                price: 100,
                totalAmount: 800,
                createdAt: new Date('2023-03-10')
            },
            {
                userId: user._id,
                portfolioId: portfolio._id,
                symbol: 'TSLA',
                type: 'SELL',
                quantity: 2,
                price: 250,
                totalAmount: 500,
                createdAt: new Date('2023-04-05')
            }
        ];
        await Transaction.insertMany(transactions);
        console.log('Created transactions');

        // 4. Seed StockMarket data
        const marketData = [
            { indicesName: 'NIFTY 50', Price: 19675.45, priceChange: 120.50 },
            { indicesName: 'SENSEX', Price: 66023.80, priceChange: 350.20 },
            { indicesName: 'BANK NIFTY', Price: 44500.10, priceChange: -80.40 },
            { indicesName: 'NIFTY IT', Price: 32450.60, priceChange: 210.15 },
        ];
        await StockMarket.insertMany(marketData);
        console.log('Seeded StockMarket data');

        // 5. Seed StockRecommendation data
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
        console.error('Error seeding full data:', error);
        process.exit(1);
    }
};

seedFullData();
