import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import scrapeData from './utils/scraper.js';
import cron from 'node-cron';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { checkAlerts } from './controllers/alertController.js';
import { getStockPrice } from './utils/marketData.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import financeRoutes from './routes/financeRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import watchListRoutes from './routes/watchListRoutes.js';
import realTimeRoutes from './routes/realTimeRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import socialRoutes from './routes/socialRoutes.js';
import educationRoutes from './routes/educationRoutes.js';
import tenantRoutes from './routes/tenantRoutes.js';
import whiteLabelRoutes from './routes/whiteLabelRoutes.js';
import tenantUserRoutes from './routes/tenantUserRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request timeout middleware - prevent hanging requests
app.use((req, res, next) => {
  // Set timeout to 30 seconds for all requests
  req.setTimeout(30000, () => {
    console.error(`Request timeout: ${req.method} ${req.url}`);
    res.status(408).json({ error: 'Request timeout' });
  });

  res.setTimeout(30000, () => {
    console.error(`Response timeout: ${req.method} ${req.url}`);
  });

  next();
});

// Create HTTP server and Socket.IO instance
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:3000',
    credentials: true
  }
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join room for authenticated users
  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined room`);
  });

  // Subscribe to stock updates
  socket.on('subscribe-stock', (symbol) => {
    socket.join(`stock-${symbol}`);
    console.log(`Client subscribed to ${symbol}`);
  });

  // Unsubscribe from stock updates
  socket.on('unsubscribe-stock', (symbol) => {
    socket.leave(`stock-${symbol}`);
    console.log(`Client unsubscribed from ${symbol}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// MongoDB Connection with connection pool configuration
mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 10, // Limit maximum concurrent connections
  minPoolSize: 2,  // Maintain minimum connections for performance
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  family: 4 // Use IPv4, skip trying IPv6
})
  .then(() => {
    console.log('MongoDB Connected');
    console.log('Connection pool configured: maxPoolSize=10, minPoolSize=2');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Monitor MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/watchlists', watchListRoutes);
app.use('/api/realtime', realTimeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/white-label', whiteLabelRoutes);
app.use('/api/tenant-users', tenantUserRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use((req, res) => {
  console.log(`404 - Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Real-time stock price updates
const broadcastStockUpdates = async () => {
  try {
    const popularStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX'];

    for (const symbol of popularStocks) {
      try {
        const price = await getStockPrice(symbol);
        io.to(`stock-${symbol}`).emit('price-update', {
          symbol,
          price,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error(`Error broadcasting price for ${symbol}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in broadcastStockUpdates:', error);
  }
};

// Run the scraper on server startup
(async () => {
  try {
    await scrapeData();
    console.log('Initial scrape completed successfully');
  } catch (error) {
    console.error('Error during initial scrape:', error);
  }
})();

// Scheduled tasks
console.log('Setting up scheduled tasks...');

// Daily scraper at 9 AM
cron.schedule('0 9 * * *', async () => {
  try {
    console.log('Running scheduled scraper at 9 AM');
    await scrapeData();
    console.log('Scheduled scrape completed successfully');
  } catch (error) {
    console.error('Error during scheduled scrape:', error);
  }
});

// Check alerts every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    console.log('Checking alerts...');
    await checkAlerts();
  } catch (error) {
    console.error('Error checking alerts:', error);
  }
});

// Broadcast stock price updates every 30 seconds (only if clients are connected)
cron.schedule('*/30 * * * * *', async () => {
  if (io.engine.clientsCount > 0) {
    await broadcastStockUpdates();
  }
});

// Server Port
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 WebSocket server ready for real-time updates`);
  console.log(`⏰ Scheduled tasks active`);
});

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
const gracefulShutdown = () => {
  console.log('Received shutdown signal, closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;