import mongoose from 'mongoose';
import Tenant from '../models/Tenant.js';
import WhiteLabelConfig from '../models/WhiteLabelConfig.js';
import User from '../models/User.js';
import TenantUser from '../models/TenantUser.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const seedTenants = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing tenants (optional - comment out if you want to keep existing data)
    // await Tenant.deleteMany({});
    // await WhiteLabelConfig.deleteMany({});
    // await TenantUser.deleteMany({});
    // console.log('Cleared existing tenants');

    // Create default tenant
    const defaultTenant = new Tenant({
      name: 'Simply Invest Demo',
      domain: 'localhost:3000',
      subdomain: 'demo',
      branding: {
        companyName: 'Simply Invest Demo',
        tagline: 'Your Investment Journey Starts Here',
        description: 'A comprehensive investment platform for modern investors',
        email: 'demo@simplyinvest.com',
        website: 'https://simplyinvest.com'
      },
      features: {
        portfolio: true,
        alerts: true,
        social: true,
        education: true,
        trading: true,
        backtesting: true,
        analytics: true,
        ai: true,
        news: true,
        watchlists: true
      },
      subscription: {
        plan: 'ENTERPRISE',
        status: 'ACTIVE',
        maxUsers: 1000,
        currentUsers: 0,
        maxStorage: 50000 // 50GB
      },
      settings: {
        defaultLanguage: 'en',
        defaultCurrency: 'USD',
        defaultTimezone: 'UTC',
        allowRegistration: true,
        requireEmailVerification: false,
        allowSocialLogin: true,
        maintenanceMode: false
      },
      contact: {
        firstName: 'Demo',
        lastName: 'Admin',
        email: 'demo@simplyinvest.com',
        company: 'Simply Invest'
      },
      apiKeys: {
        openai: process.env.OPENAI_API_KEY || 'placeholder-openai-key',
        alphaVantage: process.env.ALPHA_VANTAGE_API_KEY || 'placeholder-alpha-vantage-key',
        newsApi: process.env.NEWS_API_KEY || 'placeholder-news-api-key'
      }
    });

    const savedTenant = await defaultTenant.save();
    console.log('Created default tenant:', savedTenant.name);

    // Create default white-label configuration
    const defaultConfig = new WhiteLabelConfig({
      tenantId: savedTenant.id,
      theme: {
        primary: '#3b82f6',
        secondary: '#64748b',
        accent: '#10b981',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f8fafc',
        textSecondary: '#cbd5e1',
        border: '#334155',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      },
      branding: {
        appName: 'Simply Invest Demo',
        tagline: 'Your Investment Journey Starts Here',
        description: 'A comprehensive investment platform for modern investors',
        metaTitle: 'Simply Invest - Smart Investment Platform',
        metaDescription: 'Make smarter investment decisions with our comprehensive platform featuring portfolio tracking, market analysis, and AI-powered insights.'
      },
      features: {
        darkMode: true,
        animations: true,
        soundEffects: false,
        keyboardShortcuts: true,
        offlineMode: true,
        pushNotifications: true,
        multiLanguage: true,
        rtlSupport: false,
        accessibility: true,
        autoSave: true
      },
      modules: {
        dashboard: true,
        portfolio: true,
        alerts: true,
        social: true,
        education: true,
        trading: true,
        backtesting: true,
        analytics: true,
        ai: true,
        news: true,
        watchlists: true,
        settings: true
      }
    });

    const savedConfig = await defaultConfig.save();
    console.log('Created default white-label config');

    // Create admin user if it doesn't exist
    let adminUser = await User.findOne({ email: 'admin@simplyinvest.com' });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminUser = new User({
        name: 'Admin User',
        email: 'admin@simplyinvest.com',
        password: hashedPassword
      });
      await adminUser.save();
      console.log('Created admin user');
    }

    // Create tenant-user relationship
    const existingTenantUser = await TenantUser.findOne({
      tenantId: savedTenant.id,
      userId: adminUser._id
    });

    if (!existingTenantUser) {
      const tenantUser = new TenantUser({
        tenantId: savedTenant.id,
        userId: adminUser._id,
        role: 'ADMIN',
        permissions: [
          { resource: 'tenant', actions: ['read', 'write', 'delete', 'admin'] },
          { resource: 'users', actions: ['read', 'write', 'delete', 'admin'] },
          { resource: 'portfolio', actions: ['read', 'write', 'delete', 'admin'] },
          { resource: 'alerts', actions: ['read', 'write', 'delete', 'admin'] },
          { resource: 'social', actions: ['read', 'write', 'delete', 'admin'] },
          { resource: 'education', actions: ['read', 'write', 'delete', 'admin'] },
          { resource: 'trading', actions: ['read', 'write', 'delete', 'admin'] },
          { resource: 'analytics', actions: ['read', 'write', 'delete', 'admin'] }
        ]
      });
      await tenantUser.save();
      console.log('Created tenant-user relationship');
    }

    // Update tenant user count
    await Tenant.findOneAndUpdate(
      { id: savedTenant.id },
      { 'subscription.currentUsers': 1 }
    );

    console.log('Seed completed successfully!');
    console.log('---');
    console.log('Login credentials:');
    console.log('Email: admin@simplyinvest.com');
    console.log('Password: admin123');
    console.log('---');
    console.log('Tenant details:');
    console.log('Name:', savedTenant.name);
    console.log('Domain:', savedTenant.domain);
    console.log('Subdomain:', savedTenant.subdomain);
    console.log('ID:', savedTenant.id);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding tenants:', error);
    process.exit(1);
  }
};

seedTenants();