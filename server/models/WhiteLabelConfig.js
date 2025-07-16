import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const whiteLabelConfigSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  tenantId: { type: String, required: true, ref: 'Tenant', unique: true },
  theme: {
    primary: { type: String, default: '#3b82f6' },
    secondary: { type: String, default: '#64748b' },
    accent: { type: String, default: '#10b981' },
    background: { type: String, default: '#0f172a' },
    surface: { type: String, default: '#1e293b' },
    text: { type: String, default: '#f8fafc' },
    textSecondary: { type: String, default: '#cbd5e1' },
    border: { type: String, default: '#334155' },
    success: { type: String, default: '#10b981' },
    warning: { type: String, default: '#f59e0b' },
    error: { type: String, default: '#ef4444' },
    info: { type: String, default: '#3b82f6' }
  },
  typography: {
    fontFamily: { type: String, default: 'Inter, sans-serif' },
    headingFont: { type: String, default: 'Inter, sans-serif' },
    bodyFont: { type: String, default: 'Inter, sans-serif' },
    monoFont: { type: String, default: 'Monaco, monospace' },
    fontSize: {
      xs: { type: String, default: '0.75rem' },
      sm: { type: String, default: '0.875rem' },
      base: { type: String, default: '1rem' },
      lg: { type: String, default: '1.125rem' },
      xl: { type: String, default: '1.25rem' },
      '2xl': { type: String, default: '1.5rem' },
      '3xl': { type: String, default: '1.875rem' },
      '4xl': { type: String, default: '2.25rem' }
    }
  },
  branding: {
    logo: { type: String },
    logoLight: { type: String },
    logoDark: { type: String },
    favicon: { type: String },
    appName: { type: String, default: 'Simply Invest' },
    tagline: { type: String },
    description: { type: String },
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: String },
    ogImage: { type: String }
  },
  layout: {
    sidebarWidth: { type: String, default: '16rem' },
    headerHeight: { type: String, default: '4rem' },
    containerMaxWidth: { type: String, default: '1200px' },
    borderRadius: { type: String, default: '0.5rem' },
    boxShadow: { type: String, default: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }
  },
  components: {
    navbar: {
      background: { type: String, default: '#1e293b' },
      text: { type: String, default: '#f8fafc' },
      height: { type: String, default: '4rem' },
      showLogo: { type: Boolean, default: true },
      showSearch: { type: Boolean, default: true },
      showNotifications: { type: Boolean, default: true },
      showProfile: { type: Boolean, default: true }
    },
    sidebar: {
      background: { type: String, default: '#0f172a' },
      text: { type: String, default: '#f8fafc' },
      width: { type: String, default: '16rem' },
      showIcons: { type: Boolean, default: true },
      collapsible: { type: Boolean, default: true }
    },
    buttons: {
      primary: { type: String, default: '#3b82f6' },
      secondary: { type: String, default: '#64748b' },
      success: { type: String, default: '#10b981' },
      danger: { type: String, default: '#ef4444' },
      borderRadius: { type: String, default: '0.5rem' },
      padding: { type: String, default: '0.5rem 1rem' }
    },
    cards: {
      background: { type: String, default: '#1e293b' },
      border: { type: String, default: '#334155' },
      borderRadius: { type: String, default: '0.5rem' },
      padding: { type: String, default: '1.5rem' },
      shadow: { type: String, default: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }
    },
    forms: {
      inputBackground: { type: String, default: '#374151' },
      inputBorder: { type: String, default: '#4b5563' },
      inputText: { type: String, default: '#f9fafb' },
      inputFocus: { type: String, default: '#3b82f6' },
      labelText: { type: String, default: '#d1d5db' },
      borderRadius: { type: String, default: '0.375rem' },
      padding: { type: String, default: '0.5rem 0.75rem' }
    }
  },
  customCSS: { type: String },
  customJS: { type: String },
  customHTML: {
    head: { type: String },
    bodyStart: { type: String },
    bodyEnd: { type: String }
  },
  integrations: {
    googleAnalytics: { type: String },
    googleTagManager: { type: String },
    facebookPixel: { type: String },
    hotjar: { type: String },
    intercom: { type: String },
    zendesk: { type: String },
    crisp: { type: String },
    custom: [{ 
      name: { type: String },
      code: { type: String },
      position: { type: String, enum: ['head', 'body-start', 'body-end'] }
    }]
  },
  seo: {
    title: { type: String },
    description: { type: String },
    keywords: { type: String },
    author: { type: String },
    robots: { type: String, default: 'index, follow' },
    canonical: { type: String },
    ogTitle: { type: String },
    ogDescription: { type: String },
    ogImage: { type: String },
    ogType: { type: String, default: 'website' },
    twitterCard: { type: String, default: 'summary_large_image' },
    twitterSite: { type: String },
    twitterCreator: { type: String }
  },
  features: {
    darkMode: { type: Boolean, default: true },
    animations: { type: Boolean, default: true },
    soundEffects: { type: Boolean, default: false },
    keyboardShortcuts: { type: Boolean, default: true },
    offlineMode: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    multiLanguage: { type: Boolean, default: true },
    rtlSupport: { type: Boolean, default: false },
    accessibility: { type: Boolean, default: true },
    autoSave: { type: Boolean, default: true }
  },
  modules: {
    dashboard: { type: Boolean, default: true },
    portfolio: { type: Boolean, default: true },
    alerts: { type: Boolean, default: true },
    social: { type: Boolean, default: true },
    education: { type: Boolean, default: true },
    trading: { type: Boolean, default: false },
    backtesting: { type: Boolean, default: false },
    analytics: { type: Boolean, default: true },
    ai: { type: Boolean, default: true },
    news: { type: Boolean, default: true },
    watchlists: { type: Boolean, default: true },
    settings: { type: Boolean, default: true }
  },
  urls: {
    privacyPolicy: { type: String },
    termsOfService: { type: String },
    support: { type: String },
    documentation: { type: String },
    blog: { type: String },
    contact: { type: String }
  },
  emailTemplates: {
    welcome: { type: String },
    passwordReset: { type: String },
    emailVerification: { type: String },
    priceAlert: { type: String },
    portfolioSummary: { type: String },
    marketUpdate: { type: String }
  },
  isActive: { type: Boolean, default: true },
  version: { type: String, default: '1.0.0' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

whiteLabelConfigSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const WhiteLabelConfig = mongoose.model('WhiteLabelConfig', whiteLabelConfigSchema);
export default WhiteLabelConfig;