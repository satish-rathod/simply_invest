import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import scrapeData from './utils/scraper.js';
import cron from 'node-cron';
import cors from 'cors';

// Import your routes
import authRoutes from './routes/authRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/chat', chatRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Run the scraper on server startup
(async () => {
  try {
    await scrapeData();
    console.log('Initial scrape completed successfully');
  } catch (error) {
    console.error('Error during initial scrape:', error);
  }
})();

// Schedule the scraper to run at a specific time every day (e.g., 9 AM)
cron.schedule('0 9 * * *', async () => {
  try {
    console.log('Running scheduled scraper at 9 AM');
    await scrapeData();
    console.log('Scheduled scrape completed successfully');
  } catch (error) {
    console.error('Error during scheduled scrape:', error);
  }
});

// Server Port
const PORT = process.env.PORT || 5000;

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

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});