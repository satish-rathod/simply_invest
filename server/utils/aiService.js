import OpenAI from 'openai';
import { LlmChat, UserMessage } from 'emergentintegrations/llm/chat';
import Sentiment from 'sentiment';
import natural from 'natural';
import { getStockDetails, getHistoricalData } from './marketData.js';

// Initialize sentiment analyzer
const sentiment = new Sentiment();

// Initialize OpenAI (fallback)
let openai;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-placeholder-key-add-real-key-here') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Enhanced chat response with financial context
export const generateEnhancedChatResponse = async (userMessage, conversationHistory = [], userId) => {
  try {
    // If we have a real API key, use the advanced AI service
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-placeholder-key-add-real-key-here') {
      const chat = new LlmChat(
        process.env.OPENAI_API_KEY,
        `financial_chat_${userId}`,
        `You are an expert financial advisor and investment analyst. You provide personalized investment advice, market analysis, and financial insights. You have access to real-time market data and can analyze stocks, trends, and investment opportunities. Always provide practical, actionable advice while emphasizing the importance of diversification and risk management.`
      );

      chat.with_model('openai', process.env.OPENAI_MODEL || 'gpt-4o-mini');

      const message = new UserMessage(userMessage);
      const response = await chat.send_message(message);
      
      return response;
    }

    // Fallback to basic analysis if no API key
    return await generateBasicFinancialResponse(userMessage, conversationHistory);
  } catch (error) {
    console.error('Error generating enhanced chat response:', error);
    return await generateBasicFinancialResponse(userMessage, conversationHistory);
  }
};

// Basic financial response without external AI
const generateBasicFinancialResponse = async (userMessage, conversationHistory) => {
  try {
    const lowerMessage = userMessage.toLowerCase();
    
    // Stock price queries
    if (lowerMessage.includes('price') || lowerMessage.includes('stock')) {
      const stockSymbols = extractStockSymbols(userMessage);
      if (stockSymbols.length > 0) {
        const symbol = stockSymbols[0];
        const details = await getStockDetails(symbol);
        
        return `**${details.name} (${symbol.toUpperCase()}):**
        
Current Price: $${details.price?.toFixed(2) || 'N/A'}
Change: ${details.change?.toFixed(2) || 'N/A'} (${details.changePercent?.toFixed(2) || 'N/A'}%)
Volume: ${details.volume?.toLocaleString() || 'N/A'}
Market Cap: $${details.marketCap ? (details.marketCap / 1000000000).toFixed(2) + 'B' : 'N/A'}

**Market Analysis:**
Based on the current data, here are some key insights:
- The stock is trading at $${details.price?.toFixed(2) || 'N/A'}
- 52-week range: $${details.fiftyTwoWeekLow?.toFixed(2) || 'N/A'} - $${details.fiftyTwoWeekHigh?.toFixed(2) || 'N/A'}
- P/E Ratio: ${details.peRatio?.toFixed(2) || 'N/A'}

**Investment Considerations:**
Remember to always do your own research and consider your risk tolerance. Diversification is key to managing investment risk.`;
      }
    }

    // Market analysis queries
    if (lowerMessage.includes('market') || lowerMessage.includes('trend')) {
      return `**Market Analysis:**

**Current Market Conditions:**
The market is showing mixed signals with various sectors performing differently. Here's what to watch:

**Key Factors to Monitor:**
1. **Economic Indicators**: GDP growth, inflation rates, employment data
2. **Federal Reserve Policy**: Interest rate decisions and monetary policy
3. **Corporate Earnings**: Quarterly reports and guidance
4. **Global Events**: Geopolitical tensions, trade relationships

**Investment Strategy Recommendations:**
- **Diversification**: Spread investments across different sectors and asset classes
- **Dollar-Cost Averaging**: Invest regularly regardless of market conditions
- **Risk Management**: Only invest what you can afford to lose
- **Long-term Focus**: Avoid emotional decisions based on short-term volatility

**Popular Investment Options:**
- **Blue-chip stocks**: Established companies with strong fundamentals
- **Index funds**: Broad market exposure with low fees
- **Growth stocks**: Companies with high growth potential
- **Value stocks**: Undervalued companies with strong fundamentals

Would you like me to analyze a specific stock or sector?`;
    }

    // Investment advice queries
    if (lowerMessage.includes('invest') || lowerMessage.includes('advice')) {
      return `**Investment Advice:**

**Fundamental Principles:**
1. **Start with your goals**: Define your investment timeline and objectives
2. **Risk tolerance**: Understand how much volatility you can handle
3. **Emergency fund**: Keep 3-6 months of expenses in savings first
4. **Diversification**: Don't put all eggs in one basket

**Asset Allocation by Age:**
- **20s-30s**: 80% stocks, 20% bonds (higher risk tolerance)
- **40s-50s**: 60% stocks, 40% bonds (moderate risk)
- **60s+**: 40% stocks, 60% bonds (lower risk)

**Investment Vehicles:**
- **401(k)/IRA**: Tax-advantaged retirement accounts
- **Index Funds**: Low-cost, diversified options
- **ETFs**: Flexible, liquid investment options
- **Individual Stocks**: Higher risk, potential for higher returns

**Red Flags to Avoid:**
- Promises of guaranteed returns
- High-pressure sales tactics
- Investments you don't understand
- Putting all money in one investment

**Remember**: This is general information, not personalized advice. Consider consulting with a qualified financial advisor for your specific situation.`;
    }

    // Portfolio queries
    if (lowerMessage.includes('portfolio') || lowerMessage.includes('diversification')) {
      return `**Portfolio Management:**

**Building a Balanced Portfolio:**

**Core Holdings (60-70%):**
- Large-cap index funds (S&P 500)
- International developed markets
- Bond funds for stability

**Satellite Holdings (20-30%):**
- Small-cap growth stocks
- Emerging markets
- Sector-specific investments

**Speculative Holdings (5-10%):**
- Individual stocks
- Alternative investments
- High-growth potential assets

**Rebalancing Strategy:**
- Review quarterly, rebalance annually
- Sell high-performing assets, buy underperforming ones
- Maintain target allocation percentages

**Risk Management:**
- No more than 5% in any single stock
- Diversify across sectors and geographies
- Consider your time horizon and risk tolerance

**Portfolio Tracking:**
- Monitor performance vs. benchmarks
- Track expenses and fees
- Regular review and adjustment

Would you like help analyzing your current portfolio or creating an investment plan?`;
    }

    // Default response
    return `**Financial Assistant:**

I'm here to help with your investment and financial questions! I can assist with:

**Stock Analysis:**
- Current prices and market data
- Company fundamentals and metrics
- Technical analysis and trends

**Investment Guidance:**
- Portfolio diversification strategies
- Risk assessment and management
- Investment planning and goals

**Market Insights:**
- Market trends and analysis
- Economic indicators and their impact
- Sector performance and opportunities

**Popular Topics:**
- "What's the price of AAPL?" - Get current stock information
- "How should I invest?" - General investment guidance
- "Market trends" - Current market analysis
- "Portfolio advice" - Diversification strategies

**Disclaimer:** This information is for educational purposes only and should not be considered as personalized financial advice. Always consult with a qualified financial advisor before making investment decisions.

What specific financial topic would you like to explore?`;
  } catch (error) {
    console.error('Error generating basic financial response:', error);
    return "I apologize, but I'm having trouble processing your request right now. Please try again later or contact support if the issue persists.";
  }
};

