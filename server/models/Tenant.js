import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const tenantSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  name: { type: String, required: true },
  domain: { type: String, required: true, unique: true },
  subdomain: { type: String, required: true, unique: true },
  logo: { type: String },
  favicon: { type: String },
  primaryColor: { type: String, default: '#3b82f6' },
  secondaryColor: { type: String, default: '#1f2937' },
  accentColor: { type: String, default: '#10b981' },
  fontFamily: { type: String, default: 'Inter' },
  customCSS: { type: String },
  branding: {
    companyName: { type: String, required: true },
    tagline: { type: String },
    description: { type: String },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    website: { type: String },
    socialLinks: {
      twitter: { type: String },
      linkedin: { type: String },
      facebook: { type: String },
      instagram: { type: String }
    }
  },
  features: {
    portfolio: { type: Boolean, default: true },
    alerts: { type: Boolean, default: true },
    social: { type: Boolean, default: true },
    education: { type: Boolean, default: true },
    trading: { type: Boolean, default: false },
    backtesting: { type: Boolean, default: false },
    analytics: { type: Boolean, default: true },
    ai: { type: Boolean, default: true },
    news: { type: Boolean, default: true },
    watchlists: { type: Boolean, default: true }
  },
  subscription: {
    plan: { type: String, enum: ['STARTER', 'PROFESSIONAL', 'ENTERPRISE'], default: 'STARTER' },
    status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'CANCELLED'], default: 'ACTIVE' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    maxUsers: { type: Number, default: 100 },
    currentUsers: { type: Number, default: 0 },
    maxStorage: { type: Number, default: 5000 }, // MB
    currentStorage: { type: Number, default: 0 }
  },
  settings: {
    defaultLanguage: { type: String, default: 'en' },
    defaultCurrency: { type: String, default: 'USD' },
    defaultTimezone: { type: String, default: 'UTC' },
    allowRegistration: { type: Boolean, default: true },
    requireEmailVerification: { type: Boolean, default: false },
    allowSocialLogin: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String }
  },
  apiKeys: {
    openai: { type: String },
    alphaVantage: { type: String },
    newsApi: { type: String },
    sendgrid: { type: String },
    stripe: { type: String },
    custom: { type: Object }
  },
  billing: {
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    billingEmail: { type: String },
    billingAddress: { type: String },
    paymentMethod: { type: String },
    nextBillingDate: { type: Date },
    mrr: { type: Number, default: 0 }, // Monthly Recurring Revenue
    totalRevenue: { type: Number, default: 0 }
  },
  analytics: {
    monthlyActiveUsers: { type: Number, default: 0 },
    totalPageViews: { type: Number, default: 0 },
    averageSessionDuration: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    churnRate: { type: Number, default: 0 },
    nps: { type: Number, default: 0 } // Net Promoter Score
  },
  contact: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    jobTitle: { type: String },
    company: { type: String }
  },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

tenantSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Tenant = mongoose.model('Tenant', tenantSchema);
export default Tenant;