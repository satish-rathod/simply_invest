import WhiteLabelConfig from '../models/WhiteLabelConfig.js';
import Tenant from '../models/Tenant.js';

// Get white-label configuration
export const getWhiteLabelConfig = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const config = await WhiteLabelConfig.findOne({ tenantId });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'White-label configuration not found'
      });
    }

    res.json({
      success: true,
      data: { config }
    });
  } catch (error) {
    console.error('Error fetching white-label config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch white-label configuration',
      error: error.message
    });
  }
};

// Update white-label configuration
export const updateWhiteLabelConfig = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const updateData = req.body;

    // Verify tenant exists
    const tenant = await Tenant.findOne({ id: tenantId });
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    // Remove sensitive fields
    delete updateData.tenantId;
    delete updateData.id;
    delete updateData.createdAt;

    const config = await WhiteLabelConfig.findOneAndUpdate(
      { tenantId },
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'White-label configuration not found'
      });
    }

    res.json({
      success: true,
      message: 'White-label configuration updated successfully',
      data: { config }
    });
  } catch (error) {
    console.error('Error updating white-label config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update white-label configuration',
      error: error.message
    });
  }
};

// Update theme configuration
export const updateThemeConfig = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { theme } = req.body;

    const config = await WhiteLabelConfig.findOneAndUpdate(
      { tenantId },
      { theme, updatedAt: Date.now() },
      { new: true }
    );

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'White-label configuration not found'
      });
    }

    res.json({
      success: true,
      message: 'Theme configuration updated successfully',
      data: { theme: config.theme }
    });
  } catch (error) {
    console.error('Error updating theme config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update theme configuration',
      error: error.message
    });
  }
};

// Update branding configuration
export const updateBrandingConfig = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { branding } = req.body;

    const config = await WhiteLabelConfig.findOneAndUpdate(
      { tenantId },
      { branding, updatedAt: Date.now() },
      { new: true }
    );

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'White-label configuration not found'
      });
    }

    res.json({
      success: true,
      message: 'Branding configuration updated successfully',
      data: { branding: config.branding }
    });
  } catch (error) {
    console.error('Error updating branding config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update branding configuration',
      error: error.message
    });
  }
};

// Update component configuration
export const updateComponentConfig = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { components } = req.body;

    const config = await WhiteLabelConfig.findOneAndUpdate(
      { tenantId },
      { components, updatedAt: Date.now() },
      { new: true }
    );

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'White-label configuration not found'
      });
    }

    res.json({
      success: true,
      message: 'Component configuration updated successfully',
      data: { components: config.components }
    });
  } catch (error) {
    console.error('Error updating component config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update component configuration',
      error: error.message
    });
  }
};

// Update module configuration
export const updateModuleConfig = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { modules } = req.body;

    const config = await WhiteLabelConfig.findOneAndUpdate(
      { tenantId },
      { modules, updatedAt: Date.now() },
      { new: true }
    );

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'White-label configuration not found'
      });
    }

    res.json({
      success: true,
      message: 'Module configuration updated successfully',
      data: { modules: config.modules }
    });
  } catch (error) {
    console.error('Error updating module config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update module configuration',
      error: error.message
    });
  }
};

// Update custom CSS
export const updateCustomCSS = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { customCSS } = req.body;

    const config = await WhiteLabelConfig.findOneAndUpdate(
      { tenantId },
      { customCSS, updatedAt: Date.now() },
      { new: true }
    );

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'White-label configuration not found'
      });
    }

    res.json({
      success: true,
      message: 'Custom CSS updated successfully',
      data: { customCSS: config.customCSS }
    });
  } catch (error) {
    console.error('Error updating custom CSS:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update custom CSS',
      error: error.message
    });
  }
};

// Update SEO configuration
export const updateSEOConfig = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { seo } = req.body;

    const config = await WhiteLabelConfig.findOneAndUpdate(
      { tenantId },
      { seo, updatedAt: Date.now() },
      { new: true }
    );

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'White-label configuration not found'
      });
    }

    res.json({
      success: true,
      message: 'SEO configuration updated successfully',
      data: { seo: config.seo }
    });
  } catch (error) {
    console.error('Error updating SEO config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update SEO configuration',
      error: error.message
    });
  }
};

// Get public configuration (for frontend)
export const getPublicConfig = async (req, res) => {
  try {
    const { domain } = req.params;

    // Find tenant by domain or subdomain
    const tenant = await Tenant.findOne({
      $or: [{ domain }, { subdomain: domain }]
    }).select('id name status settings features');

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    if (tenant.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Tenant is not active'
      });
    }

    // Get white-label configuration
    const config = await WhiteLabelConfig.findOne({ tenantId: tenant.id });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'White-label configuration not found'
      });
    }

    // Return only public configuration
    const publicConfig = {
      tenant: {
        id: tenant.id,
        name: tenant.name,
        features: tenant.features,
        settings: {
          defaultLanguage: tenant.settings.defaultLanguage,
          defaultCurrency: tenant.settings.defaultCurrency,
          defaultTimezone: tenant.settings.defaultTimezone,
          allowRegistration: tenant.settings.allowRegistration,
          allowSocialLogin: tenant.settings.allowSocialLogin,
          maintenanceMode: tenant.settings.maintenanceMode,
          maintenanceMessage: tenant.settings.maintenanceMessage
        }
      },
      theme: config.theme,
      typography: config.typography,
      branding: config.branding,
      layout: config.layout,
      components: config.components,
      features: config.features,
      modules: config.modules,
      customCSS: config.customCSS,
      seo: config.seo
    };

    res.json({
      success: true,
      data: publicConfig
    });
  } catch (error) {
    console.error('Error fetching public config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch public configuration',
      error: error.message
    });
  }
};