// Extract stock symbols from user message
const extractStockSymbols = (message) => {
  const symbols = [];
  const words = message.toUpperCase().split(/\s+/);
  
  // Common stock symbol patterns
  const stockPattern = /^[A-Z]{1,5}$/;
  
  for (const word of words) {
    if (stockPattern.test(word)) {
      symbols.push(word);
    }
  }
  
  return symbols;
};

// Analyze sentiment of financial news or messages
export const analyzeSentiment = (text) => {
  try {
    const result = sentiment.analyze(text);
    
    return {
      score: result.score,
      comparative: result.comparative,
      sentiment: result.score > 0 ? 'positive' : result.score < 0 ? 'negative' : 'neutral',
      positive: result.positive,
      negative: result.negative
    };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return {
      score: 0,
      comparative: 0,
      sentiment: 'neutral',
      positive: [],
      negative: []
    };
  }
};

// Generate stock prediction based on simple analysis
export const generateStockPrediction = async (symbol, days = 7) => {
  try {
    const historical = await getHistoricalData(symbol, '3mo', '1d');
    const details = await getStockDetails(symbol);
    
    if (historical.length === 0) {
      return {
        symbol,
        prediction: 'neutral',
        confidence: 0,
        targetPrice: details.price,
        reasoning: 'Insufficient historical data for prediction'
      };
    }

    // Simple moving average analysis
    const recentPrices = historical.slice(-30).map(h => h.close);
    const averagePrice = recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;
    const currentPrice = details.price;
    
    // Calculate trend
    const priceChange = ((currentPrice - averagePrice) / averagePrice) * 100;
    
    let prediction, confidence, targetPrice, reasoning;
    
    if (priceChange > 5) {
      prediction = 'bullish';
      confidence = Math.min(Math.abs(priceChange) * 2, 80);
      targetPrice = currentPrice * 1.05;
      reasoning = `Stock is trading ${priceChange.toFixed(2)}% above its 30-day average, indicating strong momentum.`;
    } else if (priceChange < -5) {
      prediction = 'bearish';
      confidence = Math.min(Math.abs(priceChange) * 2, 80);
      targetPrice = currentPrice * 0.95;
      reasoning = `Stock is trading ${Math.abs(priceChange).toFixed(2)}% below its 30-day average, indicating potential weakness.`;
    } else {
      prediction = 'neutral';
      confidence = 50;
      targetPrice = currentPrice;
      reasoning = 'Stock is trading near its 30-day average, suggesting neutral sentiment.';
    }
    
    return {
      symbol,
      prediction,
      confidence,
      targetPrice,
      reasoning,
      currentPrice,
      averagePrice,
      priceChange
    };
  } catch (error) {
    console.error(`Error generating prediction for ${symbol}:`, error);
    return {
      symbol,
      prediction: 'neutral',
      confidence: 0,
      targetPrice: 0,
      reasoning: 'Unable to generate prediction due to data limitations'
    };
  }
};