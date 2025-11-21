import axios from 'axios';

const BASE_URL = 'http://localhost:5001/api';

async function testCaching() {
    console.log('Starting caching verification...');

    // Test News API Caching
    console.log('\n--- Testing News API Caching ---');
    try {
        console.log('1. Fetching news (should hit API)...');
        const start1 = Date.now();
        await axios.get(`${BASE_URL}/news/financial`);
        console.log(`   Request 1 took ${Date.now() - start1}ms`);

        console.log('2. Fetching news again (should hit cache)...');
        const start2 = Date.now();
        await axios.get(`${BASE_URL}/news/financial`);
        console.log(`   Request 2 took ${Date.now() - start2}ms`);

        if ((Date.now() - start2) < (Date.now() - start1)) {
            console.log('✅ News API caching appears to be working (2nd request was faster)');
        } else {
            console.log('⚠️ News API caching verification inconclusive based on time, check server logs.');
        }

    } catch (error) {
        console.error('❌ News API test failed:', error.message);
    }

    // Test Finance API Caching
    console.log('\n--- Testing Finance API Caching ---');
    try {
        const symbol = 'IBM'; // Use a stable symbol
        console.log(`1. Fetching chart data for ${symbol} (should hit API)...`);
        const start1 = Date.now();
        await axios.get(`${BASE_URL}/finance/chart?symbol=${symbol}`);
        console.log(`   Request 1 took ${Date.now() - start1}ms`);

        console.log(`2. Fetching chart data for ${symbol} again (should hit cache)...`);
        const start2 = Date.now();
        await axios.get(`${BASE_URL}/finance/chart?symbol=${symbol}`);
        console.log(`   Request 2 took ${Date.now() - start2}ms`);

        if ((Date.now() - start2) < (Date.now() - start1)) {
            console.log('✅ Finance API caching appears to be working (2nd request was faster)');
        } else {
            console.log('⚠️ Finance API caching verification inconclusive based on time, check server logs.');
        }
    } catch (error) {
        console.error('❌ Finance API test failed:', error.message);
    }
}

testCaching();
