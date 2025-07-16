import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { analyzeSentiment, generateStockPrediction } from '../utils/aiService.js';
import { getHistoricalData, getStockDetails } from '../utils/marketData.js';
import Portfolio from '../models/Portfolio.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// All analytics routes require authentication
router.use(authMiddleware);

// Sentiment analysis
router.post('/sentiment', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required for sentiment analysis' });
    }

    const sentiment = analyzeSentiment(text);
    res.json(sentiment);
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    res.status(500).json({ error: 'Failed to analyze sentiment' });
  }
});

// Stock prediction
router.get('/prediction/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { days = 7 } = req.query;
    const prediction = await generateStockPrediction(symbol, parseInt(days));
    res.json(prediction);
  } catch (error) {
    console.error('Error generating prediction:', error);
    res.status(500).json({ error: 'Failed to generate prediction' });
  }
});

// Portfolio risk analysis
router.get('/portfolio-risk', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user.id });
    
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    // Calculate portfolio risk metrics
    const holdings = portfolio.holdings;
    const totalValue = holdings.reduce((sum, h) => sum + (h.currentPrice * h.quantity), 0);
    
    // Diversification score (based on number of holdings and sector distribution)
    const diversificationScore = Math.min(holdings.length * 10, 100);
    
    // Volatility analysis (simplified)
    const volatilityPromises = holdings.map(async (holding) => {
      try {
        const historical = await getHistoricalData(holding.symbol, '1mo', '1d');
        const returns = historical.slice(1).map((day, i) => {
          const prevClose = historical[i].close;
          return (day.close - prevClose) / prevClose;
        });
        
        const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
        const volatility = Math.sqrt(variance) * Math.sqrt(252); // Annualized
        
        return {
          symbol: holding.symbol,
          weight: (holding.currentPrice * holding.quantity) / totalValue,
          volatility: volatility || 0
        };
      } catch (error) {
        return {
          symbol: holding.symbol,
          weight: (holding.currentPrice * holding.quantity) / totalValue,
          volatility: 0.2 // Default volatility
        };
      }
    });

    const volatilityData = await Promise.all(volatilityPromises);
    const portfolioVolatility = volatilityData.reduce((sum, stock) => {
      return sum + (stock.weight * stock.volatility);
    }, 0);

    // Risk score (0-100, higher is riskier)
    const riskScore = Math.min(portfolioVolatility * 100, 100);
    
    // Risk level
    let riskLevel;
    if (riskScore < 20) riskLevel = 'Low';
    else if (riskScore < 40) riskLevel = 'Moderate';
    else if (riskScore < 60) riskLevel = 'High';
    else riskLevel = 'Very High';

    const riskAnalysis = {
      riskScore: riskScore.toFixed(2),
      riskLevel,
      portfolioVolatility: (portfolioVolatility * 100).toFixed(2) + '%',
      diversificationScore,
      holdings: holdings.length,
      recommendations: generateRiskRecommendations(riskScore, diversificationScore, holdings.length),
      stockAnalysis: volatilityData.map(stock => ({
        symbol: stock.symbol,
        weight: (stock.weight * 100).toFixed(2) + '%',
        volatility: (stock.volatility * 100).toFixed(2) + '%'
      }))
    };

    res.json(riskAnalysis);
  } catch (error) {
    console.error('Error analyzing portfolio risk:', error);
    res.status(500).json({ error: 'Failed to analyze portfolio risk' });
  }
});

// Performance analytics
router.get('/performance', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user.id });
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: 1 });
    
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    // Calculate performance over time
    const performanceData = [];
    let cumulativeInvestment = 0;
    
    for (const transaction of transactions) {
      if (transaction.type === 'BUY') {
        cumulativeInvestment += transaction.totalAmount;
      } else {
        cumulativeInvestment -= transaction.totalAmount;
      }
      
      performanceData.push({
        date: transaction.createdAt,
        investment: cumulativeInvestment,
        type: transaction.type,
        symbol: transaction.symbol,
        amount: transaction.totalAmount
      });
    }

    // Calculate returns
    const totalReturn = portfolio.totalValue - portfolio.totalInvestment;
    const totalReturnPercent = portfolio.totalInvestment > 0 ? 
      (totalReturn / portfolio.totalInvestment) * 100 : 0;

    // Best and worst performing stocks
    const stockPerformance = portfolio.holdings.map(holding => {
      const gainLoss = (holding.currentPrice - holding.averagePrice) * holding.quantity;
      const gainLossPercent = ((holding.currentPrice - holding.averagePrice) / holding.averagePrice) * 100;
      
      return {
        symbol: holding.symbol,
        gainLoss,
        gainLossPercent,
        currentValue: holding.currentPrice * holding.quantity,
        investment: holding.averagePrice * holding.quantity
      };
    });

    const bestPerformer = stockPerformance.reduce((best, current) => 
      current.gainLossPercent > best.gainLossPercent ? current : best, stockPerformance[0]);
    
    const worstPerformer = stockPerformance.reduce((worst, current) => 
      current.gainLossPercent < worst.gainLossPercent ? current : worst, stockPerformance[0]);

    const analytics = {
      totalValue: portfolio.totalValue,
      totalInvestment: portfolio.totalInvestment,
      totalReturn,
      totalReturnPercent: totalReturnPercent.toFixed(2),
      bestPerformer,
      worstPerformer,
      performanceHistory: performanceData,
      stockPerformance: stockPerformance.sort((a, b) => b.gainLossPercent - a.gainLossPercent)
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error generating performance analytics:', error);
    res.status(500).json({ error: 'Failed to generate performance analytics' });
  }
});

// Generate risk recommendations
const generateRiskRecommendations = (riskScore, diversificationScore, holdingsCount) => {
  const recommendations = [];
  
  if (riskScore > 60) {
    recommendations.push("Consider reducing exposure to high-volatility stocks");
    recommendations.push("Add some defensive stocks or bonds to your portfolio");
  }
  
  if (diversificationScore < 50) {
    recommendations.push("Increase diversification by adding more stocks from different sectors");
    recommendations.push("Consider adding international stocks or ETFs");
  }
  
  if (holdingsCount < 5) {
    recommendations.push("Consider adding more stocks to reduce concentration risk");
  }
  
  if (holdingsCount > 20) {
    recommendations.push("You may be over-diversified. Consider consolidating to your best positions");
  }
  
  if (recommendations.length === 0) {
    recommendations.push("Your portfolio risk profile looks balanced. Continue monitoring regularly");
  }
  
  return recommendations;
};

export default router;