import TenantUser from '../models/TenantUser.js';
import Tenant from '../models/Tenant.js';
import User from '../models/User.js';

// Add user to tenant
export const addUserToTenant = async (req, res) => {
  try {
    const { tenantId, userId, role = 'USER', permissions = [] } = req.body;

    // Verify tenant exists
    const tenant = await Tenant.findOne({ id: tenantId });
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already in tenant
    const existingTenantUser = await TenantUser.findOne({ tenantId, userId });
    if (existingTenantUser) {
      return res.status(400).json({
        success: false,
        message: 'User is already in this tenant'
      });
    }

    // Check tenant user limit
    const userCount = await TenantUser.countDocuments({ 
      tenantId, 
      status: 'ACTIVE' 
    });

    if (userCount >= tenant.subscription.maxUsers) {
      return res.status(400).json({
        success: false,
        message: 'Tenant user limit reached'
      });
    }

    // Create tenant user
    const tenantUser = new TenantUser({
      tenantId,
      userId,
      role,
      permissions,
      invitedBy: req.user?.id
    });

    await tenantUser.save();

    // Update tenant current user count
    await Tenant.findOneAndUpdate(
      { id: tenantId },
      { 'subscription.currentUsers': userCount + 1 }
    );

    res.status(201).json({
      success: true,
      message: 'User added to tenant successfully',
      data: { tenantUser }
    });
  } catch (error) {
    console.error('Error adding user to tenant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add user to tenant',
      error: error.message
    });
  }
};

// Remove user from tenant
export const removeUserFromTenant = async (req, res) => {
  try {
    const { tenantId, userId } = req.params;

    const tenantUser = await TenantUser.findOneAndDelete({ tenantId, userId });

    if (!tenantUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found in tenant'
      });
    }

    // Update tenant current user count
    const userCount = await TenantUser.countDocuments({ 
      tenantId, 
      status: 'ACTIVE' 
    });

    await Tenant.findOneAndUpdate(
      { id: tenantId },
      { 'subscription.currentUsers': userCount }
    );

    res.json({
      success: true,
      message: 'User removed from tenant successfully'
    });
  } catch (error) {
    console.error('Error removing user from tenant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove user from tenant',
      error: error.message
    });
  }
};

// Get tenant users
export const getTenantUsers = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { page = 1, limit = 10, role, status } = req.query;
    const skip = (page - 1) * limit;

    let filter = { tenantId };
    if (role) filter.role = role;
    if (status) filter.status = status;

    const tenantUsers = await TenantUser.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TenantUser.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users: tenantUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching tenant users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tenant users',
      error: error.message
    });
  }
};

// Update tenant user role
export const updateTenantUserRole = async (req, res) => {
  try {
    const { tenantId, userId } = req.params;
    const { role, permissions } = req.body;

    const tenantUser = await TenantUser.findOneAndUpdate(
      { tenantId, userId },
      { role, permissions, updatedAt: Date.now() },
      { new: true }
    ).populate('userId', 'name email');

    if (!tenantUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found in tenant'
      });
    }

    res.json({
      success: true,
      message: 'Tenant user role updated successfully',
      data: { tenantUser }
    });
  } catch (error) {
    console.error('Error updating tenant user role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tenant user role',
      error: error.message
    });
  }
};

// Update tenant user status
export const updateTenantUserStatus = async (req, res) => {
  try {
    const { tenantId, userId } = req.params;
    const { status } = req.body;

    const tenantUser = await TenantUser.findOneAndUpdate(
      { tenantId, userId },
      { status, updatedAt: Date.now() },
      { new: true }
    ).populate('userId', 'name email');

    if (!tenantUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found in tenant'
      });
    }

    // Update tenant current user count
    const activeUserCount = await TenantUser.countDocuments({ 
      tenantId, 
      status: 'ACTIVE' 
    });

    await Tenant.findOneAndUpdate(
      { id: tenantId },
      { 'subscription.currentUsers': activeUserCount }
    );

    res.json({
      success: true,
      message: 'Tenant user status updated successfully',
      data: { tenantUser }
    });
  } catch (error) {
    console.error('Error updating tenant user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tenant user status',
      error: error.message
    });
  }
};

// Get user's tenant memberships
export const getUserTenants = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    let filter = { userId };
    if (status) filter.status = status;

    const tenantUsers = await TenantUser.find(filter)
      .populate({
        path: 'tenantId',
        select: 'name domain subdomain status branding.companyName',
        model: 'Tenant',
        match: { status: 'ACTIVE' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter out null tenant references
    const validTenantUsers = tenantUsers.filter(tu => tu.tenantId);

    const total = await TenantUser.countDocuments(filter);

    res.json({
      success: true,
      data: {
        tenants: validTenantUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user tenants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user tenants',
      error: error.message
    });
  }
};

// Update tenant user preferences
export const updateTenantUserPreferences = async (req, res) => {
  try {
    const { tenantId, userId } = req.params;
    const { preferences } = req.body;

    const tenantUser = await TenantUser.findOneAndUpdate(
      { tenantId, userId },
      { preferences, updatedAt: Date.now() },
      { new: true }
    );

    if (!tenantUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found in tenant'
      });
    }

    res.json({
      success: true,
      message: 'Tenant user preferences updated successfully',
      data: { preferences: tenantUser.preferences }
    });
  } catch (error) {
    console.error('Error updating tenant user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tenant user preferences',
      error: error.message
    });
  }
};

// Get tenant user analytics
export const getTenantUserAnalytics = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { period = '30d' } = req.query;

    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case '30d':
        dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
        break;
      case '90d':
        dateFilter = { createdAt: { $gte: new Date(now - 90 * 24 * 60 * 60 * 1000) } };
        break;
      default:
        dateFilter = {};
    }

    const analytics = await TenantUser.aggregate([
      { $match: { tenantId, ...dateFilter } },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] } },
          inactiveUsers: { $sum: { $cond: [{ $eq: ['$status', 'INACTIVE'] }, 1, 0] } },
          suspendedUsers: { $sum: { $cond: [{ $eq: ['$status', 'SUSPENDED'] }, 1, 0] } },
          adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'ADMIN'] }, 1, 0] } },
          moderatorUsers: { $sum: { $cond: [{ $eq: ['$role', 'MODERATOR'] }, 1, 0] } },
          regularUsers: { $sum: { $cond: [{ $eq: ['$role', 'USER'] }, 1, 0] } },
          avgSessionDuration: { $avg: '$usage.sessionDuration' },
          totalPageViews: { $sum: '$usage.pageViews' },
          totalApiCalls: { $sum: '$usage.apiCalls' },
          totalStorageUsed: { $sum: '$usage.storageUsed' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        analytics: analytics[0] || {
          totalUsers: 0,
          activeUsers: 0,
          inactiveUsers: 0,
          suspendedUsers: 0,
          adminUsers: 0,
          moderatorUsers: 0,
          regularUsers: 0,
          avgSessionDuration: 0,
          totalPageViews: 0,
          totalApiCalls: 0,
          totalStorageUsed: 0
        },
        period
      }
    });
  } catch (error) {
    console.error('Error fetching tenant user analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tenant user analytics',
      error: error.message
    });
  }
};