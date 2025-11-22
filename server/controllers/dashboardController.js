
import Portfolio from '../models/Portfolio.js';
import Transaction from '../models/Transaction.js';

export const getDashboardSummary = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch portfolio summary (PERSONAL - real portfolio)
        const portfolio = await Portfolio.findOne({ userId, type: 'PERSONAL' });

        let portfolioSummary = {
            totalValue: 0,
            totalInvestment: 0,
            totalGainLoss: 0,
            holdingsCount: 0,
            topPerformers: []
        };

        if (portfolio) {
            // Calculate top performers
            const performers = portfolio.holdings.map(h => ({
                symbol: h.symbol,
                gainLoss: (h.currentPrice - h.averagePrice) * h.quantity,
                gainLossPercent: ((h.currentPrice - h.averagePrice) / h.averagePrice) * 100
            })).sort((a, b) => b.gainLoss - a.gainLoss);

            portfolioSummary = {
                totalValue: portfolio.totalValue || 0,
                totalInvestment: portfolio.totalInvestment || 0,
                totalGainLoss: portfolio.totalGainLoss || 0,
                holdingsCount: portfolio.holdings?.length || 0,
                topPerformers: performers
            };
        }

        // Fetch recent transactions (PERSONAL)
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
