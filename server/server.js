import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import scrapeData from './utils/scraper.js';
import cron from 'node-cron';

// Import your routes
import authRoutes from './routes/authRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/chat', chatRoutes);

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

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Handle server errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  switch (error.code) {
    case 'EACCES':
      console.error(`Port ${PORT} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`Port ${PORT} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});