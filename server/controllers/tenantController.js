import Tenant from '../models/Tenant.js';
import WhiteLabelConfig from '../models/WhiteLabelConfig.js';
import TenantUser from '../models/TenantUser.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Create a new tenant
export const createTenant = async (req, res) => {
  try {
    const {
      name,
      domain,
      subdomain,
      branding,
      contact,
      subscription = {},
      features = {},
      settings = {}
    } = req.body;

    // Check if domain or subdomain already exists
    const existingTenant = await Tenant.findOne({
      $or: [{ domain }, { subdomain }]
    });

    if (existingTenant) {
      return res.status(400).json({
        success: false,
        message: 'Domain or subdomain already exists'
      });
    }

    // Create tenant
    const tenant = new Tenant({
      name,
      domain,
      subdomain,
      branding,
      contact,
      subscription: {
        ...subscription,
        plan: subscription.plan || 'STARTER'
      },
      features: {
        portfolio: true,
        alerts: true,
        social: true,
        education: true,
        trading: false,
        backtesting: false,
        analytics: true,
        ai: true,
        news: true,
        watchlists: true,
        ...features
      },
      settings: {
        defaultLanguage: 'en',
        defaultCurrency: 'USD',
        defaultTimezone: 'UTC',
        allowRegistration: true,
        requireEmailVerification: false,
        allowSocialLogin: true,
        maintenanceMode: false,
        ...settings
      }
    });

    await tenant.save();

    // Create default white-label configuration
    const whiteLabelConfig = new WhiteLabelConfig({
      tenantId: tenant.id,
      branding: {
        appName: name,
        ...branding
      }
    });

    await whiteLabelConfig.save();

    res.status(201).json({
      success: true,
      message: 'Tenant created successfully',
      data: {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          domain: tenant.domain,
          subdomain: tenant.subdomain,
          status: tenant.status,
          createdAt: tenant.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tenant',
      error: error.message
    });
  }
};

// Get all tenants (admin only)
export const getAllTenants = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, plan } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status) filter.status = status;
    if (plan) filter['subscription.plan'] = plan;

    const tenants = await Tenant.find(filter)
      .select('-apiKeys -billing.stripeCustomerId -billing.stripeSubscriptionId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Tenant.countDocuments(filter);

    res.json({
      success: true,
      data: {
        tenants,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tenants',
      error: error.message
    });
  }
};

// Get tenant by ID
export const getTenantById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tenant = await Tenant.findOne({ id })
      .select('-apiKeys -billing.stripeCustomerId -billing.stripeSubscriptionId');

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    res.json({
      success: true,
      data: { tenant }
    });
  } catch (error) {
    console.error('Error fetching tenant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tenant',
      error: error.message
    });
  }
};

// Get tenant by domain or subdomain
export const getTenantByDomain = async (req, res) => {
  try {
    const { domain } = req.params;
    
    const tenant = await Tenant.findOne({
      $or: [{ domain }, { subdomain: domain }]
    }).select('-apiKeys -billing.stripeCustomerId -billing.stripeSubscriptionId');

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    // Get white-label configuration
    const whiteLabelConfig = await WhiteLabelConfig.findOne({
      tenantId: tenant.id
    });

    res.json({
      success: true,
      data: { 
        tenant,
        whiteLabelConfig
      }
    });
  } catch (error) {
    console.error('Error fetching tenant by domain:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tenant',
      error: error.message
    });
  }
};

// Update tenant
export const updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove sensitive fields from direct update
    delete updateData.apiKeys;
    delete updateData.billing;
    delete updateData.id;
    delete updateData.createdAt;

    const tenant = await Tenant.findOneAndUpdate(
      { id },
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-apiKeys -billing.stripeCustomerId -billing.stripeSubscriptionId');

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    res.json({
      success: true,
      message: 'Tenant updated successfully',
      data: { tenant }
    });
  } catch (error) {
    console.error('Error updating tenant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tenant',
      error: error.message
    });
  }
};

// Delete tenant
export const deleteTenant = async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await Tenant.findOneAndDelete({ id });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    // Delete associated white-label configuration
    await WhiteLabelConfig.deleteOne({ tenantId: id });
    
    // Delete associated tenant users
    await TenantUser.deleteMany({ tenantId: id });

    res.json({
      success: true,
      message: 'Tenant deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete tenant',
      error: error.message
    });
  }
};

// Update tenant features
export const updateTenantFeatures = async (req, res) => {
  try {
    const { id } = req.params;
    const { features } = req.body;

    const tenant = await Tenant.findOneAndUpdate(
      { id },
      { features, updatedAt: Date.now() },
      { new: true }
    ).select('id name features');

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    res.json({
      success: true,
      message: 'Tenant features updated successfully',
      data: { tenant }
    });
  } catch (error) {
    console.error('Error updating tenant features:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tenant features',
      error: error.message
    });
  }
};

// Update tenant API keys (admin only)
export const updateTenantApiKeys = async (req, res) => {
  try {
    const { id } = req.params;
    const { apiKeys } = req.body;

    const tenant = await Tenant.findOneAndUpdate(
      { id },
      { apiKeys, updatedAt: Date.now() },
      { new: true }
    ).select('id name apiKeys');

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    res.json({
      success: true,
      message: 'Tenant API keys updated successfully',
      data: { tenant }
    });
  } catch (error) {
    console.error('Error updating tenant API keys:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tenant API keys',
      error: error.message
    });
  }
};

// Get tenant analytics
export const getTenantAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await Tenant.findOne({ id })
      .select('id name analytics subscription');

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    // Get user count
    const userCount = await TenantUser.countDocuments({ 
      tenantId: id, 
      status: 'ACTIVE' 
    });

    // Update current user count
    await Tenant.findOneAndUpdate(
      { id },
      { 'subscription.currentUsers': userCount }
    );

    res.json({
      success: true,
      data: {
        analytics: tenant.analytics,
        subscription: tenant.subscription,
        userCount
      }
    });
  } catch (error) {
    console.error('Error fetching tenant analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tenant analytics',
      error: error.message
    });
  }
};

// Toggle tenant maintenance mode
export const toggleMaintenanceMode = async (req, res) => {
  try {
    const { id } = req.params;
    const { maintenanceMode, maintenanceMessage } = req.body;

    const tenant = await Tenant.findOneAndUpdate(
      { id },
      { 
        'settings.maintenanceMode': maintenanceMode,
        'settings.maintenanceMessage': maintenanceMessage || '',
        updatedAt: Date.now()
      },
      { new: true }
    ).select('id name settings.maintenanceMode settings.maintenanceMessage');

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    res.json({
      success: true,
      message: `Maintenance mode ${maintenanceMode ? 'enabled' : 'disabled'} successfully`,
      data: { tenant }
    });
  } catch (error) {
    console.error('Error toggling maintenance mode:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle maintenance mode',
      error: error.message
    });
  }
};