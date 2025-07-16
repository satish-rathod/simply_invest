import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiRefreshCw, FiEye, FiCode, FiPalette, FiLayout, FiSettings } from 'react-icons/fi';

const WhiteLabelConfig = ({ tenantId, user }) => {
  const [activeTab, setActiveTab] = useState('theme');
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (tenantId) {
      fetchConfig();
    }
  }, [tenantId]);

  const fetchConfig = async () => {
    try {
      const response = await fetch(`/api/white-label/${tenantId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setConfig(data.data.config);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section, sectionData) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/white-label/${tenantId}/${section}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ [section]: sectionData })
      });
      const data = await response.json();
      if (data.success) {
        setConfig(prev => ({ ...prev, [section]: sectionData }));
        // Show success message
      }
    } catch (error) {
      console.error('Error saving config:', error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'theme', label: 'Theme', icon: FiPalette },
    { id: 'branding', label: 'Branding', icon: FiLayout },
    { id: 'components', label: 'Components', icon: FiSettings },
    { id: 'modules', label: 'Modules', icon: FiCode },
    { id: 'seo', label: 'SEO', icon: FiEye }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-400">No configuration found for this tenant</p>
          <button
            onClick={fetchConfig}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <FiRefreshCw className="w-4 h-4 inline mr-2" />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">White Label Configuration</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              <FiEye className="w-4 h-4" />
              <span>{previewMode ? 'Edit Mode' : 'Preview Mode'}</span>
            </button>
          </div>
        </div>

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

        {activeTab === 'theme' && (
          <ThemeConfiguration
            theme={config.theme}
            onSave={(theme) => handleSave('theme', theme)}
            saving={saving}
          />
        )}

        {activeTab === 'branding' && (
          <BrandingConfiguration
            branding={config.branding}
            onSave={(branding) => handleSave('branding', branding)}
            saving={saving}
          />
        )}

        {activeTab === 'components' && (
          <ComponentConfiguration
            components={config.components}
            onSave={(components) => handleSave('components', components)}
            saving={saving}
          />
        )}

        {activeTab === 'modules' && (
          <ModuleConfiguration
            modules={config.modules}
            onSave={(modules) => handleSave('modules', modules)}
            saving={saving}
          />
        )}

        {activeTab === 'seo' && (
          <SEOConfiguration
            seo={config.seo}
            onSave={(seo) => handleSave('seo', seo)}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
};

// Theme Configuration Component
const ThemeConfiguration = ({ theme, onSave, saving }) => {
  const [formData, setFormData] = useState(theme);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <h2 className="text-xl font-semibold mb-6">Theme Configuration</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-2 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-12 h-10 rounded border border-gray-600 bg-gray-700"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            <FiSave className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Theme'}</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
};

// Branding Configuration Component
const BrandingConfiguration = ({ branding, onSave, saving }) => {
  const [formData, setFormData] = useState(branding);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <h2 className="text-xl font-semibold mb-6">Branding Configuration</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">App Name</label>
            <input
              type="text"
              value={formData.appName}
              onChange={(e) => setFormData(prev => ({ ...prev, appName: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tagline</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Logo URL</label>
            <input
              type="url"
              value={formData.logo}
              onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Favicon URL</label>
            <input
              type="url"
              value={formData.favicon}
              onChange={(e) => setFormData(prev => ({ ...prev, favicon: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            <FiSave className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Branding'}</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
};

// Component Configuration Component
const ComponentConfiguration = ({ components, onSave, saving }) => {
  const [formData, setFormData] = useState(components);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <h2 className="text-xl font-semibold mb-6">Component Configuration</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {Object.entries(formData).map(([componentKey, componentValue]) => (
            <div key={componentKey} className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4 capitalize">{componentKey}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(componentValue).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-2 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    {typeof value === 'boolean' ? (
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            [componentKey]: {
                              ...prev[componentKey],
                              [key]: e.target.checked
                            }
                          }))}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm">Enable {key}</span>
                      </label>
                    ) : (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          [componentKey]: {
                            ...prev[componentKey],
                            [key]: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            <FiSave className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Components'}</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
};

// Module Configuration Component
const ModuleConfiguration = ({ modules, onSave, saving }) => {
  const [formData, setFormData] = useState(modules);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <h2 className="text-xl font-semibold mb-6">Module Configuration</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key} className="bg-gray-700 rounded-lg p-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </label>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            <FiSave className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Modules'}</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
};

// SEO Configuration Component
const SEOConfiguration = ({ seo, onSave, saving }) => {
  const [formData, setFormData] = useState(seo);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <h2 className="text-xl font-semibold mb-6">SEO Configuration</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Author</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Keywords</label>
          <input
            type="text"
            value={formData.keywords}
            onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="keyword1, keyword2, keyword3"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            <FiSave className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save SEO'}</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default WhiteLabelConfig;