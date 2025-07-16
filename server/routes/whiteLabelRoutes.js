import express from 'express';
import {
  getWhiteLabelConfig,
  updateWhiteLabelConfig,
  updateThemeConfig,
  updateBrandingConfig,
  updateComponentConfig,
  updateModuleConfig,
  updateCustomCSS,
  updateSEOConfig,
  getPublicConfig
} from '../controllers/whiteLabelController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/public/:domain', getPublicConfig);

// Protected routes (require authentication)
router.use(authMiddleware);

// White-label configuration
router.get('/:tenantId', getWhiteLabelConfig);
router.put('/:tenantId', updateWhiteLabelConfig);

// Specific configuration updates
router.put('/:tenantId/theme', updateThemeConfig);
router.put('/:tenantId/branding', updateBrandingConfig);
router.put('/:tenantId/components', updateComponentConfig);
router.put('/:tenantId/modules', updateModuleConfig);
router.put('/:tenantId/css', updateCustomCSS);
router.put('/:tenantId/seo', updateSEOConfig);

export default router;