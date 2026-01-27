'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useState } from 'react';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    apiEndpoint: 'https://api.construction-app.com',
    emailNotifications: true,
    smsAlerts: false,
    sessionTimeout: '30',
    twoFactorAuth: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 bg-slate-50 min-h-screen">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <Settings size={24} className="text-blue-600" />
              <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            </div>
            <p className="text-slate-600 mt-2">Configure system settings and preferences</p>
          </div>

          <div className="max-w-2xl">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">System Configuration</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">API Endpoint</label>
                  <input
                    type="text"
                    name="apiEndpoint"
                    value={settings.apiEndpoint}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Session Timeout (minutes)</label>
                  <select
                    name="sessionTimeout"
                    value={settings.sessionTimeout}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Notifications</h3>

                  <div className="space-y-4">
                    <label className="flex items-center gap-4 cursor-pointer">
                      <input
                        type="checkbox"
                        name="emailNotifications"
                        checked={settings.emailNotifications}
                        onChange={handleChange}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-700">Email Notifications</span>
                    </label>

                    <label className="flex items-center gap-4 cursor-pointer">
                      <input
                        type="checkbox"
                        name="smsAlerts"
                        checked={settings.smsAlerts}
                        onChange={handleChange}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-700">SMS Alerts</span>
                    </label>

                    <label className="flex items-center gap-4 cursor-pointer">
                      <input
                        type="checkbox"
                        name="twoFactorAuth"
                        checked={settings.twoFactorAuth}
                        onChange={handleChange}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-700">Two-Factor Authentication</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-slate-200">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                  >
                    Save Settings
                  </button>
                  <button className="flex-1 border border-slate-300 text-slate-700 font-semibold py-3 rounded-lg hover:bg-slate-50 transition">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
