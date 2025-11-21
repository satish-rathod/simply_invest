
import axios from 'axios';

const verifyApi = async () => {
    try {
        // 1. Login
        console.log('Attempting login...');
        const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'test@example.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Login successful, token received.');

        // 2. Check Dashboard API
        console.log('Checking GET /api/dashboard/summary...');
        const dashboardRes = await axios.get('http://localhost:5001/api/dashboard/summary', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Dashboard API Response Status:', dashboardRes.status);
        console.log('Dashboard Data:', JSON.stringify(dashboardRes.data, null, 2));

    } catch (error) {
        console.error('Verification Failed:');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data: ${JSON.stringify(error.response.data)}`);
        } else {
            console.error(error.message);
        }
    }
};

verifyApi();
