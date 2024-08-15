// utils/openai.js
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateChatResponse = async (messages) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating chat response:', error);
    if (error.response) {
      console.error(error.response.status, error.response.data);
    }
    throw new Error('Failed to generate response. Please try again later.');
  }
};

export default openai;