import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.js';
import Post from '../models/Post.js';
import LeaderBoard from '../models/LeaderBoard.js';
import Following from '../models/Following.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

// Sample user data
const sampleUsers = [
    { name: 'Sarah Chen', email: 'sarah.chen@example.com', password: 'password123' },
    { name: 'Michael Rodriguez', email: 'michael.r@example.com', password: 'password123' },
    { name: 'Emily Watson', email: 'emily.watson@example.com', password: 'password123' },
    { name: 'David Kim', email: 'david.kim@example.com', password: 'password123' },
    { name: 'Jessica Taylor', email: 'jessica.t@example.com', password: 'password123' },
    { name: 'Robert Johnson', email: 'robert.j@example.com', password: 'password123' },
    { name: 'Amanda Lee', email: 'amanda.lee@example.com', password: 'password123' },
    { name: 'James Wilson', email: 'james.wilson@example.com', password: 'password123' }
];

// Sample post content
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
        type: 'NEWS',
        symbol: 'BA',
        sentiment: 'BEARISH',
        content: 'Boeing delays 777X delivery again. Production issues persist. This is getting concerning for long-term holders.',
        tags: ['aerospace', 'manufacturing']
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
        type: 'QUESTION',
        symbol: 'SOFI',
        sentiment: 'NEUTRAL',
        content: 'Is SoFi finally turning the corner? The recent earnings were solid but stock isn\'t moving. What am I missing?',
        tags: ['fintech', 'banking']
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
        symbol: 'CRM',
        sentiment: 'NEUTRAL',
        content: 'Salesforce is solid but growth is slowing. Trading at reasonable valuation. Good for dividend growth investors.',
        tags: ['saas', 'enterprise', 'crm']
    },
    {
        type: 'INSIGHT',
        symbol: 'ROKU',
        sentiment: 'BEARISH',
        content: 'Roku facing intense competition from Google and Amazon in streaming devices. Margins are compressing. Staying away for now.',
        tags: ['streaming', 'hardware']
    }
];

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing social data (optional - comment out if you want to keep existing data)
        console.log('🗑️  Clearing existing social data...');
        await Post.deleteMany({ userId: { $in: [] } }); // Will be updated with sample user IDs

        // Create sample users
        console.log('👥 Creating sample users...');
        const createdUsers = [];

        for (const userData of sampleUsers) {
            // Check if user already exists
            let user = await User.findOne({ email: userData.email });

            if (!user) {
                // Hash password before creating user
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(userData.password, salt);

                user = new User({
                    name: userData.name,
                    email: userData.email,
                    password: hashedPassword
                });
                await user.save();
                console.log(`   ✓ Created user: ${userData.name}`);
            } else {
                console.log(`   ⊙ User already exists: ${userData.name}`);
            }

            createdUsers.push(user);
        }

        // Create sample posts
        console.log('📝 Creating sample posts...');
        const createdPosts = [];

        for (let i = 0; i < samplePosts.length; i++) {
            const postData = samplePosts[i];
            const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];

            // Create post with random date in the last 7 days
            const daysAgo = Math.floor(Math.random() * 7);
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

            // Add random upvotes and downvotes
            const numUpvotes = Math.floor(Math.random() * 15) + 2; // 2-16 upvotes
            const numDownvotes = Math.floor(Math.random() * 5); // 0-4 downvotes

            const voterUsers = [...createdUsers].sort(() => 0.5 - Math.random());

            for (let j = 0; j < numUpvotes && j < voterUsers.length; j++) {
                if (voterUsers[j]._id.toString() !== randomUser._id.toString()) {
                    post.upvotes.push(voterUsers[j]._id.toString());
                }
            }

            for (let j = numUpvotes; j < numUpvotes + numDownvotes && j < voterUsers.length; j++) {
                if (voterUsers[j]._id.toString() !== randomUser._id.toString() &&
                    !post.upvotes.includes(voterUsers[j]._id.toString())) {
                    post.downvotes.push(voterUsers[j]._id.toString());
                }
            }

            // Add some random comments to popular posts
            if (post.upvotes.length > 8) {
                const numComments = Math.floor(Math.random() * 3) + 1;
                const commentTexts = [
                    'Great analysis! Thanks for sharing.',
                    'I agree with this take. Solid DD.',
                    'Interesting perspective. Will look into this.',
                    'What\'s your price target?',
                    'Thanks for the insight!',
                    'Been watching this one too. Good call.',
                    'Disagree on this one, but respect the analysis.'
                ];

                for (let k = 0; k < numComments; k++) {
                    const commenter = voterUsers[k];
                    post.comments.push({
                        userId: commenter._id.toString(),
                        content: commentTexts[Math.floor(Math.random() * commentTexts.length)],
                        createdAt: new Date(createdAt.getTime() + Math.random() * 86400000) // Random time after post
                    });
                }
            }

            await post.save();
            createdPosts.push(post);
            console.log(`   ✓ Created post by ${randomUser.name}: ${postData.symbol} (${post.upvotes.length} upvotes, ${post.downvotes.length} downvotes)`);
        }

        // Create following relationships
        console.log('🔗 Creating following relationships...');
        for (let i = 0; i < createdUsers.length; i++) {
            const follower = createdUsers[i];
            const numToFollow = Math.floor(Math.random() * 4) + 2; // Follow 2-5 users

            const usersToFollow = [...createdUsers]
                .filter(u => u._id.toString() !== follower._id.toString())
                .sort(() => 0.5 - Math.random())
                .slice(0, numToFollow);

            for (const following of usersToFollow) {
                const existingFollow = await Following.findOne({
                    follower: follower._id,
                    following: following._id
                });

                if (!existingFollow) {
                    await Following.create({
                        follower: follower._id,
                        following: following._id
                    });
                }
            }
        }

        // Create leaderboard entries
        console.log('🏆 Creating leaderboard entries...');

        for (const user of createdUsers) {
            // Calculate user stats
            const userPosts = createdPosts.filter(p => p.userId.toString() === user._id.toString());
            const totalUpvotes = userPosts.reduce((sum, p) => sum + p.upvotes.length, 0);
            const followersCount = await Following.countDocuments({ following: user._id });

            // Generate realistic performance metrics
            const returnPercentage = (Math.random() * 60 - 10).toFixed(2); // -10% to +50%
            const accuracy = (Math.random() * 30 + 60).toFixed(1); // 60% to 90%
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
                rank: 0, // Will be calculated
                badge: score > 200 ? '🏆 Top Trader' : score > 100 ? '⭐ Rising Star' : '📈 Active Trader'
            });

            await leaderboardEntry.save();
            console.log(`   ✓ Created leaderboard entry for ${user.name} (Score: ${Math.round(score)})`);
        }

        // Update ranks
        const leaderboardEntries = await LeaderBoard.find({ period: 'MONTHLY' }).sort({ 'metrics.score': -1 });
        for (let i = 0; i < leaderboardEntries.length; i++) {
            leaderboardEntries[i].rank = i + 1;
            await leaderboardEntries[i].save();
        }

        console.log('\n✨ Database seeding completed successfully!');
        console.log(`   📊 Created ${createdUsers.length} users`);
        console.log(`   📝 Created ${createdPosts.length} posts`);
        console.log(`   🏆 Created ${leaderboardEntries.length} leaderboard entries`);
        console.log('\n🎉 You can now view the social feed with sample data!');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
    }
}

// Run the seed function
seedDatabase();
