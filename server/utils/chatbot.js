import { generateChatResponse } from './openai.js';
import StockRecommendation from '../models/StockRecommendation.js';
import StockMarket from '../models/StockMarket.js';

const getStockData = async () => {
  try {
    console.log('Fetching stock data');
    const [recommendations, marketData] = await Promise.all([
      StockRecommendation.find().sort({ date: -1 }).limit(5),
      StockMarket.find().sort({ date: -1 }).limit(5)
    ]);
    console.log('Stock data fetched successfully');
    return { recommendations, marketData };
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw new Error('Failed to fetch stock data: ' + error.message);
  }
};

const formatStockData = (data) => {
  return data.map(item => `${item.indicesName}: Price ${item.Price}, Change ${item.priceChange}`).join('\n');
};

const formatRecommendations = (data) => {
  return data.map(item => 
    `${item.stockName}: Action ${item.action}, Trade Price ${item.tradePrice}, Target 1 ${item.target1}, Target 2 ${item.target2}, Stop Loss ${item.stopLoss}`
  ).join('\n');
};

export const processChatMessage = async (userId, message, conversationHistory = []) => {
  try {
    console.log(`Processing chat message for user ${userId}`);
    const { recommendations, marketData } = await getStockData();
    
    const systemMessage = {
      role: "system",
      content: `You are an expert AI financial advisor specializing in stock markets. Provide insights on market trends, trading strategies, stock valuation, and general financial advice.

      Current Market Data:
      ${formatStockData(marketData)}
      
      Latest Stock Recommendations:
      ${formatRecommendations(recommendations)}

      Guidelines for your responses:
      1. Answer all questions related to the stock market and finance in a conversational tone.
      2. When mentioning specific stocks, if you know the full name of the company, include both the stock symbol and its common name, e.g., "AAPL (Apple Inc.)". If you're not certain about the full name, use only the stock symbol.
      3. Structure your responses in a clear, organized manner using Markdown formatting:
         - Use simple numbering (1., 2., 3., etc.) for lists.
         - Separate different points or sections with blank lines.
         - Use plain text for emphasis instead of bold or italics.
         - Avoid using hashtags (#) for headers.
      4. Start your response with a brief introduction or summary of the main point.
      5. For longer responses, end with a concise conclusion or summary.
      6. Explain complex financial concepts in simple terms, especially for beginners.
      7. Provide balanced views on market trends and potential investments, always emphasizing the risks involved in stock trading.
      8. For predictions or forward-looking statements, clearly state that these are speculative and encourage thorough research.
      9. Tailor your language to the user's apparent level of expertise, but always maintain a professional and friendly tone.
      10. When relevant, reference the provided market data and recommendations, but also draw from your broader knowledge for comprehensive answers.

      Remember to clarify that you're an AI and that for personalized financial advice, users should consult with certified financial advisors.`
    };

    const messages = [
      systemMessage,
      ...conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];
    
    console.log('Generating chat response');
    const chatCompletion = await generateChatResponse(messages);
    
    console.log('Chat response generated successfully');
    return chatCompletion;
  } catch (error) {
    console.error('Error processing chat message:', error);
    throw new Error('Failed to process chat message: ' + error.message);
  }
};