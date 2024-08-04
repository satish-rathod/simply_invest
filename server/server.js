import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import scrapeData from './utils/scraper.js';
import cron from 'node-cron';

// Import your routes
import authRoutes from './routes/authRoutes.js';
import stockRoutes from './routes/stockRoutes.js';

dotenv.config();

const app = express();

// Middleware (Body parser, etc.)
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes); // Ensure this path is correct

// Run the scraper on server startup
(async () => {
    await scrapeData();
})();

// Schedule the scraper to run at a specific time every day (e.g., 9 AM)
cron.schedule('0 9 * * *', async () => {
    console.log('Running scheduled scraper at 9 AM');
    await scrapeData();
});

// Server Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
