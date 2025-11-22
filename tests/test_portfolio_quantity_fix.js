/**
 * Test script to verify portfolio quantity bug fixes
 * 
 * This script tests that quantities are properly added (not concatenated)
 * when buying stocks that already exist in the portfolio.
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';
let authToken = '';
let userId = '';

// Test user credentials
const testUser = {
    email: 'test_portfolio@example.com',
    password: 'TestPass123!',
    name: 'Portfolio Test User'
};

async function login() {
    try {
        // Try to login first
        const loginRes = await axios.post(`${API_BASE}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        authToken = loginRes.data.token;
        userId = loginRes.data.user.id;
        console.log('✓ Logged in successfully');
        return true;
    } catch (error) {
        // If login fails, try to register
        try {
            const registerRes = await axios.post(`${API_BASE}/auth/register`, testUser);
            authToken = registerRes.data.token;
            userId = registerRes.data._id;
            console.log('✓ Registered new test user');
            return true;
        } catch (regError) {
            console.error('✗ Failed to login or register:', regError.response?.data || regError.message);
            return false;
        }
    }
}

async function cleanupPortfolio() {
    try {
        // Get current portfolio
        const portfolioRes = await axios.get(`${API_BASE}/portfolio?type=PERSONAL`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        // Remove all holdings
        for (const holding of portfolioRes.data.holdings) {
            await axios.post(`${API_BASE}/portfolio/remove-stock`, {
                symbol: holding.symbol,
                quantity: holding.quantity,
                price: holding.currentPrice,
                type: 'PERSONAL'
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
        }
        console.log('✓ Cleaned up existing portfolio');
    } catch (error) {
        if (error.response?.status === 404) {
            console.log('✓ No existing portfolio to clean up');
        } else {
            console.log('Note: Error cleaning up portfolio (may not exist yet)');
        }
    }
}

async function testAddNewStock() {
    console.log('\n--- Test 1: Add New Stock ---');
    try {
        await axios.post(`${API_BASE}/portfolio/add-stock`, {
            symbol: 'AAPL',
            quantity: 10,
            price: 150.00,
            type: 'PERSONAL'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const portfolio = await axios.get(`${API_BASE}/portfolio?type=PERSONAL`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const holding = portfolio.data.holdings.find(h => h.symbol === 'AAPL');

        if (holding && holding.quantity === 10) {
            console.log('✓ PASS: Added 10 shares of AAPL');
            console.log(`  Quantity: ${holding.quantity}`);
            return true;
        } else {
            console.log(`✗ FAIL: Expected 10 shares, got ${holding?.quantity}`);
            return false;
        }
    } catch (error) {
        console.log('✗ FAIL: Error adding stock:', error.response?.data || error.message);
        return false;
    }
}

async function testAddExistingStock() {
    console.log('\n--- Test 2: Add to Existing Stock (Critical Test) ---');
    try {
        await axios.post(`${API_BASE}/portfolio/add-stock`, {
            symbol: 'AAPL',
            quantity: 5,
            price: 155.00,
            type: 'PERSONAL'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const portfolio = await axios.get(`${API_BASE}/portfolio?type=PERSONAL`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const holding = portfolio.data.holdings.find(h => h.symbol === 'AAPL');

        console.log(`  Previous quantity: 10`);
        console.log(`  Added quantity: 5`);
        console.log(`  Current quantity: ${holding?.quantity}`);
        console.log(`  Expected: 15`);

        if (holding && holding.quantity === 15) {
            console.log('✓ PASS: Quantity correctly added (10 + 5 = 15)');
            console.log(`  Average price: $${holding.averagePrice.toFixed(2)}`);
            return true;
        } else {
            console.log(`✗ FAIL: Expected 15 shares, got ${holding?.quantity}`);
            if (holding?.quantity === '105' || holding?.quantity === '510') {
                console.log('  ERROR: String concatenation bug detected!');
            }
            return false;
        }
    } catch (error) {
        console.log('✗ FAIL: Error adding stock:', error.response?.data || error.message);
        return false;
    }
}

async function testPartialSell() {
    console.log('\n--- Test 3: Partial Sell ---');
    try {
        await axios.post(`${API_BASE}/portfolio/remove-stock`, {
            symbol: 'AAPL',
            quantity: 7,
            price: 160.00,
            type: 'PERSONAL'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const portfolio = await axios.get(`${API_BASE}/portfolio?type=PERSONAL`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const holding = portfolio.data.holdings.find(h => h.symbol === 'AAPL');

        console.log(`  Previous quantity: 15`);
        console.log(`  Sold quantity: 7`);
        console.log(`  Current quantity: ${holding?.quantity}`);
        console.log(`  Expected: 8`);

        if (holding && holding.quantity === 8) {
            console.log('✓ PASS: Correctly sold 7 shares (15 - 7 = 8)');
            return true;
        } else {
            console.log(`✗ FAIL: Expected 8 shares, got ${holding?.quantity}`);
            return false;
        }
    } catch (error) {
        console.log('✗ FAIL: Error selling stock:', error.response?.data || error.message);
        return false;
    }
}

async function testCompleteSell() {
    console.log('\n--- Test 4: Complete Sell ---');
    try {
        await axios.post(`${API_BASE}/portfolio/remove-stock`, {
            symbol: 'AAPL',
            quantity: 8,
            price: 165.00,
            type: 'PERSONAL'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const portfolio = await axios.get(`${API_BASE}/portfolio?type=PERSONAL`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const holding = portfolio.data.holdings.find(h => h.symbol === 'AAPL');

        if (!holding) {
            console.log('✓ PASS: AAPL removed from portfolio after selling all shares');
            return true;
        } else {
            console.log(`✗ FAIL: AAPL still in portfolio with ${holding.quantity} shares`);
            return false;
        }
    } catch (error) {
        console.log('✗ FAIL: Error selling stock:', error.response?.data || error.message);
        return false;
    }
}

async function testVirtualTrading() {
    console.log('\n--- Test 5: Virtual Trading ---');
    try {
        // Buy Tesla in virtual portfolio
        await axios.post(`${API_BASE}/portfolio/add-stock`, {
            symbol: 'TSLA',
            quantity: 10,
            type: 'VIRTUAL'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        // Buy more Tesla
        await axios.post(`${API_BASE}/portfolio/add-stock`, {
            symbol: 'TSLA',
            quantity: 5,
            type: 'VIRTUAL'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const portfolio = await axios.get(`${API_BASE}/portfolio?type=VIRTUAL`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const holding = portfolio.data.holdings.find(h => h.symbol === 'TSLA');

        console.log(`  First buy: 10 shares`);
        console.log(`  Second buy: 5 shares`);
        console.log(`  Current quantity: ${holding?.quantity}`);
        console.log(`  Expected: 15`);

        if (holding && holding.quantity === 15) {
            console.log('✓ PASS: Virtual trading quantity correctly added (10 + 5 = 15)');
            return true;
        } else {
            console.log(`✗ FAIL: Expected 15 shares, got ${holding?.quantity}`);
            return false;
        }
    } catch (error) {
        console.log('✗ FAIL: Error in virtual trading:', error.response?.data || error.message);
        return false;
    }
}

async function runTests() {
    console.log('='.repeat(60));
    console.log('PORTFOLIO QUANTITY BUG FIX VERIFICATION');
    console.log('='.repeat(60));

    // Login
    const loggedIn = await login();
    if (!loggedIn) {
        console.log('\n✗ Cannot proceed without authentication');
        process.exit(1);
    }

    // Cleanup
    await cleanupPortfolio();

    // Run tests
    const results = [];
    results.push(await testAddNewStock());
    results.push(await testAddExistingStock());
    results.push(await testPartialSell());
    results.push(await testCompleteSell());
    results.push(await testVirtualTrading());

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));

    const passed = results.filter(r => r).length;
    const total = results.length;

    console.log(`Tests Passed: ${passed}/${total}`);

    if (passed === total) {
        console.log('\n✓ ALL TESTS PASSED! The quantity bug has been fixed.');
        process.exit(0);
    } else {
        console.log(`\n✗ ${total - passed} test(s) failed. Please review the output above.`);
        process.exit(1);
    }
}

// Run tests
runTests().catch(error => {
    console.error('\n✗ Test execution failed:', error.message);
    process.exit(1);
});
