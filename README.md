# Simply Invest -- AI-Powered Investment Platform

## Overview

Simply Invest is a free, full-stack investment platform that combines portfolio management, real-time market data, AI-powered financial advice, social trading, virtual trading, and structured educational content. Built on the MERN stack (MongoDB, Express.js, React, Node.js), it provides a comprehensive environment for investors to research, trade, learn, and connect with other investors.

## Features

### Portfolio Management
- Track real and virtual portfolios with live profit/loss analysis
- Buy and sell stocks with real-time price data
- View transaction history and detailed performance metrics
- Split portfolio views for real vs. virtual holdings

### AI Financial Advisor
- Chat interface powered by OpenAI with function-calling capabilities
- The AI can look up live stock prices, historical data, and technical indicators on demand
- Sentiment analysis on market data using the `sentiment` and `natural` NLP libraries
- Conversation history and session management

### Real-Time Market Data
- Live stock prices via Yahoo Finance with OpenBB API as a fallback
- Market overview showing major indices (SPY, DIA, QQQ, IWM, VIX)
- WebSocket-based real-time price broadcasts for subscribed stocks
- In-memory caching (node-cache) to reduce redundant API calls
- Stock search and detailed stock information pages

### Virtual Trading
- Practice trading with simulated cash using real market prices
- Track virtual portfolio performance independently from real holdings
- Risk-free environment to test strategies before committing capital

### Social Trading and Community
- Social feed with posts, upvotes, downvotes, and comments
- Follow other users and build an investor profile
- Leaderboard ranking top performers
- Trending posts discovery

### Price Alerts and Watchlists
- Set custom price alerts on any stock symbol
- Alerts are checked automatically every 5 minutes via cron
- Real-time notifications delivered through WebSocket when alerts trigger
- Maintain personal watchlists of stocks to monitor

### Education
- Structured courses with modules and progress tracking
- Market insights and educational content
- Track learning progress across courses

### Analytics and Technical Analysis
- Advanced technical indicators: SMA, EMA, RSI, MACD, Bollinger Bands, Stochastic Oscillator, ATR, Williams %R, CCI, OBV
- Interactive charts built with Recharts
- Portfolio performance analytics and reporting

### Backtesting Engine
- Test trading strategies against historical data
- Configurable strategy parameters (symbol, timeframe, initial balance)
- Detailed results including win rate, max drawdown, total P&L, and equity curves

### Trading Bot Framework
- Automated trading bot infrastructure with configurable strategies
- Bots execute trades based on technical indicator signals
- Email notifications for executed trades via Nodemailer

### Multi-Tenant / White-Label Support
- Tenant management with custom branding and configuration
- White-label configuration for reskinning the platform
- Tenant-scoped user management

### Internationalization
- Translation files for English, Spanish, and French
- i18n utility layer in the client

### Progressive Web App
- Service worker for offline support and caching
- PWA manifest with installable app capabilities

## Technology Stack

### Backend (Node.js / Express)
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) with bcrypt password hashing
- **Real-Time**: Socket.IO for WebSocket communication
- **AI**: OpenAI SDK with function calling for live data lookup
- **NLP**: sentiment and natural libraries for text analysis
- **Market Data**: yahoo-finance2 as primary source, OpenBB API as fallback
- **Caching**: node-cache for in-memory API response caching
- **Scheduling**: node-cron for periodic tasks (scraping, alert checks, price broadcasts)
- **Security**: helmet, express-rate-limit, CORS, express-validator
- **Email**: Nodemailer for alert and trade notifications
- **Web Scraping**: cheerio for parsing financial data pages
- **Compression**: compression middleware for response optimization

### Frontend (React)
- **Framework**: React 18 with functional components and hooks
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with @tailwindcss/forms and @tailwindcss/typography
- **Animations**: Framer Motion
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Notifications**: react-hot-toast
- **Real-Time**: socket.io-client for WebSocket connections
- **Performance**: react-virtualized for efficient list rendering, react-intersection-observer for lazy loading
- **Date Handling**: date-fns

