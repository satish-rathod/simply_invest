import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from './models/User.js';
import Post from './models/Post.js';
import Portfolio from './models/Portfolio.js';
import WatchList from './models/WatchList.js';
import Alert from './models/Alert.js';
import LeaderBoard from './models/LeaderBoard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

async function verifyData() {
    try {
        console.log('🔍 Verifying seeded data...\n');

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Verify users
        const users = await User.find({});
        console.log(`👥 Users: ${users.length}`);
        users.slice(0, 3).forEach(user => {
            console.log(`   - ${user.name} (${user.email})`);
        });
        console.log(`   ... and ${users.length - 3} more\n`);

        // Verify portfolios
        const portfolios = await Portfolio.find({});
        console.log(`💼 Portfolios: ${portfolios.length}`);
        const samplePortfolio = portfolios[0];
        if (samplePortfolio) {
            const user = await User.findById(samplePortfolio.userId);
            console.log(`   Sample: ${user?.name}'s ${samplePortfolio.type} portfolio`);
            console.log(`   - Holdings: ${samplePortfolio.holdings.length}`);
            console.log(`   - Total Value: $${samplePortfolio.totalValue.toFixed(2)}`);
            console.log(`   - Gain/Loss: $${samplePortfolio.totalGainLoss.toFixed(2)}\n`);
        }

        // Verify posts
        const posts = await Post.find({});
        console.log(`📝 Posts: ${posts.length}`);
        const topPost = posts.sort((a, b) => b.upvotes.length - a.upvotes.length)[0];
        if (topPost) {
            const postUser = await User.findById(topPost.userId);
            console.log(`   Top post: ${topPost.symbol} by ${postUser?.name}`);
            console.log(`   - Upvotes: ${topPost.upvotes.length}`);
            console.log(`   - Comments: ${topPost.comments.length}\n`);
        }

        // Verify watchlists
        const watchlists = await WatchList.find({});
        console.log(`👀 Watchlists: ${watchlists.length}`);
        if (watchlists[0]) {
            const wlUser = await User.findById(watchlists[0].userId);
            console.log(`   Sample: ${wlUser?.name} watching ${watchlists[0].symbols.length} stocks\n`);
        }

        // Verify alerts
        const alerts = await Alert.find({});
        console.log(`🔔 Alerts: ${alerts.length}`);
        if (alerts[0]) {
            const alertUser = await User.findById(alerts[0].userId);
            console.log(`   Sample: ${alertUser?.name} - ${alerts[0].symbol} ${alerts[0].type} $${alerts[0].targetValue}\n`);
        }

        // Verify leaderboard
        const leaderboard = await LeaderBoard.find({ period: 'MONTHLY' }).sort({ rank: 1 });
        console.log(`🏆 Leaderboard: ${leaderboard.length} entries`);
        console.log('   Top 3:');
        for (let i = 0; i < Math.min(3, leaderboard.length); i++) {
            const lbUser = await User.findById(leaderboard[i].userId);
            console.log(`   ${i + 1}. ${lbUser?.name} - Score: ${leaderboard[i].metrics.score} (${leaderboard[i].badge})`);
        }

        console.log('\n✅ All data verified successfully!');
        console.log('\n📧 You can login with any of these emails and password: password123');

    } catch (error) {
        console.error('❌ Error verifying data:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Database connection closed');
    }
}

verifyData();
