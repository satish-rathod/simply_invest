import axios from 'axios';
import { strict as assert } from 'assert';

const API_URL = 'http://localhost:5001/api';

async function verifyStockSearch() {
    console.log('\n--- Verifying Stock Search ---');
    const symbols = ['AAPL', 'AMZN', 'NVDA'];

    for (const symbol of symbols) {
        console.log(`Testing search for ${symbol}...`);
        try {
            const response = await axios.get(`${API_URL}/finance/chart?symbol=${symbol}`);
            const data = response.data;

            assert.ok(Array.isArray(data), 'Response should be an array');
            assert.ok(data.length > 0, 'Should return historical data');
            assert.ok(data[0].date, 'Data item should have date');
            assert.ok(data[0].close, 'Data item should have close price');

            console.log(`Success: Fetched ${data.length} data points for ${symbol}`);
        } catch (error) {
            console.error(`Failed to fetch data for ${symbol}:`, error.response?.data || error.message);
            process.exit(1);
        }
    }
    console.log('Stock search verification passed.');
}

verifyStockSearch();