### OpenBB Service (Python)
- FastAPI / Uvicorn server wrapping the OpenBB SDK
- Provides an alternative market data API on port 8000
- Used as a fallback when Yahoo Finance rate limits are hit

### Deployment
- **Backend**: Render (render.yaml included)
- **Frontend**: Vercel (vercel.json included with SPA rewrites)
- **Process Management**: Supervisor configuration for running both services (supervisord.conf)

## Project Structure

```
simply_invest/
├── server/                          # Backend API
│   ├── server.js                    # Main entry point, Express app, Socket.IO, cron jobs
│   ├── config/
│   │   └── db.js                    # MongoDB connection configuration
│   ├── controllers/
│   │   ├── authController.js        # Registration, login, profile management
│   │   ├── portfolioController.js   # Buy/sell stocks, portfolio CRUD, performance
│   │   ├── chatController.js        # AI chat sessions and message handling
│   │   ├── financeController.js     # Stock lookup, search, market overview
│   │   ├── socialController.js      # Posts, comments, upvotes, leaderboard, following
│   │   ├── educationController.js   # Courses, modules, progress tracking
│   │   ├── alertController.js       # Price alert CRUD and automated checking
│   │   ├── watchListController.js   # Watchlist management
│   │   ├── newsController.js        # News feed endpoints
│   │   ├── stockController.js       # Stock detail and recommendation endpoints
│   │   ├── dashboardController.js   # Dashboard aggregate data
│   │   ├── tenantController.js      # Multi-tenant management
│   │   ├── tenantUserController.js  # Tenant-scoped user management
│   │   └── whiteLabelController.js  # White-label configuration
│   ├── models/                      # Mongoose schemas (23 models)
│   │   ├── User.js, Portfolio.js, Trade.js, Transaction.js
│   │   ├── ChatSession.js, ChatMessage.js
│   │   ├── Post.js, Community.js, Following.js, LeaderBoard.js
│   │   ├── Alert.js, WatchList.js
│   │   ├── MarketData.js, MarketInsight.js, StockMarket.js, StockRecommendation.js
│   │   ├── Course.js, UserProgress.js
│   │   ├── TradingBot.js, BacktestResult.js
│   │   ├── Tenant.js, TenantUser.js, WhiteLabelConfig.js
│   ├── routes/                      # Express route definitions (17 route files)
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT token verification
│   │   ├── tenantMiddleware.js      # Multi-tenant request scoping
│   │   └── validationMiddleware.js  # Request validation
│   ├── services/
│   │   ├── tradingEngine.js         # Automated trading bot execution
│   │   ├── backtestEngine.js        # Strategy backtesting engine
│   │   └── openbbService.js         # OpenBB API client for market data
│   ├── utils/
│   │   ├── aiService.js             # OpenAI integration with function calling
│   │   ├── marketData.js            # Yahoo Finance + OpenBB data fetching
│   │   ├── technicalAnalysis.js     # SMA, EMA, RSI, MACD, Bollinger Bands, etc.
│   │   ├── scraper.js               # Web scraper for financial data
│   │   ├── email.js                 # Nodemailer email sending
│   │   ├── openai.js                # OpenAI client initialization
│   │   ├── chatbot.js               # Chatbot utilities
│   │   └── seedSocialData.js        # Social feed seed data generator
│   ├── scripts/                     # Database seed, verification, and utility scripts
│   ├── .env.example                 # Environment variable template
│   └── render.yaml                  # Render deployment configuration
├── client/                          # React frontend
│   ├── src/
│   │   ├── App.js                   # Root component, routing, layout, sidebar, header
│   │   ├── config.js                # API URL configuration
│   │   ├── index.js                 # React entry point
│   │   ├── index.css                # Global styles (Tailwind directives)
│   │   ├── components/
│   │   │   ├── LandingPage.js       # Public landing page
│   │   │   ├── Login.js             # Login form
│   │   │   ├── Register.js          # Registration form
│   │   │   ├── Dashboard.js         # Main dashboard with market data
│   │   │   ├── Portfolio.js         # Portfolio management view
│   │   │   ├── VirtualTrading.js    # Virtual trading interface
│   │   │   ├── MarketOverview.js    # Market indices and stock data
│   │   │   ├── ChatInterface.js     # AI chat interface
│   │   │   ├── SocialFeed.js        # Social trading feed
│   │   │   ├── Analytics.js         # Portfolio analytics and charts
│   │   │   ├── Alerts.js            # Price alert management
│   │   │   ├── WatchLists.js        # Watchlist management
│   │   │   ├── Education.js         # Courses and learning content
│   │   │   ├── NewsSection.js       # Financial news feed
│   │   │   ├── UserProfile.js       # User profile page
│   │   │   ├── Settings.js          # User settings
│   │   │   ├── AdminPanel.js        # Admin panel for platform management
│   │   │   ├── WhiteLabelConfig.js  # White-label configuration UI
│   │   │   ├── ErrorBoundary.js     # React error boundary
│   │   │   ├── ModernChart.js       # Reusable chart component
│   │   │   ├── RecommendationCard.js, StackedRecommendationCards.js
│   │   │   ├── *Skeleton.js         # Loading skeleton components (8 files)
│   │   │   └── ui/                  # Reusable UI primitives (button, card, input, skeleton)
│   │   ├── hooks/
│   │   │   └── usePublicStats.js    # Hook for fetching platform statistics
│   │   ├── utils/
│   │   │   ├── i18n.js              # Internationalization utilities
│   │   │   └── pwa.js               # Progressive Web App registration
│   │   └── i18n/                    # Translation files (en, es, fr)
│   ├── public/
│   │   ├── index.html               # HTML template
│   │   ├── manifest.json            # PWA manifest
│   │   └── sw.js                    # Service worker
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   └── vercel.json                  # Vercel deployment configuration
├── openbb_service/                  # Python-based market data microservice
│   ├── start_server.sh              # Script to set up venv and start OpenBB API
│   └── requirements.txt             # Python dependencies (openbb, uvicorn, fastapi)
├── scripts/                         # Top-level utility scripts
│   ├── reproduce_auth.sh            # Auth flow reproduction script
│   └── verify_chat_sessions.sh      # Chat session verification script
├── tests/
│   ├── backend_test.py              # Backend API test suite (Python)
│   ├── test_portfolio_quantity_fix.js # Portfolio quantity bug fix test
│   └── test_result.md               # Test results documentation
├── supervisord.conf                 # Supervisor config for running all services
├── package.json                     # Root package.json (concurrently runs server + client)
└── .gitignore
```

