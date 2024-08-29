import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set in the environment variables');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateChatResponse = async (messages) => {
  try {
    console.log('Sending request to OpenAI API');
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });
    console.log('Received response from OpenAI API');
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating chat response:', error);
    if (error.response) {
      console.error('OpenAI API response status:', error.response.status);
      console.error('OpenAI API response data:', error.response.data);
    } else {
      console.error('Error message:', error.message);
    }
    throw new Error('Failed to generate response from OpenAI API: ' + (error.message || 'Unknown error'));
  }
};

export default openai;