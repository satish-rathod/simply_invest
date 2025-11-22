/**
 * Script to update market data with global ETFs and recommendations
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import StockMarket from '../models/StockMarket.js';
import StockRecommendation from '../models/StockRecommendation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from server directory
dotenv.config({ path: join(__dirname, '../.env') });

const globalMarketData = [
    {
        indicesName: 'SPDR S&P 500 (SPY)',
        Price: 659.03,
        priceChange: 0.01
    },
    {
        indicesName: 'SPDR Dow Jones (DIA)',
        Price: 462.57,
        priceChange: 0.01
    },
    {
        indicesName: 'Invesco QQQ Trust (QQQ)',
        Price: 590.07,
        priceChange: 0.01
    },
    {
        indicesName: 'iShares Russell 2000 (IWM)',
        Price: 235.60,
        priceChange: 0.03
    },
    {
        indicesName: 'CBOE Volatility Index (VIX)',
        Price: 14.25,
        priceChange: -2.15
    }
];

const globalRecommendations = [
    {
        stockName: 'Apple Inc. (AAPL)',
        action: 'BUY',
        tradePrice: 195.50,
        target1: 205.00,
        target2: 210.00,
        stopLoss: 188.00,
        reason: 'Strong Q4 earnings expected with iPhone 15 sales momentum. Apple\'s services segment showing consistent growth. Technical indicators suggest upward momentum.'
    },
    {
        stockName: 'Microsoft Corp. (MSFT)',
        action: 'BUY',
        tradePrice: 425.30,
        target1: 445.00,
        target2: 460.00,
        stopLoss: 410.00,
        reason: 'Azure cloud growth accelerating. AI integration across products driving revenue. Strong enterprise demand and solid balance sheet.'
    },
    {
        stockName: 'NVIDIA Corp. (NVDA)',
        action: 'BUY',
        tradePrice: 880.50,
        target1: 950.00,
        target2: 1000.00,
        stopLoss: 840.00,
        reason: 'AI chip demand remains robust. Data center revenue growing exponentially. Market leader in GPU technology with limited competition.'
    },
    {
        stockName: 'Tesla Inc. (TSLA)',
        action: 'HOLD',
        tradePrice: 245.80,
        target1: 265.00,
        target2: 280.00,
        stopLoss: 230.00,
        reason: 'Consolidating after recent rally. EV market share stable. Wait for better entry point or breakout above $260. Production numbers improving globally.'
    },
    {
        stockName: 'Amazon.com Inc. (AMZN)',
        action: 'BUY',
        tradePrice: 178.60,
        target1: 190.00,
        target2: 200.00,
        stopLoss: 170.00,
        reason: 'AWS growth accelerating, e-commerce margins improving. Strong holiday season expected. Advertising business showing robust growth.'
    },
    {
        stockName: 'Meta Platforms (META)',
        action: 'BUY',
        tradePrice: 512.40,
        target1: 540.00,
        target2: 560.00,
        stopLoss: 490.00,
        reason: 'Cost-cutting measures showing results. AI investments paying off. Advertising revenue recovering. Instagram and WhatsApp monetization improving.'
    },
    {
        stockName: 'Alphabet Inc. (GOOGL)',
        action: 'BUY',
        tradePrice: 165.20,
        target1: 175.00,
        target2: 182.00,
        stopLoss: 158.00,
        reason: 'Google Cloud gaining market share. Search advertising revenue stable. AI integration across products. YouTube showing strong engagement metrics.'
    },
    {
        stockName: 'Goldman Sachs (GS)',
        action: 'SELL',
        tradePrice: 485.30,
        target1: 465.00,
        target2: 450.00,
        stopLoss: 495.00,
        reason: 'Investment banking headwinds continuing. Rising interest rates impacting trading volumes. Consider profit-taking at current levels.'
    }
];

async function updateMarketData() {
    try {
        // Connect to MongoDB with fallback
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/simply_invest';
        await mongoose.connect(mongoURI);
        console.log('✓ Connected to MongoDB');

        // Clear existing market data
        await StockMarket.deleteMany({});
        console.log('✓ Cleared old market data');

        // Insert new global market data
        await StockMarket.insertMany(globalMarketData);
        console.log('✓ Inserted global market ETF data');

        // Clear existing recommendations
        await StockRecommendation.deleteMany({});
        console.log('✓ Cleared old recommendations');

        // Insert new global recommendations
        await StockRecommendation.insertMany(globalRecommendations);
        console.log('✓ Inserted global market recommendations');

        console.log('\n✅ Successfully updated to global market data!');
        console.log('\nMarket Indices:');
        globalMarketData.forEach(item => {
            console.log(`  - ${item.indicesName}: $${item.Price} (${item.Change})`);
        });

        console.log('\nRecommendations:');
        globalRecommendations.forEach(item => {
            console.log(`  - ${item.stockName}: ${item.action} @ $${item.tradePrice}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('✗ Error updating market data:', error);
        process.exit(1);
    }
}

updateMarketData();
