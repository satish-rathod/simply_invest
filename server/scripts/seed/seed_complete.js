import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from './models/User.js';
import Post from './models/Post.js';
import LeaderBoard from './models/LeaderBoard.js';
import Following from './models/Following.js';
import Portfolio from './models/Portfolio.js';
import WatchList from './models/WatchList.js';
import Alert from './models/Alert.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

// 10 sample users
const sampleUsers = [
    { name: 'Sarah Chen', email: 'sarah.chen@example.com', password: 'password123' },
    { name: 'Michael Rodriguez', email: 'michael.r@example.com', password: 'password123' },
    { name: 'Emily Watson', email: 'emily.watson@example.com', password: 'password123' },
    { name: 'David Kim', email: 'david.kim@example.com', password: 'password123' },
    { name: 'Jessica Taylor', email: 'jessica.t@example.com', password: 'password123' },
    { name: 'Robert Johnson', email: 'robert.j@example.com', password: 'password123' },
    { name: 'Amanda Lee', email: 'amanda.lee@example.com', password: 'password123' },
    { name: 'James Wilson', email: 'james.wilson@example.com', password: 'password123' },
    { name: 'Lisa Anderson', email: 'lisa.anderson@example.com', password: 'password123' },
    { name: 'Thomas Martinez', email: 'thomas.m@example.com', password: 'password123' }
];

// Stock symbols for portfolios
const stockSymbols = [
    { symbol: 'AAPL', price: 178.50 },
    { symbol: 'MSFT', price: 378.25 },
    { symbol: 'GOOGL', price: 142.80 },
    { symbol: 'AMZN', price: 156.30 },
    { symbol: 'TSLA', price: 242.50 },
    { symbol: 'META', price: 485.20 },
    { symbol: 'NVDA', price: 495.75 },
    { symbol: 'NFLX', price: 485.60 },
    { symbol: 'AMD', price: 138.40 },
    { symbol: 'JPM', price: 148.90 },
    { symbol: 'V', price: 258.30 },
    { symbol: 'DIS', price: 92.15 },
    { symbol: 'COIN', price: 168.75 },
    { symbol: 'SHOP', price: 62.40 },
    { symbol: 'PLTR', price: 28.65 }
];

