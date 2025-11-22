import axios from 'axios';
import { strict as assert } from 'assert';

const API_URL = 'http://localhost:5001/api';

async function verifyTimeRanges() {
    console.log('\n--- Verifying Time Ranges ---');
    const symbol = 'AAPL';

    const ranges = [
        { label: '1D', period: '1d', interval: '5m' },
        { label: '1W', period: '5d', interval: '15m' },
        { label: '1M', period: '1mo', interval: '1d' }
    ];

    for (const range of ranges) {
        console.log(`Testing range ${range.label} (${range.period}, ${range.interval})...`);
        try {
            const response = await axios.get(`${API_URL}/finance/chart`, {
                params: { symbol, period: range.period, interval: range.interval }
            });
            const data = response.data;

            assert.ok(Array.isArray(data), 'Response should be an array');
            assert.ok(data.length > 0, 'Should return data');

            // Basic check: 1D should have more points than 1M if interval is small, 
            // but here we just check we got data back.
            // For 1D with 5m interval, we expect many points.
            // For 1M with 1d interval, we expect ~20-22 points.

            console.log(`Success: Fetched ${data.length} data points for ${range.label}`);
        } catch (error) {
            console.error(`Failed to fetch data for ${range.label}:`, error.response?.data || error.message);
            process.exit(1);
        }
    }
    console.log('Time range verification passed.');
}

verifyTimeRanges();
