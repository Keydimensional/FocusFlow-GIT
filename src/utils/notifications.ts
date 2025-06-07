import { Capacitor } from '@capacitor/core';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';

// Notification preferences interface
interface NotificationPreferences {
  enabled: boolean;
  reminders: boolean;
  focusTimer: boolean;
}

const NOTIFICATION_PREFS_KEY = 'brainbounce_notification_prefs';

// Default preferences
const defaultPreferences: NotificationPreferences = {
  enabled: true,
  reminders: true,
  focusTimer: true,
};

// Get notification preferences from storage
export const getNotificationPreferences = (): NotificationPreferences => {
  try {
    const stored = localStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (stored) {
      return { ...defaultPreferences, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.warn('Failed to load notification preferences:', error);
  }
  return defaultPreferences;
};

// Save notification preferences to storage
export const saveNotificationPreferences = (prefs: NotificationPreferences): void => {
  try {
    localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.warn('Failed to save notification preferences:', error);
  }
};

// Check if we're running in a native app
export const isNativeApp = (): boolean => {
  return Capacitor.isNativePlatform();
};

// Check if local notifications are supported and available
export const isLocalNotificationSupported = (): boolean => {
  return isNativeApp() && Capacitor.isPluginAvailable('LocalNotifications');
};

// Request notification permissions (only for native apps)
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isLocalNotificationSupported()) {
    console.log('📱 Local notifications not supported - running in browser');
    return false;
  }

  try {
    console.log('📱 Requesting local notification permissions...');
    
    const permission = await LocalNotifications.requestPermissions();
    const granted = permission.display === 'granted';
    
    if (granted) {
      console.log('✅ Local notification permissions granted');
    } else {
      console.log('❌ Local notification permissions denied');
    }
    
    return granted;
  } catch (error) {
    console.error('❌ Failed to request notification permissions:', error);
    return false;
  }
};

// Check current notification permissions
export const checkNotificationPermission = async (): Promise<boolean> => {
  if (!isLocalNotificationSupported()) {
    return false;
  }

  try {
    const permission = await LocalNotifications.checkPermissions();
    return permission.display === 'granted';
  } catch (error) {
    console.error('❌ Failed to check notification permissions:', error);
    return false;
  }
};

// Schedule a local notification
export const scheduleLocalNotification = async (options: {
  id: number;
  title: string;
  body: string;
  scheduleAt: Date;
  sound?: string;
  extra?: any;
}): Promise<boolean> => {
  if (!isLocalNotificationSupported()) {
    console.log('📱 Skipping notification - not in native app');
    return false;
  }

  const prefs = getNotificationPreferences();
  if (!prefs.enabled) {
    console.log('📱 Notifications disabled by user');
    return false;
  }

  try {
    const hasPermission = await checkNotificationPermission();
    if (!hasPermission) {
      console.log('📱 No notification permissions');
      return false;
    }

    const scheduleOptions: ScheduleOptions = {
      notifications: [
        {
          id: options.id,
          title: options.title,
          body: options.body,
          schedule: {
            at: options.scheduleAt,
          },
          sound: options.sound || 'default',
          extra: options.extra || {},
        },
      ],
    };

    await LocalNotifications.schedule(scheduleOptions);
    console.log('✅ Local notification scheduled:', options.title);
    return true;
  } catch (error) {
    console.error('❌ Failed to schedule local notification:', error);
    return false;
  }
};

// Cancel a scheduled notification
export const cancelLocalNotification = async (id: number): Promise<void> => {
  if (!isLocalNotificationSupported()) {
    return;
  }

  try {
    await LocalNotifications.cancel({ notifications: [{ id: id.toString() }] });
    console.log('✅ Local notification cancelled:', id);
  } catch (error) {
    console.error('❌ Failed to cancel local notification:', error);
  }
};

