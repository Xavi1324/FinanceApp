import { useState } from 'react';
import { useBlocker } from 'react-router';
import { DollarSign, Moon, Sun, RotateCcw, Save, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Settings() {
  const { settings, updateSettings, resetAllData } = useApp();
  const [currency, setCurrency] = useState(settings.currency);
  const [defaultIncome, setDefaultIncome] = useState(settings.defaultWeeklyIncome.toString());

  const hasUnsavedChanges =
    currency !== settings.currency ||
    parseFloat(defaultIncome) !== settings.defaultWeeklyIncome;

  const blocker = useBlocker(hasUnsavedChanges);

  const handleSave = () => {
    updateSettings({
      currency,
      defaultWeeklyIncome: parseFloat(defaultIncome) || 500,
    });
  };

  const handleSaveAndProceed = () => {
    handleSave();
    blocker.proceed?.();
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      resetAllData();
      alert('All data has been reset to default values.');
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl">
      {/* Unsaved changes blocker modal */}
      {blocker.state === 'blocked' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => blocker.reset?.()}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">
              Unsaved changes
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
              You have unsaved changes in Settings. What do you want to do?
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleSaveAndProceed}
                className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Save and leave
              </button>
              <button
                onClick={() => blocker.proceed?.()}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Discard and leave
              </button>
              <button
                onClick={() => blocker.reset?.()}
                className="w-full px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                Stay on Settings
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Settings</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">Manage your app preferences</p>
          </div>
          {hasUnsavedChanges && (
            <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
              Unsaved changes
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        <div className="space-y-6">
          {/* Currency Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Currency</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Select your preferred currency</p>
              </div>
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                {settings.darkMode ? <Moon className="w-5 h-5 text-purple-600" /> : <Sun className="w-5 h-5 text-purple-600" />}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Appearance</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Customize the look and feel</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Dark Mode</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Enable dark mode theme</p>
              </div>
              <button
                onClick={() => updateSettings({ darkMode: !settings.darkMode })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.darkMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Default Income Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Default Weekly Income</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Set the default income for new weeks</p>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-500 dark:text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                value={defaultIncome}
                onChange={(e) => setDefaultIncome(e.target.value)}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="500.00"
              />
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Data Management</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Reset or export your data</p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleReset}
                className="w-full px-4 py-3 border-2 border-red-200 dark:border-red-800 text-red-600 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              >
                Reset All Data
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This will delete all weeks, expenses, and restore default settings. This action cannot be undone.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              Save Settings
            </button>
            <button
              onClick={() => {
                setCurrency(settings.currency);
                setDefaultIncome(settings.defaultWeeklyIncome.toString());
              }}
              disabled={!hasUnsavedChanges}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">About FinanceApp</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Version 1.0.0 - A modern personal finance tracking application built for simplicity and efficiency.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
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