## Getting Started

### Prerequisites

- Node.js v16 or higher
- MongoDB v4.4 or higher (local instance or MongoDB Atlas)
- npm or yarn
- Python 3.8+ (optional, only for the OpenBB market data service)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/satish-rathod/simply_invest.git
   cd simply_invest
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Install root dependencies** (for the `concurrently` launcher)
   ```bash
   cd ..
   npm install
   ```

### Configuration

Create a `.env` file in the `server/` directory. Use `server/.env.example` as a reference:

```env
PORT=5001
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/simply_invest?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
NEWS_API_KEY=your_news_api_key
FRONTEND_URL=http://localhost:3000
```

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for JWT token signing |
| `OPENAI_API_KEY` | No | OpenAI API key for AI chat features (falls back to rule-based responses) |
| `ALPHA_VANTAGE_API_KEY` | No | Alpha Vantage API key for supplementary market data |
| `NEWS_API_KEY` | No | News API key for financial news feeds |
| `PORT` | No | Server port (defaults to 5001) |
| `FRONTEND_URL` | No | Frontend URL for CORS in production |

Optionally create a `client/.env` file:
```env
REACT_APP_API_URL=http://localhost:5001
```

### Running the Application

**Start both server and client simultaneously:**
```bash
npm start
```
This uses `concurrently` to run the backend (port 5001) and frontend (port 3000) together.

