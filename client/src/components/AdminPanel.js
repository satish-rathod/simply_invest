import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiSettings, FiUsers, FiBarChart3, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const AdminPanel = ({ user }) => {
  const [activeTab, setActiveTab] = useState('tenants');
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await fetch('/api/tenants', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTenants(data.data.tenants);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async (tenantData) => {
    try {
      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(tenantData)
      });
      const data = await response.json();
      if (data.success) {
        fetchTenants();
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating tenant:', error);
    }
  };

  const handleDeleteTenant = async (tenantId) => {
    if (window.confirm('Are you sure you want to delete this tenant?')) {
      try {
        const response = await fetch(`/api/tenants/${tenantId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data.success) {
          fetchTenants();
        }
      } catch (error) {
        console.error('Error deleting tenant:', error);
      }
    }
  };

  const handleToggleMaintenanceMode = async (tenantId, currentMode) => {
    try {
      const response = await fetch(`/api/tenants/${tenantId}/maintenance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ maintenanceMode: !currentMode })
      });
      const data = await response.json();
      if (data.success) {
        fetchTenants();
      }
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
    }
  };

  const tabs = [
    { id: 'tenants', label: 'Tenants', icon: FiUsers },
    { id: 'analytics', label: 'Analytics', icon: FiBarChart3 },
    { id: 'settings', label: 'Settings', icon: FiSettings }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">Welcome, {user?.name}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'tenants' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Tenant Management</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                <span>Create Tenant</span>
              </button>
            </div>

            <div className="grid gap-4">
              {tenants.map((tenant) => (
                <motion.div
                  key={tenant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <h3 className="text-lg font-semibold">{tenant.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${
                          tenant.status === 'ACTIVE' ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                          {tenant.status}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          tenant.subscription.plan === 'ENTERPRISE' ? 'bg-purple-600' :
                          tenant.subscription.plan === 'PROFESSIONAL' ? 'bg-blue-600' : 'bg-gray-600'
                        }`}>
                          {tenant.subscription.plan}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-400">
                        <p>Domain: {tenant.domain}</p>
                        <p>Subdomain: {tenant.subdomain}</p>
                        <p>Users: {tenant.subscription.currentUsers} / {tenant.subscription.maxUsers}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleMaintenanceMode(tenant.id, tenant.settings.maintenanceMode)}
                        className={`p-2 rounded-lg transition-colors ${
                          tenant.settings.maintenanceMode ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                        }`}
                        title={tenant.settings.maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
                      >
                        {tenant.settings.maintenanceMode ? <FiToggleRight className="w-4 h-4" /> : <FiToggleLeft className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTenant(tenant);
                          setShowEditModal(true);
                        }}
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        title="Edit Tenant"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTenant(tenant.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                        title="Delete Tenant"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">System Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Total Tenants</h3>
                <p className="text-3xl font-bold text-blue-400">{tenants.length}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Active Tenants</h3>
                <p className="text-3xl font-bold text-green-400">
                  {tenants.filter(t => t.status === 'ACTIVE').length}
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Total Users</h3>
                <p className="text-3xl font-bold text-purple-400">
                  {tenants.reduce((sum, t) => sum + t.subscription.currentUsers, 0)}
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Maintenance Mode</h3>
                <p className="text-3xl font-bold text-red-400">
                  {tenants.filter(t => t.settings.maintenanceMode).length}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">System Settings</h2>
            <div className="bg-gray-800 rounded-lg p-6">
              <p className="text-gray-400">System settings will be implemented here.</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Tenant Modal */}
      {showCreateModal && (
        <CreateTenantModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTenant}
        />
      )}

      {/* Edit Tenant Modal */}
      {showEditModal && selectedTenant && (
        <EditTenantModal
          tenant={selectedTenant}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTenant(null);
          }}
          onSubmit={(data) => {
            // Handle update logic here
            setShowEditModal(false);
            setSelectedTenant(null);
            fetchTenants();
          }}
        />
      )}
    </div>
  );
};

// Create Tenant Modal Component
const CreateTenantModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    subdomain: '',
    contact: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: ''
    },
    branding: {
      companyName: '',
      tagline: '',
      description: ''
    },
    subscription: {
      plan: 'STARTER'
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Create New Tenant</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tenant Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Domain</label>
              <input
                type="text"
                value={formData.domain}
                onChange={(e) => setFormData({...formData, domain: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subdomain</label>
              <input
                type="text"
                value={formData.subdomain}
                onChange={(e) => setFormData({...formData, subdomain: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subscription Plan</label>
              <select
                value={formData.subscription.plan}
                onChange={(e) => setFormData({
                  ...formData,
                  subscription: {...formData.subscription, plan: e.target.value}
                })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="STARTER">Starter</option>
                <option value="PROFESSIONAL">Professional</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Contact First Name</label>
              <input
                type="text"
                value={formData.contact.firstName}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: {...formData.contact, firstName: e.target.value}
                })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Last Name</label>
              <input
                type="text"
                value={formData.contact.lastName}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: {...formData.contact, lastName: e.target.value}
                })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.contact.email}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: {...formData.contact, email: e.target.value}
                })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <input
                type="text"
                value={formData.branding.companyName}
                onChange={(e) => setFormData({
                  ...formData,
                  branding: {...formData.branding, companyName: e.target.value}
                })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Create Tenant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Tenant Modal Component
const EditTenantModal = ({ tenant, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: tenant.name || '',
    domain: tenant.domain || '',
    subdomain: tenant.subdomain || '',
    status: tenant.status || 'ACTIVE',
    subscription: {
      plan: tenant.subscription?.plan || 'STARTER',
      maxUsers: tenant.subscription?.maxUsers || 100
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Edit Tenant</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tenant Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subscription Plan</label>
              <select
                value={formData.subscription.plan}
                onChange={(e) => setFormData({
                  ...formData,
                  subscription: {...formData.subscription, plan: e.target.value}
                })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="STARTER">Starter</option>
                <option value="PROFESSIONAL">Professional</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Users</label>
              <input
                type="number"
                value={formData.subscription.maxUsers}
                onChange={(e) => setFormData({
                  ...formData,
                  subscription: {...formData.subscription, maxUsers: parseInt(e.target.value)}
                })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Update Tenant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;