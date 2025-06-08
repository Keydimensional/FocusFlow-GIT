import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Monitor, AlertCircle, CheckCircle, Smartphone } from 'lucide-react';
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
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <Monitor className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Currently: Web Browser App</h4>
            <p className="text-sm text-blue-700 mb-2">
              You're using BrainBounce in your web browser. All notifications work as in-app alerts with optional sounds.
            </p>
            <div className="bg-blue-100 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>💡 Coming Soon:</strong> We're working on native mobile apps that will support background notifications even when the app is closed. For now, keep BrainBounce open in your browser to receive alerts!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700">In-App Notification Types</h4>
        
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
                In-app alerts and sounds while BrainBounce is open
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
                <p className="text-sm text-gray-600">Get in-app alerts when reminders are due</p>
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
                <p className="text-sm text-gray-600">Get in-app alerts when focus sessions complete</p>
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

      {/* Future Native App Info */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
        <div className="flex items-start gap-3">
          <Smartphone className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-purple-900 mb-1">Future: Native Mobile Apps</h4>
            <p className="text-sm text-purple-700">
              We're developing native iOS and Android apps that will support:
            </p>
            <ul className="text-sm text-purple-700 mt-2 space-y-1">
              <li>• Background notifications (even when app is closed)</li>
              <li>• System notification sounds and vibration</li>
              <li>• Lock screen notifications</li>
              <li>• Better integration with your device</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Current Functionality Info */}
      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
        <p className="text-xs text-green-700">
          <strong>✅ Current Web App Features:</strong> In-app notification popups, customisable sounds, visual alerts, and reminder scheduling all work perfectly while BrainBounce is open in your browser.
        </p>
      </div>
    </div>
  );
};