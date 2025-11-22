import axios from 'axios';
import { strict as assert } from 'assert';

const API_URL = 'http://localhost:5001/api';
let token = '';
let userId = '';

async function registerUser() {
    const email = `test_split_${Date.now()}@example.com`;
    const password = 'password123';
    const name = `Split Tester ${Date.now()}`;

    console.log(`Registering user: ${email}`);
    try {
        const response = await axios.post(`${API_URL}/auth/register`, { name, email, password });
        token = response.data.token;
        userId = response.data._id;
        console.log('User registered successfully.');
    } catch (error) {
        console.error('Registration failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

async function verifyPersonalPortfolio() {
    console.log('\n--- Verifying Personal Portfolio ---');
    try {
        // Add stock with manual price
        const symbol = 'AAPL';
        const quantity = 10;
        const price = 150.00; // Manual price

        console.log(`Adding ${quantity} ${symbol} at $${price} (Personal)...`);
        await axios.post(`${API_URL}/portfolio/add-stock`,
            { symbol, quantity, price, type: 'PERSONAL' },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        // Verify balance did NOT change
        const profile = await axios.get(`${API_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        assert.equal(profile.data.virtualBalance, 50000, 'Virtual balance should not change for personal trades');
        console.log('Personal trade successful. Virtual balance unchanged.');
    } catch (error) {
        console.error('Personal portfolio verification failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

async function verifyVirtualTrading() {
    console.log('\n--- Verifying Virtual Trading ---');
    try {
        // Buy stock at market price
        const symbol = 'MSFT';
        const quantity = 5;

        console.log(`Buying ${quantity} ${symbol} (Virtual)...`);
        const response = await axios.post(`${API_URL}/portfolio/add-stock`,
            { symbol, quantity, type: 'VIRTUAL' },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const newBalance = response.data.newBalance;
        console.log(`New Virtual Balance: $${newBalance}`);

        assert.ok(newBalance < 50000, 'Virtual balance should decrease after buy');
        console.log('Virtual trade successful. Balance deducted.');

        // Try invalid symbol
        console.log('Testing invalid symbol rejection...');
        try {
            await axios.post(`${API_URL}/portfolio/add-stock`,
                { symbol: 'INVALID123', quantity: 1, type: 'VIRTUAL' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.error('Failed: Invalid symbol was accepted!');
            process.exit(1);
        } catch (error) {
            if (error.response?.status === 400) {
                console.log('Success: Invalid symbol rejected.');
            } else {
                throw error;
            }
        }

    } catch (error) {
        console.error('Virtual trading verification failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

async function verifyTransactionSeparation() {
    console.log('\n--- Verifying Transaction Separation ---');
    try {
        // Get Personal Transactions
        const personalRes = await axios.get(`${API_URL}/portfolio/transactions?type=PERSONAL`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const personalTx = personalRes.data;
        console.log(`Personal Transactions: ${personalTx.length}`);
        assert.equal(personalTx.length, 1, 'Should have 1 personal transaction');
        assert.equal(personalTx[0].symbol, 'AAPL', 'Personal transaction should be AAPL');

        // Get Virtual Transactions
        const virtualRes = await axios.get(`${API_URL}/portfolio/transactions?type=VIRTUAL`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const virtualTx = virtualRes.data;
        console.log(`Virtual Transactions: ${virtualTx.length}`);
        assert.equal(virtualTx.length, 1, 'Should have 1 virtual transaction');
        assert.equal(virtualTx[0].symbol, 'MSFT', 'Virtual transaction should be MSFT');

        console.log('Transaction separation verified.');
    } catch (error) {
        console.error('Transaction separation verification failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

async function run() {
    await registerUser();
    await verifyPersonalPortfolio();
    await verifyVirtualTrading();
    await verifyTransactionSeparation();
    console.log('\nALL TESTS PASSED!');
}

run();
