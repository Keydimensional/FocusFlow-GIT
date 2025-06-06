// Safe notification utility for cross-platform compatibility
export const trySendNotification = (title: string, options?: NotificationOptions): boolean => {
  // Check if Notification API is available
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Notifications not supported on this device');
    return false;
  }

  try {
    // Check permission status
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/vite.svg',
        silent: true, // We handle sound separately
        ...options
      });
      return true;
    } else if (Notification.permission === 'default') {
      // Request permission but don't block
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, {
            icon: '/vite.svg',
            silent: true,
            ...options
          });
        }
      }).catch(error => {
        console.warn('Failed to request notification permission:', error);
      });
      return false;
    } else {
      console.warn('Notification permission denied');
      return false;
    }
  } catch (error) {
    console.warn('Failed to send notification:', error);
    return false;
  }
};

export const requestNotificationPermission = async (): Promise<NotificationPermission | null> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Notifications not supported on this device');
    return null;
  }

  try {
    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }
    return Notification.permission;
  } catch (error) {
    console.warn('Failed to request notification permission:', error);
    return null;
  }
};

export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermission | null => {
  if (!isNotificationSupported()) {
    return null;
  }
  return Notification.permission;
};