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
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        console.log('Successfully fetched the webpage');

        const $ = cheerio.load(data);
        console.log('Loaded data into Cheerio');

        const stocks = [];

        $('div.col-lg-9 > h2').each((index, element) => {
            if (index < 5) { // Ensure we only get 5 stocks
                console.log(`Processing stock ${index + 1}`);
                
                const stockInfo = $(element);
                const stockName = stockInfo.text().trim().split(':')[0].trim();
                const reason = stockInfo.next('p').text().trim();

                console.log(`Stock Name: ${stockName}`);
                console.log(`Reason: ${reason}`);

                // Find the h4 tags for each stock recommendation
                const actionElement = stockInfo.nextAll('h4').eq(0);
                const buyPriceElement = stockInfo.nextAll('h4').eq(1);
                const stopLossElement = stockInfo.nextAll('h4').eq(2);
                const target1Element = stockInfo.nextAll('h4').eq(3);
                const target2Element = stockInfo.nextAll('h4').eq(4);

                const action = actionElement.text().split(':')[1]?.trim();
                const buySellPrice = parseNumber(buyPriceElement.text().split(':')[1]);
                const stopLoss = parseNumber(stopLossElement.text().split(':')[1]);
                const target1 = parseNumber(target1Element.text().split(':')[1]);
                const target2 = parseNumber(target2Element.text().split(':')[1]);

                console.log(`Action: ${action}`);
                console.log(`Buy/Sell Price: ${buySellPrice}`);
                console.log(`Stop Loss: ${stopLoss}`);
                console.log(`Target 1: ${target1}`);
                console.log(`Target 2: ${target2}`);

                if (stockName && reason && action && buySellPrice !== null && stopLoss !== null && target1 !== null && target2 !== null) {
                    stocks.push({
                        date: today,
                        stockName,
                        reason,
                        action,
                        tradePrice:buySellPrice,
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

        console.log(`Total stocks scraped: ${stocks.length}`);

        // Insert scraped data into the database
        if (stocks.length > 0) {
            await StockRecommendation.insertMany(stocks);
            console.log(`Data for ${today} scraped and saved to the database.`);
        } else {
            console.log(`No valid data found for ${today}.`);
        }
    } catch (error) {
        console.error('An error occurred during scraping:');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
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