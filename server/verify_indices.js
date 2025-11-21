import axios from 'axios';
import { strict as assert } from 'assert';

const API_URL = 'http://localhost:5001/api';

async function verifyMarketIndices() {
    console.log('\n--- Verifying Market Summary Indices ---');
    try {
        const response = await axios.get(`${API_URL}/finance/market-summary`);
        const data = response.data;

        assert.ok(data.indices, 'Response should contain indices');
        assert.ok(Array.isArray(data.indices), 'Indices should be an array');
        assert.ok(data.indices.length > 0, 'Indices array should not be empty');

        const firstIndex = data.indices[0];
        assert.ok(firstIndex.symbol, 'Index should have symbol');
        assert.ok(firstIndex.price !== undefined, 'Index should have price');
        assert.ok(firstIndex.changePercent !== undefined, 'Index should have changePercent');

        console.log(`Success: Fetched ${data.indices.length} indices`);
        console.log('Sample Index:', firstIndex);
    } catch (error) {
        console.error('Failed to verify market indices:', error.response?.data || error.message);
        process.exit(1);
    }
    console.log('Market indices verification passed.');
}

verifyMarketIndices();