// Sample posts
const samplePosts = [
    {
        type: 'INSIGHT',
        symbol: 'AAPL',
        sentiment: 'BULLISH',
        content: 'Apple\'s new product lineup looks incredibly strong. The M3 chip is a game-changer for performance. Expecting strong Q4 earnings. 🚀',
        tags: ['tech', 'earnings', 'hardware']
    },
    {
        type: 'TRADE',
        symbol: 'TSLA',
        sentiment: 'BULLISH',
        content: 'Just opened a long position on Tesla at $242. The recent dip seems like a great entry point. Production numbers are solid.',
        tags: ['ev', 'automotive'],
        tradeDetails: { action: 'BUY', price: 242, quantity: 50, reasoning: 'Strong production metrics and oversold conditions' }
    },
    {
        type: 'ANALYSIS',
        symbol: 'NVDA',
        sentiment: 'BULLISH',
        content: 'NVIDIA continues to dominate the AI chip market. With data center demand skyrocketing, I see this hitting $600 by year-end. The moat is incredible.',
        tags: ['ai', 'semiconductors', 'datacenter']
    },
    {
        type: 'QUESTION',
        symbol: 'MSFT',
        sentiment: 'NEUTRAL',
        content: 'What do you all think about Microsoft\'s Azure growth? Is it sustainable against AWS competition?',
        tags: ['cloud', 'enterprise']
    },
    {
        type: 'NEWS',
        symbol: 'GOOGL',
        sentiment: 'BEARISH',
        content: 'Google facing another antitrust lawsuit. This could impact their search revenue model significantly. Might be time to reduce exposure.',
        tags: ['regulation', 'legal']
    },
    {
        type: 'INSIGHT',
        symbol: 'AMD',
        sentiment: 'BULLISH',
        content: 'AMD\'s new Ryzen 9000 series is outperforming expectations. Market share gains in both consumer and enterprise segments. Strong buy under $140.',
        tags: ['semiconductors', 'tech']
    },
    {
        type: 'TRADE',
        symbol: 'META',
        sentiment: 'NEUTRAL',
        content: 'Took profits on my Meta position. Up 35% YTD. Will look to re-enter on any pullback below $450.',
        tags: ['social-media', 'tech'],
        tradeDetails: { action: 'SELL', price: 485, quantity: 100, reasoning: 'Profit taking after strong run' }
    },
    {
        type: 'ANALYSIS',
        symbol: 'AMZN',
        sentiment: 'BULLISH',
        content: 'Amazon\'s AWS margins are expanding beautifully. E-commerce is stabilizing. The risk/reward here is excellent for long-term holders.',
        tags: ['cloud', 'ecommerce', 'aws']
    },
    {
        type: 'INSIGHT',
        symbol: 'SPY',
        sentiment: 'NEUTRAL',
        content: 'Market consolidation is healthy after the recent rally. Don\'t panic on small pullbacks. Stay focused on quality names.',
        tags: ['market', 'strategy']
    },
    {
        type: 'QUESTION',
        symbol: 'COIN',
        sentiment: 'NEUTRAL',
        content: 'Anyone else concerned about Coinbase with the recent crypto volatility? What\'s your take on their Q3 outlook?',
        tags: ['crypto', 'fintech']
    },
    {
        type: 'ANALYSIS',
        symbol: 'NFLX',
        sentiment: 'BULLISH',
        content: 'Netflix subscriber growth is accelerating again. The password sharing crackdown is working. Content pipeline looks strong for 2024.',
        tags: ['streaming', 'entertainment']
    },
    {
        type: 'TRADE',
        symbol: 'JPM',
        sentiment: 'BULLISH',
        content: 'Adding to my JPMorgan position. Banks are well-positioned with higher rates. Strong balance sheet and dividend yield.',
        tags: ['banking', 'finance'],
        tradeDetails: { action: 'BUY', price: 148, quantity: 75, reasoning: 'Higher interest rate environment benefits' }
    },
    {
        type: 'INSIGHT',
        symbol: 'DIS',
        sentiment: 'BEARISH',
        content: 'Disney is struggling with streaming losses and theme park normalization. Might be dead money for a while. Waiting for better entry.',
        tags: ['entertainment', 'streaming']
    },
    {
        type: 'ANALYSIS',
        symbol: 'V',
        sentiment: 'BULLISH',
        content: 'Visa remains a top pick in fintech. Payment volumes are strong globally. The network effect moat is unbreakable. Hold forever stock.',
        tags: ['fintech', 'payments']
    },
    {
        type: 'INSIGHT',
        symbol: 'PLTR',
        sentiment: 'BULLISH',
        content: 'Palantir\'s AI platform is gaining serious traction in enterprise. Government contracts are expanding. This could be a multi-bagger from here.',
        tags: ['ai', 'software', 'defense']
    },
    {
        type: 'TRADE',
        symbol: 'SHOP',
        sentiment: 'BULLISH',
        content: 'Started a position in Shopify at $62. E-commerce growth is far from over. This selloff seems overdone.',
        tags: ['ecommerce', 'saas'],
        tradeDetails: { action: 'BUY', price: 62, quantity: 150, reasoning: 'Oversold conditions and strong fundamentals' }
    },
    {
        type: 'ANALYSIS',
        symbol: 'NVDA',
        sentiment: 'BULLISH',
        content: 'The AI revolution is just getting started. NVIDIA is the picks and shovels play. Every major tech company needs their chips.',
        tags: ['ai', 'semiconductors']
    },
    {
        type: 'INSIGHT',
        symbol: 'AAPL',
        sentiment: 'NEUTRAL',
        content: 'Apple is fairly valued here. Great company but priced to perfection. Looking for a better entry point around $165.',
        tags: ['tech', 'valuation']
    }
];

