import express from 'express';
import {
  createTenant,
  getAllTenants,
  getTenantById,
  getTenantByDomain,
  updateTenant,
  deleteTenant,
  updateTenantFeatures,
  updateTenantApiKeys,
  getTenantAnalytics,
  toggleMaintenanceMode
} from '../controllers/tenantController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/domain/:domain', getTenantByDomain);

// Protected routes (require authentication)
router.use(authMiddleware);

// Tenant CRUD operations
router.post('/', createTenant);
router.get('/', getAllTenants);
router.get('/:id', getTenantById);
router.put('/:id', updateTenant);
router.delete('/:id', deleteTenant);

// Tenant configuration updates
router.put('/:id/features', updateTenantFeatures);
router.put('/:id/api-keys', updateTenantApiKeys);
router.put('/:id/maintenance', toggleMaintenanceMode);

// Tenant analytics
router.get('/:id/analytics', getTenantAnalytics);

export default router;