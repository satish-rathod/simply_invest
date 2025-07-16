import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Bell, Shield, Palette } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <SettingsIcon className="w-6 h-6 text-blue-400" />
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-2 px-1 font-medium ${
            activeTab === 'profile'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-2 px-1 font-medium ${
            activeTab === 'notifications'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-2 px-1 font-medium ${
            activeTab === 'security'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Security
        </button>
      </div>

      {/* Settings Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-lg p-6"
      >
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Profile Settings</h2>
            </div>
            <div className="text-gray-400">
              Profile settings will be available soon. You can update your personal information,
              investment preferences, and account details here.
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Bell className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Notification Settings</h2>
            </div>
            <div className="text-gray-400">
              Notification settings will be available soon. You can configure email alerts,
              push notifications, and other communication preferences here.
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Security Settings</h2>
            </div>
            <div className="text-gray-400">
              Security settings will be available soon. You can update your password,
              enable two-factor authentication, and manage login sessions here.
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Settings;