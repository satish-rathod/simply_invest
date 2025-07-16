import express from 'express';
import {
  addUserToTenant,
  removeUserFromTenant,
  getTenantUsers,
  updateTenantUserRole,
  updateTenantUserStatus,
  getUserTenants,
  updateTenantUserPreferences,
  getTenantUserAnalytics
} from '../controllers/tenantUserController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes (require authentication)
router.use(authMiddleware);

// Tenant user management
router.post('/', addUserToTenant);
router.delete('/:tenantId/:userId', removeUserFromTenant);
router.get('/:tenantId/users', getTenantUsers);
router.put('/:tenantId/:userId/role', updateTenantUserRole);
router.put('/:tenantId/:userId/status', updateTenantUserStatus);
router.put('/:tenantId/:userId/preferences', updateTenantUserPreferences);

// User tenant memberships
router.get('/user/:userId', getUserTenants);

// Analytics
router.get('/:tenantId/analytics', getTenantUserAnalytics);

export default router;