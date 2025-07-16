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
   yarn install
   ```

3. **Environment Setup**
   
   Create `.env` file in the server directory:
   ```env
   # Database
   MONGO_URI=mongodb://localhost:27017/simply-invest
   
   # Authentication
   JWT_SECRET=your_jwt_secret_here
   
   # External APIs (Optional)
   OPENAI_API_KEY=your_openai_key_here
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
   NEWS_API_KEY=your_news_api_key_here
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```
   
   Create `.env` file in the client directory:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:5000
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB service
   mongod
   
   # Run the seed script to create default tenant and admin user
   cd server
   node scripts/seedTenants.js
   ```

5. **Start the application**
   ```bash
   # Start backend server (from server directory)
   npm start
   
   # Start frontend client (from client directory)
   yarn start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Admin Panel: Use credentials from seed script

### Default Admin Credentials
After running the seed script, you can login with:
- **Email**: admin@simplyinvest.com
- **Password**: admin123

## 🏢 Multi-Tenant Setup

### Creating a New Tenant

1. **Login as Admin**
   - Access the admin panel at `/admin`
   - Use the default admin credentials

2. **Create Tenant**
   - Click "Create Tenant" in the admin panel
   - Fill in tenant details:
     - Name, domain, subdomain
     - Contact information
     - Subscription plan
     - Enabled features

3. **Configure White-Label**
   - Access white-label configuration
   - Customize theme colors
   - Upload logos and branding assets
   - Configure SEO settings
   - Enable/disable modules

### Tenant Access Methods

Users can access tenant-specific instances through:

1. **Subdomain**: `https://tenant.yourdomain.com`
2. **Custom Domain**: `https://tenant-custom-domain.com`
3. **Header-based**: Include `X-Tenant-ID` header in API requests
4. **Query Parameter**: `?tenant=tenant-id`

## 🔧 API Documentation

### Authentication Endpoints
```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
GET  /api/auth/me          # Get current user
```

### Tenant Management
```
GET    /api/tenants                    # List all tenants
POST   /api/tenants                    # Create new tenant
GET    /api/tenants/:id                # Get tenant by ID
PUT    /api/tenants/:id                # Update tenant
DELETE /api/tenants/:id                # Delete tenant
PUT    /api/tenants/:id/features       # Update tenant features
PUT    /api/tenants/:id/maintenance    # Toggle maintenance mode
GET    /api/tenants/:id/analytics      # Get tenant analytics
```

### White-Label Configuration
```
GET  /api/white-label/:tenantId           # Get configuration
PUT  /api/white-label/:tenantId           # Update configuration
PUT  /api/white-label/:tenantId/theme     # Update theme
PUT  /api/white-label/:tenantId/branding  # Update branding
PUT  /api/white-label/:tenantId/modules   # Update modules
GET  /api/white-label/public/:domain      # Get public config
```

### Financial Data
```
GET  /api/portfolio           # Get user portfolio
POST /api/portfolio/add       # Add investment
GET  /api/stocks/:symbol      # Get stock data
GET  /api/watchlists         # Get watchlists
POST /api/alerts             # Create price alert
```

## 🎨 Customization Guide

### Theme Customization
Access the white-label configuration panel to customize:
- **Primary Colors**: Main brand colors
- **Typography**: Font families and sizes
- **Layout**: Spacing and component styling
- **Components**: Individual component theming

### Feature Configuration
Enable/disable features per tenant:
- Portfolio Management
- Social Trading
- Educational Content
- AI Financial Advisor
- Advanced Analytics
- Trading Integration

### Branding Elements
- Company logo and favicon
- App name and tagline
- Meta tags and SEO
- Custom CSS/JavaScript
- Email templates

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Tenant Isolation**: Complete data separation
- **Rate Limiting**: API request throttling
- **Input Validation**: Comprehensive data validation
- **CORS Protection**: Cross-origin request security
- **Helmet Security**: HTTP headers protection

## 📊 Monitoring & Analytics

### Tenant Analytics
- Monthly active users
- Total page views
- Session duration
- Conversion rates
- Revenue tracking

### System Metrics
- Server performance
- Database optimization
- API response times
- Error tracking
- User behavior analysis

## 🌐 Deployment

### Production Deployment
1. Set up production MongoDB cluster
2. Configure environment variables
3. Build frontend for production
4. Deploy using PM2 or Docker
5. Set up reverse proxy (Nginx)
6. Configure SSL certificates

### Docker Deployment
```dockerfile
# Example Dockerfile structure
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
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

## 🚀 Future Roadmap

- [ ] Mobile app development
- [ ] Advanced backtesting engine
- [ ] Cryptocurrency support
- [ ] Options trading features
- [ ] Advanced technical indicators
- [ ] Machine learning predictions
- [ ] API marketplace integration
- [ ] Advanced reporting dashboard
