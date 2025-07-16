import Tenant from '../models/Tenant.js';
import TenantUser from '../models/TenantUser.js';
import WhiteLabelConfig from '../models/WhiteLabelConfig.js';

// Middleware to identify and load tenant
export const identifyTenant = async (req, res, next) => {
  try {
    let tenant = null;
    
    // Check for tenant from subdomain
    const host = req.get('host');
    if (host) {
      const subdomain = host.split('.')[0];
      
      // Skip tenant identification for main domain
      if (subdomain !== 'localhost' && subdomain !== 'simply-invest') {
        tenant = await Tenant.findOne({ subdomain, status: 'ACTIVE' });
      }
    }
    
    // Check for tenant from custom domain
    if (!tenant && host) {
      tenant = await Tenant.findOne({ domain: host, status: 'ACTIVE' });
    }
    
    // Check for tenant from header (for API requests)
    if (!tenant) {
      const tenantId = req.headers['x-tenant-id'];
      if (tenantId) {
        tenant = await Tenant.findOne({ id: tenantId, status: 'ACTIVE' });
      }
    }
    
    // Default tenant for development
    if (!tenant && process.env.NODE_ENV === 'development') {
      tenant = await Tenant.findOne({ subdomain: 'demo', status: 'ACTIVE' });
    }
    
    if (tenant) {
      req.tenant = tenant;
      
      // Load white-label configuration
      const whiteLabelConfig = await WhiteLabelConfig.findOne({ tenantId: tenant.id });
      req.whiteLabelConfig = whiteLabelConfig;
      
      // Check if tenant is in maintenance mode
      if (tenant.settings.maintenanceMode) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: tenant.settings.maintenanceMessage || 'The service is currently under maintenance.'
        });
      }
      
      // Check subscription status
      if (tenant.subscription.status !== 'ACTIVE') {
        return res.status(403).json({
          error: 'Subscription Inactive',
          message: 'Your subscription is not active. Please contact support.'
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Tenant identification error:', error);
    next(error);
  }
};

// Middleware to check tenant permissions
export const checkTenantPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.tenant) {
        return res.status(400).json({ error: 'Tenant not identified' });
      }
      
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Check if user belongs to the tenant
      const tenantUser = await TenantUser.findOne({
        tenantId: req.tenant.id,
        userId: req.user.id,
        status: 'ACTIVE'
      });
      
      if (!tenantUser) {
        return res.status(403).json({ error: 'Access denied to this tenant' });
      }
      
      // Check specific permission
      if (requiredPermission) {
        const [resource, action] = requiredPermission.split(':');
        const hasPermission = tenantUser.permissions.some(p => 
          p.resource === resource && p.actions.includes(action)
        ) || tenantUser.role === 'ADMIN';
        
        if (!hasPermission) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
      }
      
      req.tenantUser = tenantUser;
      next();
    } catch (error) {
      console.error('Tenant permission check error:', error);
      next(error);
    }
  };
};

// Middleware to enforce tenant feature availability
export const checkTenantFeature = (feature) => {
  return (req, res, next) => {
    if (!req.tenant) {
      return res.status(400).json({ error: 'Tenant not identified' });
    }
    
    if (!req.tenant.features[feature]) {
      return res.status(403).json({ 
        error: 'Feature not available', 
        message: `The ${feature} feature is not enabled for this tenant` 
      });
    }
    
    next();
  };
};

// Middleware to check user limits
export const checkUserLimit = async (req, res, next) => {
  try {
    if (!req.tenant) {
      return res.status(400).json({ error: 'Tenant not identified' });
    }
    
    const currentUsers = await TenantUser.countDocuments({
      tenantId: req.tenant.id,
      status: 'ACTIVE'
    });
    
    if (currentUsers >= req.tenant.subscription.maxUsers) {
      return res.status(403).json({ 
        error: 'User limit exceeded', 
        message: 'Maximum number of users reached for this subscription' 
      });
    }
    
    next();
  } catch (error) {
    console.error('User limit check error:', error);
    next(error);
  }
};

// Middleware to log tenant activity
export const logTenantActivity = (activity) => {
  return (req, res, next) => {
    if (req.tenant && req.user) {
      // Log activity (you might want to implement this with a logging service)
      console.log(`Tenant Activity: ${req.tenant.name} - User: ${req.user.email} - Action: ${activity}`);
    }
    next();
  };
};

// Middleware to add tenant context to responses
export const addTenantContext = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    if (req.tenant && req.whiteLabelConfig) {
      // Add tenant context to API responses
      const response = {
        ...data,
        _tenant: {
          id: req.tenant.id,
          name: req.tenant.name,
          branding: req.tenant.branding,
          theme: req.whiteLabelConfig.theme,
          features: req.tenant.features
        }
      };
      
      return originalJson.call(this, response);
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Middleware to validate tenant API keys
export const validateTenantAPIKey = (provider) => {
  return (req, res, next) => {
    if (!req.tenant) {
      return res.status(400).json({ error: 'Tenant not identified' });
    }
    
    const apiKey = req.tenant.apiKeys[provider];
    if (!apiKey || apiKey.startsWith('placeholder-')) {
      return res.status(400).json({ 
        error: 'API key not configured', 
        message: `${provider} API key is not configured for this tenant` 
      });
    }
    
    // Add API key to request for use in services
    req.apiKey = apiKey;
    next();
  };
};

// Middleware to check storage limits
export const checkStorageLimit = async (req, res, next) => {
  try {
    if (!req.tenant) {
      return res.status(400).json({ error: 'Tenant not identified' });
    }
    
    const { currentStorage, maxStorage } = req.tenant.subscription;
    
    if (currentStorage >= maxStorage) {
      return res.status(403).json({ 
        error: 'Storage limit exceeded', 
        message: 'Maximum storage capacity reached for this subscription' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Storage limit check error:', error);
    next(error);
  }
};

export default {
  identifyTenant,
  checkTenantPermission,
  checkTenantFeature,
  checkUserLimit,
  logTenantActivity,
  addTenantContext,
  validateTenantAPIKey,
  checkStorageLimit
};