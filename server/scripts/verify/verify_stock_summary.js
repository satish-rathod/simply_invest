import axios from 'axios';
import { strict as assert } from 'assert';

const API_URL = 'http://localhost:5001/api';

async function verifyStockSummary() {
    console.log('\n--- Verifying Stock Summary Endpoint ---');
    try {
        const symbol = 'AAPL';
        const response = await axios.get(`${API_URL}/finance/stock-summary`, {
            params: { symbol }
        });
        const data = response.data;

        assert.ok(data.metrics, 'Response should contain metrics');
        assert.ok(data.analysis, 'Response should contain analysis');

        // Verify Metrics
        assert.equal(data.metrics.name, 'Apple Inc.', 'Should return correct company name');
        assert.ok(data.metrics.price > 0, 'Price should be positive');
        assert.ok(data.metrics.marketCap > 0, 'Market Cap should be positive');

        // Verify Analysis
        assert.ok(data.analysis.sentiment, 'Analysis should have sentiment');
        assert.ok(data.analysis.outlook, 'Analysis should have outlook');
        assert.ok(data.analysis.estimatedPrice, 'Analysis should have estimatedPrice');
        assert.ok(Array.isArray(data.analysis.news), 'News should be an array');
        assert.ok(data.analysis.news.length > 0, 'News should not be empty');

        console.log(`Success: Fetched summary for ${symbol}`);
        console.log('Sentiment:', data.analysis.sentiment);
        console.log('Estimated Price:', data.analysis.estimatedPrice);
    } catch (error) {
        console.error('Failed to verify stock summary:', error.response?.data || error.message);
        process.exit(1);
    }
    console.log('Stock summary verification passed.');
}

verifyStockSummary();