**Or start them separately:**

```bash
# Terminal 1 - Backend
cd server
npm start
# Server runs on http://localhost:5001

# Terminal 2 - Frontend
cd client
npm start
# Frontend runs on http://localhost:3000
```

**Optional: Start the OpenBB market data service:**
```bash
cd openbb_service
./start_server.sh
# OpenBB API runs on http://localhost:8000
```

### Seed Data

Populate the database with sample data for development:

```bash
cd server

# Seed educational courses
node scripts/seed/seedEducation.js

# Seed complete dashboard data
node scripts/seed/seed_complete.js

# Seed social feed posts
node scripts/seed/seed_full_dashboard.js

# Seed tenant data (for multi-tenant features)
node scripts/seedTenants.js

# Update global market data
node scripts/update_global_market_data.js
```

## API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create a new user account |
| POST | `/api/auth/login` | Authenticate and receive JWT |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/profile` | Update user profile |

### Portfolio
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/portfolio` | Get user portfolio |
| POST | `/api/portfolio/buy` | Buy stock (real or virtual) |
| POST | `/api/portfolio/sell` | Sell stock holdings |
| GET | `/api/portfolio/performance` | Portfolio performance metrics |
| GET | `/api/portfolio/history` | Transaction history |

### Market Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/finance/stock/:symbol` | Get stock details |
| GET | `/api/finance/search/:query` | Search for stocks |
| GET | `/api/finance/market-overview` | Market indices overview |
| GET | `/api/stocks/trending` | Trending stocks |
| GET | `/api/public/stats` | Public platform statistics |

### AI Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/message` | Send message to AI advisor |
| GET | `/api/chat/sessions` | List chat sessions |
| POST | `/api/chat/sessions` | Create new chat session |
| DELETE | `/api/chat/sessions/:id` | Delete a chat session |

### Social
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/social/feed` | Get social feed |
| POST | `/api/social/posts` | Create a post |
| POST | `/api/social/posts/:id/upvote` | Upvote a post |
| POST | `/api/social/posts/:id/downvote` | Downvote a post |
| POST | `/api/social/posts/:id/comment` | Comment on a post |
| GET | `/api/social/leaderboard` | Get leaderboard |

### Alerts and Watchlists
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts` | Get user alerts |
| POST | `/api/alerts` | Create a price alert |
| DELETE | `/api/alerts/:id` | Delete an alert |
| GET | `/api/watchlists` | Get user watchlists |
| POST | `/api/watchlists` | Add stock to watchlist |

### Education
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/education/courses` | List available courses |
| GET | `/api/education/insights` | Get market insights |
| POST | `/api/education/progress` | Update course progress |

### Analytics and Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/*` | Various analytics endpoints |
| GET | `/api/dashboard` | Aggregated dashboard data |
| GET | `/api/realtime/*` | Real-time data endpoints |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health and status |
| GET | `/` | API status message |

## Deployment

### Backend (Render)

The project includes a `server/render.yaml` for deployment on Render:

1. Connect the GitHub repository to Render
2. Configure environment variables in the Render dashboard
3. Set `NODE_ENV=production` and the production `MONGO_URI`
4. Render will automatically install dependencies and start the server

### Frontend (Vercel)

The client includes a `client/vercel.json` with SPA rewrite rules:

1. Import the repository into Vercel
2. Set the root directory to `client`
3. Set `REACT_APP_API_URL` to your deployed backend URL
4. Vercel handles build and deployment automatically

### Using Supervisor

For running both services with process management:
```bash
npm run supervisor
```
This uses the `supervisord.conf` to manage the backend and frontend processes together.

## Security

- JWT-based authentication with bcrypt password hashing
- Helmet middleware for HTTP security headers
- Rate limiting (1000 requests per 15 minutes per IP on `/api/` routes)
- CORS configured for allowed origins only
- Input validation via express-validator
- Request and response timeouts (30 seconds)
- Environment variable-based configuration (secrets never hardcoded)

## License

ISC
