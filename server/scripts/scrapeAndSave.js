// // backend/utils/scraper.js
// import axios from 'axios';
// import cheerio from 'cheerio';
// import StockRecommendation from '../models/StockRecommendation.js';

// const SCRAPING_URL = 'https://www.5paisa.com/share-market-today/stocks-to-buy-or-sell-today';

// const scrapeData = async () => {
//     try {
//         // Get today's date in a consistent format (e.g., YYYY-MM-DD)
//         const today = new Date().toISOString().split('T')[0];

//         // Check if there are already recommendations for today in the database
//         const existingData = await StockRecommendation.findOne({
//             createdAt: {
//                 $gte: new Date(today + 'T00:00:00Z'),
//                 $lt: new Date(today + 'T23:59:59Z')
//             }
//         });

//         if (existingData) {
//             console.log('Today\'s data already exists in the database. Skipping scrape.');
//             return; // Exit if data already exists for today
//         }

//         const { data } = await axios.get(SCRAPING_URL);
//         const $ = cheerio.load(data);

//         const stockRecommendations = [];

//         // Iterate over each recommendation block
//         $('div.col-lg-9').each((index, element) => {
//             // Only process the first 5 recommendations
//             if (index >= 5) return false;

//             const stockName = $(element).find('h2 strong').text().split(':')[0].trim();
//             const tradePrice = parseFloat($(element).find('h4:contains("Buy:")').text().replace('Buy: ₹', '').trim()) ||
//                                parseFloat($(element).find('h4:contains("Sell:")').text().replace('Sell: ₹', '').trim());
//             const stopLoss = parseFloat($(element).find('h4:contains("Stop Loss:")').text().replace('Stop Loss: ₹', '').trim());
//             const target1 = parseFloat($(element).find('h4:contains("Target 1:")').text().replace('Target 1: ₹', '').trim());
//             const target2 = parseFloat($(element).find('h4:contains("Target 2:")').text().replace('Target 2: ₹', '').trim());
//             const reason = $(element).find('p').first().text().trim();

//             stockRecommendations.push({
//                 stockName,
//                 tradePrice,
//                 stopLoss,
//                 target1,
//                 target2,
//                 reason,
//             });
//         });

//         // Save stock recommendations to database
//         await StockRecommendation.insertMany(stockRecommendations);
//         console.log('Stock Recommendations Saved');
//     } catch (error) {
//         console.error('Error scraping data:', error);
//     }
// };

// export default scrapeData;
