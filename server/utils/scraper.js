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

    // New selector logic based on updated website structure
    // Look for the section with detailed recommendations
    // Structure seems to be h2 or similar with "1. STOCK : REASON"

    // Try to find the container with the list
    const contentDiv = $('div.col-lg-9'); // Assuming the main content is still in col-lg-9

    // Iterate over h2 or h3 elements that might contain the stock name
    // Based on observation: "1. BHEL : VOLUME SPURT"

    // We'll look for elements that contain the pattern "Number. StockName :"
    contentDiv.find('h2, h3, h4').each((index, element) => {
      const headerText = $(element).text().trim();
      // Regex to match "1. STOCKNAME : REASON" or similar
      const match = headerText.match(/^\d+\.\s*([^:]+)\s*[:|-]\s*(.+)/);

      if (match) {
        const stockName = match[1].trim();
        const reason = match[2].trim();

        // Now look for details in the following elements
        // The structure described: link, then text with "BUY Price", "Stop Loss", etc.
        // We'll traverse next siblings until we find the prices

        let action = 'Buy'; // Default to Buy, but check text
        let tradePrice = null;
        let stopLoss = null;
        let target1 = null;
        let target2 = null;

        // Check next few siblings for price data
        let nextElem = $(element).next();
        for (let i = 0; i < 10; i++) { // Limit search depth
          if (!nextElem.length) break;

          const text = nextElem.text().trim();

          if (text.toLowerCase().includes('sell')) action = 'Sell';
          if (text.toLowerCase().includes('buy')) action = 'Buy';

          // Parse prices using regex from text like "BUY Price ₹262"
          if (!tradePrice && text.match(/price/i)) tradePrice = parseNumber(text);
          if (!stopLoss && text.match(/stop\s*loss/i)) stopLoss = parseNumber(text);
          if (!target1 && text.match(/target\s*1/i)) target1 = parseNumber(text);
          if (!target2 && text.match(/target\s*2/i)) target2 = parseNumber(text);

          // Also check for the table structure if details are in a table following the header
          if (nextElem.is('table')) {
            // Try to extract from table if present
            const tds = nextElem.find('td');
            tds.each((j, td) => {
              const tdText = $(td).text().trim();
              if (tdText.match(/price/i)) tradePrice = parseNumber($(td).next().text());
              if (tdText.match(/stop\s*loss/i)) stopLoss = parseNumber($(td).next().text());
              if (tdText.match(/target\s*1/i)) target1 = parseNumber($(td).next().text());
              if (tdText.match(/target\s*2/i)) target2 = parseNumber($(td).next().text());
            });
          }

          nextElem = nextElem.next();
        }

        // Fallback: if prices not found in siblings, they might be in the header itself or a specific format
        // The browser agent saw: "BUY Price ₹262", "Stop Loss ₹254" as text.

        if (stockName && reason && tradePrice !== null) {
          // Ensure targets are set, default to tradePrice * 1.05 if missing (fallback)
          if (!target1) target1 = tradePrice * 1.05;
          if (!target2) target2 = tradePrice * 1.10;
          if (!stopLoss) stopLoss = tradePrice * 0.95;

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