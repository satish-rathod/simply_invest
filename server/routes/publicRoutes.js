import express from 'express';
import User from '../models/User.js';
import Portfolio from '../models/Portfolio.js';
import Post from '../models/Post.js';

const router = express.Router();

// Public stats endpoint for landing page
router.get('/stats', async (req, res) => {
    try {
        // Get active users count
        const activeUsers = await User.countDocuments();

        // Calculate total assets managed across all portfolios
        const portfolios = await Portfolio.find().select('totalValue');
        const totalAssets = portfolios.reduce((sum, p) => sum + (p.totalValue || 0), 0);

        // Get total posts count as a measure of community engagement
        const totalPosts = await Post.countDocuments();

        // Format the response
        const stats = {
            activeUsers: activeUsers.toLocaleString(),
            assetsManaged: `$${(totalAssets / 1000000).toFixed(1)}M`,
            uptime: '99.9%', // This is a constant for now
            support: '24/7', // This is a constant
            communityPosts: totalPosts.toLocaleString()
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching public stats:', error);
        // Return default values on error to prevent landing page from breaking
        res.json({
            activeUsers: '10,000+',
            assetsManaged: '$50M+',
            uptime: '99.9%',
            support: '24/7',
            communityPosts: '5,000+'
        });
    }
});

export default router;
