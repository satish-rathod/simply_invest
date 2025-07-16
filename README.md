# Simply Invest - Multi-Tenant Financial Investment Platform

## 🚀 Project Overview

Simply Invest is a comprehensive, multi-tenant financial investment platform built with the MERN stack (MongoDB, Express.js, React, Node.js). The platform provides users with real-time stock market data, AI-powered financial advice, portfolio management, social trading features, and educational resources. With its advanced white-label solution and multi-tenant architecture, the platform can be deployed for multiple organizations with customizable branding and features.

## ✨ Key Features

### 🏢 Multi-Tenant Architecture
- **Tenant Isolation**: Complete data separation between tenants
- **Subscription Management**: Flexible plans (Starter, Professional, Enterprise)
- **User Management**: Role-based access control with permissions
- **Resource Limits**: Configurable user and storage limits per tenant
- **Maintenance Mode**: Tenant-specific maintenance capabilities

### 🎨 White-Label Solution
- **Custom Branding**: Logo, colors, typography, and company information
- **Theme Customization**: Complete UI theming with color schemes
- **Module Configuration**: Enable/disable features per tenant
- **SEO Optimization**: Custom meta tags, descriptions, and keywords
- **Custom CSS/JS**: Advanced customization options

### 💼 Financial Features
- **Portfolio Management**: Personal investment tracking with P&L analysis
- **Real-time Market Data**: Live stock prices and market updates
- **AI Financial Advisor**: OpenAI-powered investment guidance
- **Stock Recommendations**: Daily curated investment suggestions
- **Watchlists**: Monitor favorite stocks and assets
- **Price Alerts**: Custom notifications for price movements

### 📊 Advanced Analytics
- **Performance Metrics**: Portfolio performance tracking
- **Technical Analysis**: Charts and indicators
- **Risk Assessment**: Investment risk evaluation
- **Market Insights**: AI-powered market analysis
- **Trading History**: Complete transaction tracking

### 🌐 Social & Community
- **Social Trading**: Follow and copy successful traders
- **Investment Communities**: Join topic-specific groups
- **Leaderboards**: Track top performers
- **Discussion Forums**: Share insights and strategies
- **User Profiles**: Professional investor profiles

### 🎓 Educational Resources
- **Learning Modules**: Structured investment courses
- **Market Insights**: Daily market analysis and news
- **Strategy Guides**: Investment strategy documentation
- **Glossary**: Financial terms and definitions
- **Video Tutorials**: Step-by-step learning content

### 🔧 Technical Features
- **PWA Support**: Progressive Web App capabilities
- **Real-time Updates**: WebSocket-based live data
- **Multi-language Support**: Internationalization (i18n)
- **Automated Trading**: Integration with trading APIs
- **Backtesting**: Strategy testing with historical data
- **Push Notifications**: Real-time alerts and updates

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
- **Multi-tenant Models**: Tenant, WhiteLabelConfig, TenantUser
- **User Management**: User, UserActivity, UserProgress
- **Financial Data**: Portfolio, Trade, Alert, WatchList, MarketData
- **Social Features**: Post, Comment, Following, Community
- **Educational**: Course, Module, MarketInsight

## 📁 Project Structure

```
/app/
├── server/                     # Backend (Node.js/Express)
│   ├── controllers/           # API controllers
│   │   ├── tenantController.js
│   │   ├── whiteLabelController.js
│   │   ├── tenantUserController.js
│   │   ├── authController.js
│   │   ├── portfolioController.js
│   │   ├── chatController.js
│   │   └── ...
│   ├── models/               # Database models
│   │   ├── Tenant.js
│   │   ├── WhiteLabelConfig.js
│   │   ├── TenantUser.js
│   │   ├── User.js
│   │   ├── Portfolio.js
│   │   └── ...
│   ├── routes/               # API routes
│   │   ├── tenantRoutes.js
│   │   ├── whiteLabelRoutes.js
│   │   ├── tenantUserRoutes.js
│   │   └── ...
│   ├── middleware/           # Custom middleware
│   │   ├── tenantMiddleware.js
│   │   ├── authMiddleware.js
│   │   └── ...
│   ├── utils/                # Utility functions
│   │   ├── scraper.js
│   │   ├── aiService.js
│   │   ├── marketData.js
│   │   └── ...
│   ├── scripts/              # Utility scripts
│   │   └── seedTenants.js
│   └── server.js            # Main server file
├── client/                   # Frontend (React)
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── AdminPanel.js
│   │   │   ├── WhiteLabelConfig.js
│   │   │   ├── Portfolio.js
│   │   │   ├── Analytics.js
│   │   │   └── ...
│   │   ├── i18n/           # Internationalization
│   │   ├── utils/          # Utility functions
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   ├── public/
│   │   ├── manifest.json   # PWA manifest
│   │   └── sw.js          # Service worker
│   └── package.json
├── supervisord.conf         # Process management
└── README.md
```

## How It Works

### Backend

1. **Server Setup**: The `server.js` file sets up the Express server, connects to MongoDB, and defines the main routes.

2. **Authentication**: 
   - Users can register and login using the `/api/auth` routes.
   - `authController.js` handles user registration and login logic.
   - JWT tokens are used for maintaining user sessions.

3. **Stock Data**:
   - The `scraper.js` utility scrapes stock market data and recommendations daily.
   - Scraped data is stored in MongoDB using the `StockRecommendation` and `StockMarket` models.
   - `stockController.js` handles requests for stock data and recommendations.

4. **AI Chatbot**:
   - `chatRoutes.js` defines the endpoints for the chat functionality.
   - `chatController.js` processes user messages and generates responses.
   - `openai.js` utility integrates with the OpenAI API to generate intelligent responses.

5. **Middleware**:
   - `authMiddleware.js` protects routes that require authentication.

### Frontend

1. **App Structure**: `App.js` sets up the main structure of the React application and defines routes.

2. **User Authentication**:
   - `Register.js` and `Login.js` components handle user registration and login.
   - Upon successful authentication, a JWT token is stored for maintaining the user session.

3. **Stock Data Display**:
   - Components (to be implemented) will fetch and display stock market data and recommendations from the backend API.

4. **Chat Interface**:
   - A chat interface component (to be implemented) will allow users to interact with the AI chatbot.
   - Messages are sent to the backend, processed, and responses are displayed to the user.

## Data Flow

1. The scraper runs daily to fetch the latest stock market data and recommendations.
2. Users register or login to access the application.
3. Authenticated users can view stock market data and recommendations fetched from the backend.
4. Users can interact with the AI chatbot, sending messages through the chat interface.
5. The backend processes these messages, using the OpenAI API to generate responses.
6. The AI-generated responses are sent back to the frontend and displayed to the user.

## Setup and Installation

(Include steps for setting up the project, including environment variables, database setup, and running the application)

## Future Enhancements

- Real-time stock data updates using WebSockets
- User portfolio management
- Advanced stock analysis tools
- Mobile app version
