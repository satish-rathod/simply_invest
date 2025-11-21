import OpenAI from 'openai';
import Sentiment from 'sentiment';
import natural from 'natural';
import { getStockDetails, getHistoricalData } from './marketData.js';

// Initialize sentiment analyzer
const sentiment = new Sentiment();

// Lazy initialize OpenAI - only create instance when first needed
// This ensures dotenv has loaded environment variables
let openai = null;
let openaiInitialized = false;

const getOpenAI = () => {
  if (!openaiInitialized) {
    openaiInitialized = true;
    if (process.env.OPENAI_API_KEY &&
      (process.env.OPENAI_API_KEY.startsWith('sk-') || process.env.OPENAI_API_KEY.startsWith('sk-proj-'))) {
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      console.log('✅ OpenAI initialized successfully');
    } else {
      console.warn('⚠️  OpenAI API key not found or invalid - will use fallback responses');
    }
  }
  return openai;
};

// Enhanced chat response with financial context and OpenBB tools
export const generateEnhancedChatResponse = async (userMessage, conversationHistory = [], userId) => {
  try {
    // Get OpenAI instance (lazy initialization)
    const openaiClient = getOpenAI();

    // If we have OpenAI initialized, use the advanced AI service
    if (openaiClient) {
      try {
        console.log('Using OpenAI for response generation');
        const tools = [
          {
            type: "function",
            function: {
              name: "get_stock_price",
              description: "Get the current price of a stock",
              parameters: {
                type: "object",
                properties: {
                  symbol: {
                    type: "string",
                    description: "The stock symbol (e.g., AAPL, TSLA)",
                  },
                },
                required: ["symbol"],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "get_historical_data",
              description: "Get historical price data for a stock",
              parameters: {
                type: "object",
                properties: {
                  symbol: {
                    type: "string",
                    description: "The stock symbol",
                  },
                  period: {
                    type: "string",
                    description: "The period of data (e.g., 1y, 1mo)",
                  },
                },
                required: ["symbol"],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "get_stock_details",
              description: "Get detailed information about a stock (market cap, PE ratio, etc.)",
              parameters: {
                type: "object",
                properties: {
                  symbol: {
                    type: "string",
                    description: "The stock symbol",
                  },
                },
                required: ["symbol"],
              },
            },
          }
        ];

        const messages = [
          {
            role: "system",
            content: `You are an expert financial advisor and investment analyst. You provide personalized investment advice, market analysis, and financial insights. 
            You have access to real-time market data via tools. ALWAYS use these tools to get the latest data when answering questions about specific stocks.
            If the user asks about a stock price, use get_stock_price.
            If the user asks for details or fundamentals, use get_stock_details.
            If the user asks about trends or history, use get_historical_data.
            Always provide practical, actionable advice while emphasizing the importance of diversification and risk management.`
          },
          ...conversationHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          {
            role: "user",
            content: userMessage
          }
        ]

        // Timeout wrapper for OpenAI API calls
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('OpenAI API timeout after 25 seconds')), 25000);
        });

        const completionPromise = openaiClient.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: messages,
          tools: tools,
          tool_choice: "auto",
          max_tokens: 1000,
          temperature: 0.7
        });

        const completion = await Promise.race([completionPromise, timeoutPromise]);

        const responseMessage = completion.choices[0].message;

        // Handle tool calls
        if (responseMessage.tool_calls) {
          const toolCalls = responseMessage.tool_calls;
          messages.push(responseMessage); // Extend conversation with assistant's reply

          for (const toolCall of toolCalls) {
            const functionName = toolCall.function.name;
            const functionArgs = JSON.parse(toolCall.function.arguments);
            let functionResponse;

            try {
              if (functionName === 'get_stock_price') {
                const details = await getStockDetails(functionArgs.symbol);
                functionResponse = JSON.stringify({ price: details.price });
              } else if (functionName === 'get_stock_details') {
                const details = await getStockDetails(functionArgs.symbol);
                functionResponse = JSON.stringify(details);
              } else if (functionName === 'get_historical_data') {
                const data = await getHistoricalData(functionArgs.symbol, functionArgs.period || '1mo');
                // Limit data to save tokens
                const limitedData = data.slice(-10);
                functionResponse = JSON.stringify(limitedData);
              } else {
                functionResponse = "Function not found";
              }
            } catch (e) {
              functionResponse = JSON.stringify({ error: e.message });
            }

            messages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: functionName,
              content: functionResponse,
            });
          }

          // Second call to get the final response with timeout
          const secondTimeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('OpenAI API timeout after 25 seconds')), 25000);
          });

          const secondCompletionPromise = openaiClient.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: messages,
          });

          const secondResponse = await Promise.race([secondCompletionPromise, secondTimeoutPromise]);

          return secondResponse.choices[0].message.content;
        }

        return responseMessage.content;
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError);
        return await generateBasicFinancialResponse(userMessage, conversationHistory);
      }
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

    // Greetings
    if (lowerMessage.match(/^(hi|hello|hey|greetings)/)) {
      return "Hello! I'm your Simply Invest Financial Assistant. How can I help you with your investment journey today?";
    }

    // Capabilities / Help
    if (lowerMessage.includes('what can you do') || lowerMessage.includes('help') || lowerMessage.includes('capabilities')) {
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
    }

    // Check for stock symbols or company names directly
    const stockSymbols = extractStockSymbols(userMessage);
    if (stockSymbols.length > 0) {
      const symbol = stockSymbols[0];
      try {
        const details = await getStockDetails(symbol);

        // Only return if we got valid data
        if (details && details.price) {
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
      } catch (e) {
        console.log(`Failed to fetch details for ${symbol} in fallback logic`);
      }
    }

    // Default response for unrecognized input
    return "I'm not sure I understand. You can ask me about stock prices (e.g., 'Apple'), market trends, or investment advice. Type 'help' to see what I can do.";
  } catch (error) {
    console.error('Error generating basic financial response:', error);
    return "I apologize, but I'm having trouble processing your request right now. Please try again later or contact support if the issue persists.";
  }
};

