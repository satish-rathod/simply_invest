
import Portfolio from '../models/Portfolio.js';
import Transaction from '../models/Transaction.js';

export const getDashboardSummary = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch portfolio summary (VIRTUAL)
        const portfolio = await Portfolio.findOne({ userId, type: 'VIRTUAL' });

        let portfolioSummary = {
            totalValue: 0,
            totalGainLoss: 0,
            dayGain: 0
        };

        if (portfolio) {
            portfolioSummary = {
                totalValue: portfolio.totalValue,
                totalGainLoss: portfolio.totalGainLoss,
                dayGain: 0 // Placeholder
            };
        }

        // Fetch recent transactions (VIRTUAL)
        let recentTransactions = [];
        if (portfolio) {
            recentTransactions = await Transaction.find({ userId, portfolioId: portfolio.id })
                .sort({ createdAt: -1 })
                .limit(5);
        }

        res.json({
            portfolio: portfolioSummary,
            recentTransactions
        });
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard summary' });
    }
};
