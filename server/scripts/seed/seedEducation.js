import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Course.js';
import MarketInsight from './models/MarketInsight.js';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const courses = [
    {
        id: uuidv4(),
        title: 'Stock Market Basics',
        description: 'Learn the fundamentals of the stock market, how it works, and key concepts for beginners.',
        category: 'BASICS',
        difficulty: 'BEGINNER',
        estimatedTime: 60,
        isPublished: true,
        createdBy: 'System',
        lessons: [
            {
                id: uuidv4(),
                title: 'What is the Stock Market?',
                content: 'The stock market is a venue where shares of public listed companies are traded...',
                duration: 10,
                order: 1,
                quiz: [
                    {
                        question: 'What is a stock?',
                        options: ['A type of bond', 'Ownership share in a company', 'A loan to the government', 'A savings account'],
                        correctAnswer: 1,
                        explanation: 'A stock represents a fractional ownership in a company.'
                    }
                ]
            },
            {
                id: uuidv4(),
                title: 'How to Buy Stocks',
                content: 'To buy stocks, you need a brokerage account...',
                duration: 15,
                order: 2,
                quiz: [
                    {
                        question: 'What do you need to buy stocks?',
                        options: ['A bank account only', 'A brokerage account', 'A license', 'A lot of money'],
                        correctAnswer: 1,
                        explanation: 'You need a brokerage account to execute trades on the stock market.'
                    }
                ]
            }
        ]
    },
    {
        id: uuidv4(),
        title: 'Introduction to Technical Analysis',
        description: 'Master the art of reading charts and understanding market trends.',
        category: 'TECHNICAL_ANALYSIS',
        difficulty: 'INTERMEDIATE',
        estimatedTime: 90,
        isPublished: true,
        createdBy: 'System',
        lessons: [
            {
                id: uuidv4(),
                title: 'Understanding Candlesticks',
                content: 'Candlestick charts are used by traders to determine possible price movement based on past patterns...',
                duration: 20,
                order: 1,
                quiz: [
                    {
                        question: 'What does a green candlestick usually indicate?',
                        options: ['Price went down', 'Price went up', 'Price stayed same', 'Market closed'],
                        correctAnswer: 1,
                        explanation: 'A green candlestick typically indicates that the closing price was higher than the opening price.'
                    }
                ]
            }
        ]
    }
];

const insights = [
    {
        id: uuidv4(),
        title: 'Tech Sector Rally Continues',
        content: 'The technology sector continues to lead the market rally...',
        summary: 'Tech stocks are showing strong momentum amidst positive earnings reports.',
        category: 'MARKET_ANALYSIS',
        symbols: ['AAPL', 'MSFT', 'NVDA'],
        author: 'Market Analyst',
        sentiment: 'BULLISH',
        readTime: 5,
        isPublished: true,
        publishedAt: new Date()
    },
    {
        id: uuidv4(),
        title: 'Inflation Concerns Persist',
        content: 'Recent economic data suggests inflation might be stickier than expected...',
        summary: 'Fed may keep rates higher for longer as inflation data comes in hot.',
        category: 'ECONOMIC_NEWS',
        symbols: ['SPY', 'QQQ'],
        author: 'Economic Editor',
        sentiment: 'BEARISH',
        readTime: 4,
        isPublished: true,
        publishedAt: new Date()
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Course.deleteMany({});
        await MarketInsight.deleteMany({});
        console.log('Cleared existing courses and insights');

        // Insert new data
        await Course.insertMany(courses);
        await MarketInsight.insertMany(insights);
        console.log('Seeded courses and insights');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