// Extract stock symbols from user message
const extractStockSymbols = (message) => {
  const symbols = [];
  const words = message.toUpperCase().split(/[\s,.?!]+/); // Split by whitespace and punctuation

  // Map common company names to tickers
  const companyMap = {
    'APPLE': 'AAPL',
    'MICROSOFT': 'MSFT',
    'GOOGLE': 'GOOGL',
    'ALPHABET': 'GOOGL',
    'AMAZON': 'AMZN',
    'TESLA': 'TSLA',
    'META': 'META',
    'FACEBOOK': 'META',
    'NETFLIX': 'NFLX',
    'NVIDIA': 'NVDA',
    'AMD': 'AMD',
    'INTEL': 'INTC',
    'DISNEY': 'DIS',
    'COKE': 'KO',
    'COCA-COLA': 'KO',
    'PEPSI': 'PEP',
    'UBER': 'UBER',
    'LYFT': 'LYFT',
    'AIRBNB': 'ABNB',
    'PALANTIR': 'PLTR',
    'GAMESTOP': 'GME',
    'AMC': 'AMC'
  };

  // Common stock symbol patterns
  const stockPattern = /^[A-Z]{1,5}$/;

  // Words to ignore (common English words that look like tickers)
  const ignoreList = new Set([
    'WHAT', 'IS', 'THE', 'PRICE', 'OF', 'STOCK', 'MARKET', 'TODAY', 'NOW',
    'AND', 'OR', 'BUT', 'FOR', 'WITH', 'IN', 'ON', 'AT', 'TO', 'FROM', 'BY',
    'A', 'AN', 'IT', 'THIS', 'THAT', 'THESE', 'THOSE', 'AM', 'ARE', 'WAS', 'WERE',
    'BE', 'BEEN', 'BEING', 'HAVE', 'HAS', 'HAD', 'DO', 'DOES', 'DID',
    'CAN', 'COULD', 'WILL', 'WOULD', 'SHALL', 'SHOULD', 'MAY', 'MIGHT', 'MUST',
    'HI', 'HELLO', 'HEY', 'PLEASE', 'THANKS', 'THANK', 'YOU',
    'BUY', 'SELL', 'HOLD', 'TRADE', 'INVEST', 'LONG', 'SHORT',
    'TELL', 'ME', 'ABOUT', 'KNOW', 'HOW', 'WHY', 'WHEN', 'WHERE', 'WHO',
    'YES', 'NO', 'NOT', 'GOOD', 'BAD', 'BEST', 'WORST', 'TOP', 'BOTTOM',
    'HIGH', 'LOW', 'OPEN', 'CLOSE', 'VOLUME', 'CAP', 'RATIO', 'DIVIDEND', 'YIELD',
    'CHART', 'GRAPH', 'HISTORY', 'HISTORICAL', 'TREND', 'ANALYSIS', 'PREDICTION',
    'QUOTE', 'DATA', 'INFO', 'INFORMATION', 'DETAILS', 'NEWS', 'REPORT',
    'REAL', 'TIME', 'LIVE', 'STREAM', 'FEED', 'API', 'KEY', 'TOKEN', 'AUTH',
    'USER', 'PASS', 'PASSWORD', 'LOGIN', 'LOGOUT', 'SIGNUP', 'REGISTER',
    'ACCOUNT', 'PROFILE', 'SETTINGS', 'CONFIG', 'PREFERENCES', 'OPTIONS',
    'HELP', 'SUPPORT', 'CONTACT', 'FEEDBACK', 'BUG', 'ISSUE', 'ERROR',
    'AI', 'BOT', 'CHAT', 'MESSAGE', 'TEXT', 'VOICE', 'AUDIO', 'VIDEO',
    'IMAGE', 'FILE', 'UPLOAD', 'DOWNLOAD', 'SAVE', 'LOAD', 'DELETE', 'REMOVE',
    'CREATE', 'UPDATE', 'EDIT', 'CHANGE', 'MODIFY', 'ADD', 'INSERT', 'APPEND',
    'LIST', 'SHOW', 'VIEW', 'DISPLAY', 'PRINT', 'ECHO', 'WRITE', 'READ',
    'GET', 'SET', 'PUT', 'POST', 'PATCH', 'HEAD', 'OPTION', 'CONNECT', 'TRACE'
  ]);

  for (const word of words) {
    // Check if word is a known company name
    if (companyMap[word]) {
      symbols.push(companyMap[word]);
      continue;
    }

    // Check if word looks like a ticker and is not ignored
    if (stockPattern.test(word) && !ignoreList.has(word)) {
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
        targetPrice: details.price || 0,
        reasoning: 'Insufficient historical data for prediction',
        currentPrice: details.price || 0
      };
    }

    // Simple moving average analysis
    const recentPrices = historical.slice(-30).map(h => h.close);
    const averagePrice = recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;
    const currentPrice = details.price || 0;

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
      reasoning: 'Unable to generate prediction due to data limitations',
      currentPrice: 0
    };
  }
};