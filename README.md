# Simply Invest - AI-Powered Investment Platform

## 🚀 Project Overview

**Simply Invest** is a completely free analytical platform designed for smart investors who want to make informed decisions with AI-powered insights. Built with the MERN stack (MongoDB, Express.js, React, Node.js), Simply Invest combines portfolio management, real-time market analysis, social trading, and educational resources into one comprehensive platform.

### What Makes Simply Invest Special?

- **100% Free**: No subscriptions, no hidden fees - all features are completely free
- **AI-Powered Insights**: Get personalized investment advice powered by advanced AI and machine learning
- **Real-Time Data**: Access live stock prices, market updates, and comprehensive financial data
- **Social Trading**: Follow top traders, share insights, and learn from the investment community
- **Virtual Trading**: Practice trading strategies risk-free before investing real money
- **Educational Resources**: Learn investing fundamentals with structured courses and market insights

## ✨ Key Features

### 📊 Portfolio Management
- **Real-Time Tracking**: Monitor your personal and virtual portfolios with live P&L analysis
- **Performance Metrics**: Comprehensive portfolio performance tracking and analytics
- **Holdings Overview**: Detailed view of all your investments and their performance
- **Transaction History**: Complete record of all your trades and activities
- **Multi-Portfolio Support**: Manage both real and virtual portfolios simultaneously

### 🤖 AI Financial Advisor
- **Personalized Advice**: Get AI-powered investment recommendations tailored to your goals
- **Market Analysis**: AI-driven market insights and trend predictions
- **Stock Research**: Ask questions about any stock and get detailed AI analysis
- **Investment Strategies**: Learn and implement proven investment strategies
- **Risk Assessment**: AI-powered risk evaluation for your portfolio

### 📈 Real-Time Market Data
- **Live Stock Prices**: Access real-time stock prices and market updates
- **Market Overview**: Comprehensive view of market indices and trends
- **Daily Market Pulse**: AI-generated summaries of market movements
- **Stock Details**: In-depth information about any stock including financials and news
- **Interactive Charts**: Advanced charting with technical indicators

### 🎯 Virtual Trading Platform
- **Risk-Free Practice**: Test trading strategies without risking real money
- **Realistic Simulation**: Trade with virtual cash using real market data
- **Performance Tracking**: Monitor your virtual portfolio performance
- **Learn by Doing**: Practice before investing real capital

### 👥 Social Trading & Community
- **Follow Top Traders**: Learn from successful investors in the community
- **Social Feed**: Share insights, strategies, and market views
- **Leaderboards**: Track top performers and trending investors
- **Engagement**: Upvote, comment, and interact with community posts
- **User Profiles**: Build your investor profile and following

### 📚 Educational Resources
- **Structured Courses**: Learn investing fundamentals step-by-step
- **Market Insights**: Daily market analysis and educational content
- **Progress Tracking**: Track your learning journey and achievements
- **Investment Guides**: Comprehensive guides on various investment strategies
- **Financial Literacy**: Build your knowledge from beginner to advanced

### 🔔 Price Alerts & Notifications
- **Custom Alerts**: Set price alerts for any stock
- **Real-Time Notifications**: Get instant alerts when price targets are hit
- **Watchlist Monitoring**: Track your favorite stocks automatically
- **Market Updates**: Stay informed about important market movements

### 📊 Advanced Analytics
- **Technical Analysis**: Advanced charts with multiple indicators
- **Performance Reports**: Detailed analytics on your portfolio performance
- **Market Trends**: Identify and analyze market trends
- **AI Predictions**: Machine learning-powered price predictions
- **Risk Metrics**: Comprehensive risk assessment tools

## 🏗️ Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT Authentication** for secure sessions
- **WebSocket** for real-time communication
- **OpenAI API** for AI-powered features
- **Cron Jobs** for scheduled tasks
- **Rate Limiting** and security middleware

### Frontend
- **React.js** with modern hooks and context
- **Tailwind CSS** for responsive design
- **Framer Motion** for animations
- **Recharts** for data visualization
- **React Router** for navigation
- **PWA** capabilities with service workers

