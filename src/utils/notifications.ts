// Safe notification utility for cross-platform compatibility
// This file now only handles in-app notifications, no browser notifications

export const trySendNotification = (title: string, options?: any): boolean => {
  // Always return false since we're not using browser notifications
  console.log('📱 In-app notification:', title, options?.body || '');
  return false;
};

export const requestNotificationPermission = async (): Promise<null> => {
  // No longer requesting browser notification permissions
  console.log('📱 Browser notifications disabled - using in-app notifications only');
  return null;
};

export const isNotificationSupported = (): boolean => {
  // Always return false since we're not using browser notifications
  return false;
};

export const getNotificationPermission = (): null => {
  // No browser notification permissions needed
  return null;
};

// Play notification sound utility
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