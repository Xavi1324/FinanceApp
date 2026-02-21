import { useState } from 'react';
import { DollarSign, Moon, Sun, RotateCcw, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Settings() {
  const { settings, updateSettings, resetAllData } = useApp();
  const [currency, setCurrency] = useState(settings.currency);
  const [darkMode, setDarkMode] = useState(settings.darkMode);
  const [defaultIncome, setDefaultIncome] = useState(settings.defaultWeeklyIncome.toString());

  const handleSave = () => {
    updateSettings({
      currency,
      darkMode,
      defaultWeeklyIncome: parseFloat(defaultIncome) || 500
    });
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      resetAllData();
      alert('All data has been reset to default values.');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Settings
        </h1>
        <p className="text-gray-500">Manage your application preferences</p>
      </div>

      <div className="max-w-2xl">
        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Currency Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Currency</h3>
                <p className="text-sm text-gray-500">Select your preferred currency</p>
              </div>
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
            </select>
          </div>

          {/* Appearance Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                {darkMode ? <Moon className="w-5 h-5 text-purple-600" /> : <Sun className="w-5 h-5 text-purple-600" />}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Appearance</h3>
                <p className="text-sm text-gray-500">Customize the look and feel</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Dark Mode</p>
                <p className="text-sm text-gray-500">Enable dark mode theme</p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {darkMode && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Dark mode is currently in development and will be available in a future update.
                </p>
              </div>
            )}
          </div>

          {/* Default Income Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Default Weekly Income</h3>
                <p className="text-sm text-gray-500">Set the default income for new weeks</p>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={defaultIncome}
                onChange={(e) => setDefaultIncome(e.target.value)}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="500.00"
              />
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
                <p className="text-sm text-gray-500">Reset or export your data</p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleReset}
                className="w-full px-4 py-3 border-2 border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
              >
                Reset All Data
              </button>
              <p className="text-xs text-gray-500">
                This will delete all weeks, expenses, and restore default settings. This action cannot be undone.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
            >
              <Save className="w-5 h-5" />
              Save Settings
            </button>
            <button
              onClick={() => {
                setCurrency(settings.currency);
                setDarkMode(settings.darkMode);
                setDefaultIncome(settings.defaultWeeklyIncome.toString());
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">About FinanceApp</h4>
          <p className="text-sm text-gray-600 mb-3">
            Version 1.0.0 - A modern personal finance tracking application built for simplicity and efficiency.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>© 2026 FinanceApp</span>
            <span>•</span>
            <a href="#" className="hover:text-blue-600">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-blue-600">Terms of Service</a>
          </div>
        </div>
      </div>
    </div>
  );
}