async function seedDatabase() {
    try {
        console.log('🌱 Starting comprehensive database seeding...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // CLEAN DATABASE
        console.log('🗑️  Cleaning database...');
        await User.deleteMany({});
        await Post.deleteMany({});
        await LeaderBoard.deleteMany({});
        await Following.deleteMany({});
        await Portfolio.deleteMany({});
        await WatchList.deleteMany({});
        await Alert.deleteMany({});
        console.log('✅ Database cleaned\n');

        // CREATE USERS
        console.log('👥 Creating 10 users...');
        const createdUsers = [];
        const salt = await bcrypt.genSalt(10);

        for (const userData of sampleUsers) {
            const hashedPassword = await bcrypt.hash(userData.password, salt);
            const user = new User({
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
                virtualBalance: 100000 // $100k virtual balance
            });
            await user.save();
            createdUsers.push(user);
            console.log(`   ✓ Created user: ${userData.name} (${userData.email})`);
        }
        console.log(`✅ Created ${createdUsers.length} users\n`);

        // CREATE PORTFOLIOS WITH HOLDINGS
        console.log('💼 Creating portfolios with holdings...');
        for (const user of createdUsers) {
            // Create PERSONAL portfolio
            const numHoldings = Math.floor(Math.random() * 5) + 3; // 3-7 holdings
            const selectedStocks = [...stockSymbols]
                .sort(() => 0.5 - Math.random())
                .slice(0, numHoldings);

            const holdings = selectedStocks.map(stock => {
                const quantity = Math.floor(Math.random() * 50) + 10; // 10-59 shares
                const purchasePriceVariation = (Math.random() * 0.3 - 0.15); // -15% to +15%
                const averagePrice = stock.price * (1 + purchasePriceVariation);

                return {
                    symbol: stock.symbol,
                    quantity,
                    averagePrice: parseFloat(averagePrice.toFixed(2)),
                    currentPrice: stock.price,
                    purchaseDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date in last year
                    lastUpdated: new Date()
                };
            });

            const totalInvestment = holdings.reduce((sum, h) => sum + (h.quantity * h.averagePrice), 0);
            const totalValue = holdings.reduce((sum, h) => sum + (h.quantity * h.currentPrice), 0);
            const totalGainLoss = totalValue - totalInvestment;

            const portfolio = new Portfolio({
                userId: user._id.toString(),
                type: 'PERSONAL',
                holdings,
                totalValue: parseFloat(totalValue.toFixed(2)),
                totalInvestment: parseFloat(totalInvestment.toFixed(2)),
                totalGainLoss: parseFloat(totalGainLoss.toFixed(2))
            });
            await portfolio.save();

            // Create VIRTUAL portfolio
            const virtualHoldings = [...stockSymbols]
                .sort(() => 0.5 - Math.random())
                .slice(0, Math.floor(Math.random() * 4) + 2)
                .map(stock => ({
                    symbol: stock.symbol,
                    quantity: Math.floor(Math.random() * 100) + 20,
                    averagePrice: stock.price * (1 + (Math.random() * 0.2 - 0.1)),
                    currentPrice: stock.price,
                    purchaseDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
                    lastUpdated: new Date()
                }));

            const virtualTotalInvestment = virtualHoldings.reduce((sum, h) => sum + (h.quantity * h.averagePrice), 0);
            const virtualTotalValue = virtualHoldings.reduce((sum, h) => sum + (h.quantity * h.currentPrice), 0);

            const virtualPortfolio = new Portfolio({
                userId: user._id.toString(),
                type: 'VIRTUAL',
                holdings: virtualHoldings,
                totalValue: parseFloat(virtualTotalValue.toFixed(2)),
                totalInvestment: parseFloat(virtualTotalInvestment.toFixed(2)),
                totalGainLoss: parseFloat((virtualTotalValue - virtualTotalInvestment).toFixed(2))
            });
            await virtualPortfolio.save();

            console.log(`   ✓ Created portfolios for ${user.name}: ${holdings.length} personal holdings, ${virtualHoldings.length} virtual holdings`);
        }
        console.log(`✅ Created portfolios for all users\n`);

        // CREATE WATCHLISTS
        console.log('👀 Creating watchlists...');
        for (const user of createdUsers) {
            const numWatchlistItems = Math.floor(Math.random() * 5) + 3;
            const watchlistStocks = [...stockSymbols]
                .sort(() => 0.5 - Math.random())
                .slice(0, numWatchlistItems)
                .map(stock => stock.symbol);

            const watchlist = new WatchList({
                userId: user._id.toString(),
                name: 'My Watchlist',
                symbols: watchlistStocks,
                isDefault: true
            });
            await watchlist.save();
            console.log(`   ✓ Created watchlist for ${user.name}: ${watchlistStocks.join(', ')}`);
        }
        console.log(`✅ Created watchlists\n`);


        // CREATE ALERTS
        console.log('🔔 Creating price alerts...');
        for (const user of createdUsers) {
            const numAlerts = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < numAlerts; i++) {
                const stock = stockSymbols[Math.floor(Math.random() * stockSymbols.length)];
                const type = Math.random() > 0.5 ? 'PRICE_ABOVE' : 'PRICE_BELOW';
                const targetValue = type === 'PRICE_ABOVE'
                    ? stock.price * (1 + Math.random() * 0.1)
                    : stock.price * (1 - Math.random() * 0.1);

                const alert = new Alert({
                    userId: user._id.toString(),
                    symbol: stock.symbol,
                    type,
                    targetValue: parseFloat(targetValue.toFixed(2)),
                    currentValue: stock.price,
                    isActive: true
                });
                await alert.save();
            }
            console.log(`   ✓ Created ${numAlerts} alerts for ${user.name}`);
        }
        console.log(`✅ Created price alerts\n`);


        // CREATE POSTS
        console.log('📝 Creating social posts...');
        const createdPosts = [];

        for (let i = 0; i < samplePosts.length; i++) {
            const postData = samplePosts[i];
            const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];

            const daysAgo = Math.floor(Math.random() * 14);
            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - daysAgo);
            createdAt.setHours(Math.floor(Math.random() * 24));

            const post = new Post({
                userId: randomUser._id,
                content: postData.content,
                type: postData.type,
                symbol: postData.symbol,
                sentiment: postData.sentiment,
                tags: postData.tags,
                tradeDetails: postData.tradeDetails || {},
                upvotes: [],
                downvotes: [],
                comments: [],
                createdAt,
                updatedAt: createdAt
            });

            // Add random upvotes
            const numUpvotes = Math.floor(Math.random() * 20) + 3;
            const voterUsers = [...createdUsers].sort(() => 0.5 - Math.random());

            for (let j = 0; j < numUpvotes && j < voterUsers.length; j++) {
                if (voterUsers[j]._id.toString() !== randomUser._id.toString()) {
                    post.upvotes.push(voterUsers[j]._id.toString());
                }
            }

            // Add random downvotes
            const numDownvotes = Math.floor(Math.random() * 3);
            for (let j = numUpvotes; j < numUpvotes + numDownvotes && j < voterUsers.length; j++) {
                if (voterUsers[j]._id.toString() !== randomUser._id.toString() &&
                    !post.upvotes.includes(voterUsers[j]._id.toString())) {
                    post.downvotes.push(voterUsers[j]._id.toString());
                }
            }

            // Add comments to popular posts
            if (post.upvotes.length > 10) {
                const commentTexts = [
                    'Great analysis! Thanks for sharing.',
                    'I agree with this take. Solid DD.',
                    'Interesting perspective. Will look into this.',
                    'What\'s your price target?',
                    'Thanks for the insight!',
                    'Been watching this one too. Good call.'
                ];

                const numComments = Math.floor(Math.random() * 4) + 1;
                for (let k = 0; k < numComments; k++) {
                    const commenter = voterUsers[k];
                    post.comments.push({
                        userId: commenter._id.toString(),
                        content: commentTexts[Math.floor(Math.random() * commentTexts.length)],
                        createdAt: new Date(createdAt.getTime() + Math.random() * 86400000)
                    });
                }
            }

            await post.save();
            createdPosts.push(post);
            console.log(`   ✓ Post by ${randomUser.name}: ${postData.symbol} (${post.upvotes.length} ⬆️, ${post.comments.length} 💬)`);
        }
        console.log(`✅ Created ${createdPosts.length} posts\n`);

        // CREATE FOLLOWING RELATIONSHIPS
        console.log('🔗 Creating following relationships...');
        for (const user of createdUsers) {
            const numToFollow = Math.floor(Math.random() * 5) + 2;
            const usersToFollow = [...createdUsers]
                .filter(u => u._id.toString() !== user._id.toString())
                .sort(() => 0.5 - Math.random())
                .slice(0, numToFollow);

            for (const following of usersToFollow) {
                await Following.create({
                    follower: user._id,
                    following: following._id
                });
            }
            console.log(`   ✓ ${user.name} follows ${numToFollow} users`);
        }
        console.log(`✅ Created following relationships\n`);

        // CREATE LEADERBOARD
        console.log('🏆 Creating leaderboard...');
        for (const user of createdUsers) {
            const userPosts = createdPosts.filter(p => p.userId.toString() === user._id.toString());
            const totalUpvotes = userPosts.reduce((sum, p) => sum + p.upvotes.length, 0);
            const followersCount = await Following.countDocuments({ following: user._id });

            const returnPercentage = (Math.random() * 70 - 15).toFixed(2);
            const accuracy = (Math.random() * 25 + 65).toFixed(1);
            const score = totalUpvotes * 10 + followersCount * 5 + parseFloat(returnPercentage);

            const leaderboardEntry = new LeaderBoard({
                userId: user._id,
                period: 'MONTHLY',
                metrics: {
                    totalReturn: parseFloat(returnPercentage) * 1000,
                    returnPercentage: parseFloat(returnPercentage),
                    accuracy: parseFloat(accuracy),
                    posts: userPosts.length,
                    likes: totalUpvotes,
                    followers: followersCount,
                    score: Math.round(score)
                },
                rank: 0,
                badge: score > 200 ? '🏆 Top Trader' : score > 100 ? '⭐ Rising Star' : '📈 Active Trader'
            });

            await leaderboardEntry.save();
            console.log(`   ✓ ${user.name}: Score ${Math.round(score)} (${returnPercentage}% return, ${accuracy}% accuracy)`);
        }

        // Update ranks
        const leaderboardEntries = await LeaderBoard.find({ period: 'MONTHLY' }).sort({ 'metrics.score': -1 });
        for (let i = 0; i < leaderboardEntries.length; i++) {
            leaderboardEntries[i].rank = i + 1;
            await leaderboardEntries[i].save();
        }
        console.log(`✅ Created leaderboard with rankings\n`);

        console.log('═══════════════════════════════════════════════════════');
        console.log('✨ DATABASE SEEDING COMPLETED SUCCESSFULLY! ✨');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`👥 Users: ${createdUsers.length}`);
        console.log(`💼 Portfolios: ${createdUsers.length * 2} (Personal + Virtual)`);
        console.log(`📝 Posts: ${createdPosts.length}`);
        console.log(`👀 Watchlists: ${createdUsers.length}`);
        console.log(`🔔 Alerts: Created for all users`);
        console.log(`🔗 Following relationships: Created`);
        console.log(`🏆 Leaderboard: ${leaderboardEntries.length} entries`);
        console.log('═══════════════════════════════════════════════════════');
        console.log('\n📧 Login credentials for all users:');
        console.log('   Email: [user email from list above]');
        console.log('   Password: password123');
        console.log('\n🎉 Ready to use!');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Database connection closed');
    }
}

seedDatabase();
