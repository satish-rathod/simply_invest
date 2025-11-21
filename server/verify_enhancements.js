import axios from 'axios';
import { strict as assert } from 'assert';

const API_URL = 'http://localhost:5001/api';
let token = '';

async function registerUser() {
    const email = `test_dash_${Date.now()}@example.com`;
    const password = 'password123';
    const name = `Dash Tester ${Date.now()}`;

    try {
        const response = await axios.post(`${API_URL}/auth/register`, { name, email, password });
        token = response.data.token;
        console.log('User registered.');
    } catch (error) {
        console.error('Registration failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

async function verifyDashboardSummary() {
    console.log('\n--- Verifying Dashboard Summary (Virtual) ---');
    try {
        const response = await axios.get(`${API_URL}/dashboard/summary`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const { portfolio, recentTransactions } = response.data;
        console.log('Portfolio Summary:', portfolio);
        console.log('Recent Transactions:', recentTransactions.length);

        // Since it's a new user, portfolio might be null or empty, but request should succeed
        assert.ok(response.status === 200, 'Dashboard summary request failed');
        console.log('Dashboard summary verified.');
    } catch (error) {
        console.error('Dashboard verification failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

async function verifyMarketSummary() {
    console.log('\n--- Verifying Market Summary ---');
    try {
        const response = await axios.get(`${API_URL}/finance/market-summary`);
        const data = response.data;

        console.log('Market Status:', data.marketStatus);
        console.log('Summary Text:', data.summary.substring(0, 50) + '...');

        assert.ok(data.summary, 'Summary text missing');
        assert.ok(Array.isArray(data.bullets), 'Bullets array missing');
        assert.ok(data.marketStatus, 'Market status missing');

        console.log('Market summary verified.');
    } catch (error) {
        console.error('Market summary verification failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

async function run() {
    await registerUser();
    await verifyDashboardSummary();
    await verifyMarketSummary();
    console.log('\nALL TESTS PASSED!');
}

run();
