// utils/chatbot.js
import { generateChatResponse } from './openai.js';
import StockRecommendation from '../models/StockRecommendation.js';
import StockMarket from '../models/StockMarket.js';

const getStockData = async () => {
  const recommendations = await StockRecommendation.find().sort({ date: -1 }).limit(5);
  const marketData = await StockMarket.find().sort({ date: -1 }).limit(5);
  return { recommendations, marketData };
};

export const processChatMessage = async (userId, message) => {
  const { recommendations, marketData } = await getStockData();
  
  const systemMessage = {
    role: "system",
    content: `You are a helpful assistant that provides information about the stock market. 
    Here are the latest stock recommendations: ${JSON.stringify(recommendations)}. 
    And here is the latest market data: ${JSON.stringify(marketData)}.`
  };

  const userMessage = { role: "user", content: message };
  
  const chatCompletion = await generateChatResponse([systemMessage, userMessage]);
  
  return chatCompletion;
};