// Cancel all scheduled notifications
export const cancelAllLocalNotifications = async (): Promise<void> => {
  if (!isLocalNotificationSupported()) {
    return;
  }

  try {
    await LocalNotifications.removeAllDeliveredNotifications();
    console.log('✅ All local notifications cancelled');
  } catch (error) {
    console.error('❌ Failed to cancel all local notifications:', error);
  }
};

// Schedule a reminder notification
export const scheduleReminderNotification = async (reminder: {
  id: string;
  title: string;
  datetime: string;
}): Promise<boolean> => {
  const prefs = getNotificationPreferences();
  if (!prefs.reminders) {
    console.log('📱 Reminder notifications disabled');
    return false;
  }

  const reminderTime = new Date(reminder.datetime);
  const now = new Date();

  if (reminderTime <= now) {
    console.log('📱 Reminder time is in the past, skipping notification');
    return false;
  }

  // Use a hash of the reminder ID to create a unique numeric ID
  const numericId = Math.abs(reminder.id.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0));

  return await scheduleLocalNotification({
    id: numericId,
    title: 'BrainBounce Reminder',
    body: reminder.title,
    scheduleAt: reminderTime,
    extra: {
      type: 'reminder',
      reminderId: reminder.id,
    },
  });
};

// Schedule a focus timer completion notification
export const scheduleFocusTimerNotification = async (durationMinutes: number): Promise<boolean> => {
  const prefs = getNotificationPreferences();
  if (!prefs.focusTimer) {
    console.log('📱 Focus timer notifications disabled');
    return false;
  }

  const completionTime = new Date();
  completionTime.setMinutes(completionTime.getMinutes() + durationMinutes);

  // Use a fixed ID for focus timer notifications (so we can cancel previous ones)
  const focusTimerId = 999999;

  // Cancel any existing focus timer notification
  await cancelLocalNotification(focusTimerId);

  return await scheduleLocalNotification({
    id: focusTimerId,
    title: 'Focus Session Complete! 🎯',
    body: `Great job! You've completed your ${durationMinutes}-minute focus session.`,
    scheduleAt: completionTime,
    extra: {
      type: 'focusTimer',
      duration: durationMinutes,
    },
  });
};

// Cancel focus timer notification
export const cancelFocusTimerNotification = async (): Promise<void> => {
  const focusTimerId = 999999;
  await cancelLocalNotification(focusTimerId);
};

// Play notification sound utility (for in-app notifications)
export const playNotificationSound = (soundType: 'gentle' | 'chime' = 'gentle'): void => {
  const SOUND_OPTIONS = {
    gentle: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
    chime: 'https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3'
  };

  try {
    const audio = new Audio(SOUND_OPTIONS[soundType]);
    audio.volume = 0.5;
    audio.load();
    audio.addEventListener('canplaythrough', () => {
      audio.play().catch(error => {
        console.warn('Failed to play notification sound:', error);
      });
    });
  } catch (error) {
    console.warn('Failed to create notification sound:', error);
  }
};

// Initialize notification system
export const initializeNotifications = async (): Promise<void> => {
  if (!isLocalNotificationSupported()) {
    console.log('📱 Local notifications not supported - running in browser');
    return;
  }

  try {
    console.log('📱 Initializing local notifications...');
    
    // Set up notification listeners
    await LocalNotifications.addListener('localNotificationReceived', (notification) => {
      console.log('📱 Local notification received:', notification);
    });

    await LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      console.log('📱 Local notification action performed:', notification);
    });

    console.log('✅ Local notifications initialized');
  } catch (error) {
    console.error('❌ Failed to initialize local notifications:', error);
  }
};

// Legacy exports for backward compatibility
export const trySendNotification = (title: string, options?: any): boolean => {
  console.log('📱 In-app notification:', title, options?.body || '');
  return false;
};

export const isNotificationSupported = (): boolean => {
  return false; // Browser notifications are disabled
};

export const getNotificationPermission = (): null => {
  return null; // No browser notification permissions needed
};