### Database Models
- **User Management**: User, UserActivity, UserProgress
- **Portfolio Data**: Portfolio, Trade, Alert, WatchList
- **Market Data**: MarketData, StockInfo, PriceHistory
- **Social Features**: Post, Comment, Following, Leaderboard
- **Educational**: Course, Module, MarketInsight
- **AI Chat**: ChatSession, ChatMessage

## 📁 Project Structure

```
simply-invest/
├── server/                     # Backend (Node.js/Express)
│   ├── controllers/           # API controllers
│   │   ├── authController.js
│   │   ├── portfolioController.js
│   │   ├── chatController.js
│   │   ├── socialController.js
│   │   ├── financeController.js
│   │   └── educationController.js
│   ├── models/               # Database models
│   │   ├── User.js
│   │   ├── Portfolio.js
│   │   ├── Trade.js
│   │   ├── Post.js
│   │   ├── ChatSession.js
│   │   └── Course.js
│   ├── routes/               # API routes
│   │   ├── authRoutes.js
│   │   ├── portfolioRoutes.js
│   │   ├── socialRoutes.js
│   │   └── financeRoutes.js
│   ├── middleware/           # Custom middleware
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   ├── utils/                # Utility functions
│   │   ├── aiService.js
│   │   ├── marketData.js
│   │   └── scraper.js
│   ├── scripts/              # Utility scripts
│   │   └── seedData.js
│   └── server.js            # Main server file
├── client/                   # Frontend (React)
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── LandingPage.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Portfolio.js
│   │   │   ├── Analytics.js
│   │   │   ├── SocialFeed.js
│   │   │   ├── ChatInterface.js
│   │   │   └── Education.js
│   │   ├── utils/          # Utility functions
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   ├── public/
│   │   └── manifest.json   # PWA manifest
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd simply-invest
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   
   Create `.env` file in the server directory:
   ```env
   # Database
   MONGO_URI=mongodb://localhost:27017/simply-invest
   
   # Authentication
   JWT_SECRET=your_jwt_secret_here
   
   # External APIs
   OPENAI_API_KEY=your_openai_key_here          # Required for AI features
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key # Optional - for market data
   NEWS_API_KEY=your_news_api_key               # Optional - for news feeds
   
   # Server Configuration
   PORT=5001
   NODE_ENV=development
   ```
   
   Create `.env` file in the client directory:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:5001
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB service
   mongod
   
   # (Optional) Run the seed script to populate sample data
   cd server
   node scripts/seedData.js
   ```

5. **Start the application**
   ```bash
   # Start backend server (from server directory)
   npm start
   # Server will run on http://localhost:5001
   
   # In a new terminal, start frontend (from client directory)
   cd client
   npm start
   # Frontend will run on http://localhost:3000
   ```

6. **Access the application**
   - Open your browser and navigate to http://localhost:3000
   - You'll see the landing page - click "Register" to create an account
   - Start exploring the platform!

## 🎯 Getting Started

After installation:
1. **Create an account**: Click "Register" on the landing page
2. **Explore the dashboard**: View your portfolio, market data, and AI insights
3. **Try virtual trading**: Practice with virtual cash before investing real money
4. **Join the community**: Follow other traders and share your insights
5. **Learn**: Access educational courses and market insights

## 📡 API Documentation

### Authentication Endpoints
```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
GET  /api/auth/me          # Get current user profile
PUT  /api/auth/profile     # Update user profile
```

### Portfolio Management
```
GET  /api/portfolio              # Get user's portfolio
POST /api/portfolio/buy          # Buy stock (real or virtual)
POST /api/portfolio/sell         # Sell stock holdings
GET  /api/portfolio/performance  # Get portfolio performance metrics
GET  /api/portfolio/history      # Get transaction history
```

### Market Data
```
GET  /api/finance/stock/:symbol        # Get stock details
GET  /api/finance/search/:query        # Search for stocks
GET  /api/finance/market-overview      # Get market overview
GET  /api/finance/trending             # Get trending stocks
GET  /api/public/stats                 # Get platform statistics
```

