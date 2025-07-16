// utils/scraper.js

import axios from 'axios';
import * as cheerio from 'cheerio';
import StockRecommendation from '../models/StockRecommendation.js';
import StockMarket from '../models/StockMarket.js';

// Helper function to parse numbers
const parseNumber = (value) => {
  if (value) {
    return parseFloat(value.replace(/[^0-9.-]/g, ''));
  }
  return null;
};

const today = new Date().toISOString().split('T')[0];
console.log(today);

// Scraping function for stock recommendations
export const scrapeStockRecommendations = async () => {
  try {
    // Check if data for today already exists
    const existingData = await StockRecommendation.findOne({ date: today });
    if (existingData) {
      console.log(`Stock recommendation data for ${today} already exists. Skipping scraping.`);
      return;
    }

    const url = 'https://www.5paisa.com/share-market-today/stocks-to-buy-or-sell-today';
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    console.log('Successfully fetched the stock recommendation webpage');

    const $ = cheerio.load(data);
    const stocks = [];

    $('div.col-lg-9 > h2').each((index, element) => {
      if (index <= 5) {
        const stockInfo = $(element);
        const stockName = stockInfo.text().trim().split(':')[0].trim();
        const reason = stockInfo.next('p').text().trim();

        const actionElement = stockInfo.nextAll('h4').eq(0);
        const tradePriceElement = stockInfo.nextAll('h4').eq(1);
        const stopLossElement = stockInfo.nextAll('h4').eq(2);
        const target1Element = stockInfo.nextAll('h4').eq(3);
        const target2Element = stockInfo.nextAll('h4').eq(4);

        const action = actionElement.text().split(':')[1]?.trim();
        const tradePrice = parseNumber(tradePriceElement.text().split(':')[1]);
        const stopLoss = parseNumber(stopLossElement.text().split(':')[1]);
        const target1 = parseNumber(target1Element.text().split(':')[1]);
        const target2 = parseNumber(target2Element.text().split(':')[1]);

        if (stockName && reason && action && tradePrice !== null && stopLoss !== null && target1 !== null && target2 !== null) {
          stocks.push({
            date: today,
            stockName,
            reason,
            action,
            tradePrice,
            stopLoss,
            target1,
            target2
          });
          console.log(`Added ${stockName} to stocks array`);
        } else {
          console.log(`Skipping entry due to missing fields: ${stockName}`);
        }
      }
    });

    console.log(`Total stock recommendations scraped: ${stocks.length}`);

    // Insert scraped data into the database
    if (stocks.length > 0) {
      await StockRecommendation.insertMany(stocks);
      console.log(`Stock recommendation data for ${today} scraped and saved to the database.`);
    } else {
      console.log(`No valid stock recommendation data found for ${today}.`);
    }
  } catch (error) {
    console.error('An error occurred during stock recommendation scraping:', error);
  }
};

// Scraping function for stock market data
export const scrapeStockMarket = async () => {
  try {

    const existingData = await StockMarket.findOne({ date: today });
    if (existingData) {
      console.log(`Stock Market data for ${today} already exists. Skipping scraping.`);
      return;
    }

    const url = 'https://www.5paisa.com/share-market-today/stocks-to-buy-or-sell-today'
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const stockMarketData = [];

    $('.sensex-company.sensex-performance table tbody tr').each((index, element) => {
      const indicesName = $(element).find('td:nth-child(1) a').text().trim();
      const price = parseFloat($(element).find('td:nth-child(2)').text().trim());
      const priceChangeText = $(element).find('td:nth-child(3)').text().trim();
      const priceChange = parseFloat(priceChangeText.split(' ')[0]);

      stockMarketData.push({
        indicesName,
        Price: price,
        priceChange,
      });
    });

    console.log('Successfully scraped stock market data');

    for (const data of stockMarketData) {

      const stockMarket = new StockMarket({
        indicesName: data.indicesName,
        Price: data.Price,
        priceChange: data.priceChange,
        date: today,
      });

      await stockMarket.save();
    }

    console.log('Stock market data scraping and saving completed.');
  } catch (error) {
    console.error('Error scraping stock market data:', error);
  }
};

// Combined scraping function
const scrapeData = async () => {
  await scrapeStockRecommendations();
  await scrapeStockMarket();
};

export default scrapeData;