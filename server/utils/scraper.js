import axios from 'axios';
import cheerio from 'cheerio';
import StockRecommendation from '../models/StockRecommendation.js';

const scrapeData = async () => {
    const today = new Date().toISOString().split('T')[0];

    try {
        // Check if data for today already exists
        const existingData = await StockRecommendation.findOne({ date: today });
        if (existingData) {
            console.log(`Data for ${today} already exists. Skipping scraping.`);
            return;
        }

        const url = 'https://www.5paisa.com/share-market-today/stocks-to-buy-or-sell-today';
        const { data } = await axios.get(url);

        // Load HTML into cheerio
        const $ = cheerio.load(data);

        // Array to hold scraped data
        const stocks = [];

        // Use the right container to find stock recommendations
        $('div.col-lg-9').find('h2').each((index, element) => {
            if (index < 5) { // Ensure we only get 5 stocks
                const stockName = $(element).text().trim().split(':')[0].trim(); // Extract stock name
                const reason = $(element).next('p').text().trim(); // Extract reason

                // Find the following h4 tags for each stock recommendation
                const action = $(element).nextAll('h4').eq(0).text().split(': ')[1].trim(); // Extract action (Buy/Sell)
                const buySellPrice = parseNumber($(element).nextAll('h4').eq(1).text().split(': ')[1].trim()); // Extract buy/sell price
                const stopLoss = parseNumber($(element).nextAll('h4').eq(2).text().split(': ')[1].trim()); // Extract stop loss
                const target1 = parseNumber($(element).nextAll('h4').eq(3).text().split(': ')[1].trim()); // Extract target 1
                const target2 = parseNumber($(element).nextAll('h4').eq(4).text().split(': ')[1].trim()); // Extract target 2

                // Ensure all required fields are present
                if (stockName && reason && action && buySellPrice !== null && stopLoss !== null && target1 !== null && target2 !== null) {
                    stocks.push({
                        date: today,
                        stockName,
                        reason,
                        action,
                        buySellPrice,
                        stopLoss,
                        target1,
                        target2
                    });
                } else {
                    console.log(`Skipping entry due to missing fields: ${stockName}`);
                }
            }
        });

        // Insert scraped data into the database
        if (stocks.length > 0) {
            await StockRecommendation.insertMany(stocks);
            console.log(`Data for ${today} scraped and saved to the database.`);
        } else {
            console.log(`No valid data found for ${today}.`);
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
};

// Helper function to clean currency values and convert to numbers
const parseNumber = (value) => {
    if (value) {
        return parseFloat(value.replace(/[^0-9.-]/g, ''));
    }
    return null;
};

export default scrapeData;