### AI Chat & Analysis
```
POST /api/chat/message          # Send message to AI advisor
GET  /api/chat/sessions         # Get user's chat sessions
POST /api/chat/sessions         # Create new chat session
DELETE /api/chat/sessions/:id   # Delete chat session
```

### Social Trading
```
GET  /api/social/feed           # Get social feed posts
POST /api/social/posts          # Create new post
POST /api/social/posts/:id/upvote    # Upvote a post
POST /api/social/posts/:id/downvote  # Downvote a post
POST /api/social/posts/:id/comment   # Comment on a post
GET  /api/social/leaderboard    # Get leaderboard
GET  /api/social/trending       # Get trending posts
```

### Alerts & Watchlists
```
GET  /api/alerts                # Get user's price alerts
POST /api/alerts                # Create price alert
DELETE /api/alerts/:id          # Delete price alert
GET  /api/watchlists            # Get user's watchlists
POST /api/watchlists            # Add stock to watchlist
```

### Education
```
GET  /api/education/courses     # Get available courses
GET  /api/education/insights    # Get market insights
POST /api/education/progress    # Update course progress
```



## 📊 Platform Features

### Security
- **JWT Authentication**: Secure token-based authentication
- **Password Encryption**: Bcrypt password hashing
- **Rate Limiting**: API request throttling to prevent abuse
- **Input Validation**: Comprehensive data validation
- **CORS Protection**: Cross-origin request security
- **Environment Variables**: Secure configuration management

### Performance
- **API Caching**: Hourly caching for external API calls (Alpha Vantage, News API)
- **Database Indexing**: Optimized MongoDB queries
- **Real-time Updates**: Efficient WebSocket connections
- **Lazy Loading**: Optimized frontend performance

## 🚀 Deployment

### Production Deployment Steps

1. **Set up production MongoDB**
   - Use MongoDB Atlas or your own MongoDB cluster
   - Update `MONGO_URI` in production environment

2. **Configure environment variables**
   - Set all required environment variables on your hosting platform
   - Ensure `NODE_ENV=production`
   - Add production API keys

3. **Build frontend for production**
   ```bash
   cd client
   npm run build
   ```

4. **Deploy backend**
   - Deploy to platforms like Heroku, DigitalOcean, AWS, or Railway
   - Ensure Node.js v16+ is available
   - Start server with `npm start`

5. **Deploy frontend**
   - Deploy the `client/build` folder to Netlify, Vercel, or similar
   - Configure environment variables for production API URL

6. **Optional: Use PM2 for process management**
   ```bash
   npm install -g pm2
   pm2 start server.js --name simply-invest
   pm2 save
   pm2 startup
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

## � Screenshots

### Landing Page
The landing page showcases all platform features with a modern, gradient-rich design that immediately communicates the value proposition: a completely free AI-powered investment platform.

### Dashboard
Comprehensive dashboard showing portfolio performance, market overview, AI insights, and quick access to all platform features.

### Portfolio Management
Track both real and virtual portfolios with detailed P&L analysis, transaction history, and performance metrics.

### AI Financial Advisor
Chat interface powered by OpenAI providing personalized investment advice, stock analysis, and market insights.

### Social Trading
Engage with the investment community through posts, comments, leaderboards, and following top traders.

## 🚀 Future Roadmap

- [ ] **Mobile App**: Native iOS and Android applications
- [ ] **Advanced Charting**: More technical indicators and drawing tools
- [ ] **Cryptocurrency Support**: Track and trade crypto assets
- [ ] **Options Trading**: Options analysis and virtual options trading
- [ ] **Portfolio Optimization**: AI-powered portfolio rebalancing suggestions
- [ ] **Tax Reporting**: Generate tax reports for realized gains/losses
- [ ] **News Aggregation**: Personalized news feed based on portfolio
- [ ] **Dividend Tracking**: Track dividend income and reinvestment
- [ ] **Multi-language Support**: Internationalization for global users
- [ ] **Dark/Light Themes**: User-selectable theme preferences
