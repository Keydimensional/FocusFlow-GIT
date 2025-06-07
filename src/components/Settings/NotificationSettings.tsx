import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Smartphone, Monitor, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  getNotificationPreferences, 
  saveNotificationPreferences, 
  isNativeApp, 
  isLocalNotificationSupported,
  requestNotificationPermission,
  checkNotificationPermission
} from '../../utils/notifications';

export const NotificationSettings: React.FC = () => {
  const [preferences, setPreferences] = useState(getNotificationPreferences());
  const [hasPermission, setHasPermission] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);

  // Check permissions on mount
  useEffect(() => {
    const checkPermissions = async () => {
      if (isLocalNotificationSupported()) {
        const permission = await checkNotificationPermission();
        setHasPermission(permission);
      }
      setPermissionChecked(true);
    };

    checkPermissions();
  }, []);

  const handlePreferenceChange = (key: keyof typeof preferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    saveNotificationPreferences(newPreferences);
  };

  const handleRequestPermission = async () => {
    setIsRequestingPermission(true);
    try {
      const granted = await requestNotificationPermission();
      setHasPermission(granted);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const isNative = isNativeApp();
  const isSupported = isLocalNotificationSupported();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
        <Bell className="w-5 h-5 text-purple-600" />
        Notifications
      </h3>

      {/* Platform Status */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          {isNative ? (
            <Smartphone className="w-4 h-4 text-blue-600" />
          ) : (
            <Monitor className="w-4 h-4 text-gray-600" />
          )}
          <span className="text-sm font-medium text-gray-700">
            Platform: {isNative ? 'Native App' : 'Web Browser'}
          </span>
        </div>
        
        {isNative ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {isSupported ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm text-gray-600">
                Local notifications: {isSupported ? 'Available' : 'Not available'}
              </span>
            </div>
            
            {isSupported && permissionChecked && (
              <div className="flex items-center gap-2">
                {hasPermission ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                )}
                <span className="text-sm text-gray-600">
                  Permissions: {hasPermission ? 'Granted' : 'Not granted'}
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            Local notifications are only available in the native mobile app. 
            In-app notifications and sounds will still work in the browser.
          </p>
        )}
      </div>

      {/* Permission Request */}
      {isSupported && !hasPermission && permissionChecked && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-yellow-800 mb-1">
                Enable Notifications
              </h4>
              <p className="text-sm text-yellow-700 mb-3">
                Allow BrainBounce to send you helpful reminders and focus session alerts.
              </p>
              <button
                onClick={handleRequestPermission}
                disabled={isRequestingPermission}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isRequestingPermission ? 'Requesting...' : 'Enable Notifications'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notification Preferences */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700">Notification Types</h4>
        
        {/* Master Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {preferences.enabled ? (
              <Bell className="w-5 h-5 text-purple-600" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <span className="font-medium text-gray-800">All Notifications</span>
              <p className="text-sm text-gray-600">
                {isNative ? 'Local notifications and in-app alerts' : 'In-app notifications and sounds'}
              </p>
            </div>
          </div>
          <button
            onClick={() => handlePreferenceChange('enabled', !preferences.enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.enabled ? 'bg-purple-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Individual Toggles */}
        {preferences.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2 ml-4"
          >
            {/* Reminders */}
            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
              <div>
                <span className="font-medium text-gray-800">Reminders</span>
                <p className="text-sm text-gray-600">Get notified when reminders are due</p>
              </div>
              <button
                onClick={() => handlePreferenceChange('reminders', !preferences.reminders)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.reminders ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.reminders ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Focus Timer */}
            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
              <div>
                <span className="font-medium text-gray-800">Focus Timer</span>
                <p className="text-sm text-gray-600">Get notified when focus sessions complete</p>
              </div>
              <button
                onClick={() => handlePreferenceChange('focusTimer', !preferences.focusTimer)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.focusTimer ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.focusTimer ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-xs text-blue-700">
          💡 <strong>Note:</strong> {isNative 
            ? 'Local notifications work even when the app is closed. In-app sounds and alerts work in all modes.'
            : 'In-app notifications and sounds work while the app is open. Install the mobile app for background notifications.'
          }
        </p>
      </div>
    </div>
  );
};