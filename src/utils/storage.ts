import { AppState } from '../types';

// User-specific storage keys
const getStorageKey = (userId?: string) => {
  return userId ? `focusflow_state_${userId}` : 'focusflow_state_guest';
};

const getUserSpecificKey = (key: string, userId?: string) => {
  return userId ? `${key}_${userId}` : `${key}_guest`;
};

const defaultState: AppState = {
  moods: [],
  goals: [],
  reminders: [],
  habits: [],
  lists: [],
  brainDump: [],
  todaysFocus: null,
  lastCheckIn: null,
  streak: 0,
  widgets: [
    // First Column (0-3): Priority widgets
    { id: 'dailyFocus', type: 'dailyFocus', visible: true, order: 0 },
    { id: 'goalList', type: 'goalList', visible: true, order: 1 },
    { id: 'focusTimer', type: 'focusTimer', visible: true, order: 2 },
    { id: 'reminderList', type: 'reminderList', visible: true, order: 3 },
    
    // Second Column (4-7): Secondary widgets - balanced height
    { id: 'streakCounter', type: 'streakCounter', visible: true, order: 4 },
    { id: 'moodCheck', type: 'moodCheck', visible: true, order: 5 },
    { id: 'habitTracker', type: 'habitTracker', visible: true, order: 6 },
    { id: 'moodBoard', type: 'moodBoard', visible: true, order: 7 },
    
    // Third Column (8-11): Tertiary widgets - optimized for visual balance
    { id: 'moodHistory', type: 'moodHistory', visible: true, order: 8 },
    { id: 'lists', type: 'lists', visible: true, order: 9 },
    { id: 'brainDump', type: 'brainDump', visible: true, order: 10 },
  ],
};

// Clear all user-specific data from localStorage
export const clearUserData = (userId?: string): void => {
  try {
    if (typeof Storage === 'undefined') return;

    const keysToRemove: string[] = [];
    
    if (userId) {
      // Clear specific user's data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes(`_${userId}`) || key.endsWith(`_${userId}`))) {
          keysToRemove.push(key);
        }
      }
    } else {
      // Clear all app-related data (fallback)
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('focusflow_') ||
          key.startsWith('brainbounce_') ||
          key.includes('lastFocusCheck_') ||
          key.includes('hasSeenTutorial_') ||
          key.includes('username_skipped_')
        )) {
          keysToRemove.push(key);
        }
      }
    }

    // Remove all identified keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    console.log(`🧹 Cleared ${keysToRemove.length} user-specific storage items`);
  } catch (error) {
    console.error('Failed to clear user data:', error);
  }
};

// Clear all browser storage (localStorage, sessionStorage, IndexedDB, Cache)
export const clearAllBrowserData = async (): Promise<void> => {
  console.log('🧹 STORAGE: Starting comprehensive browser data cleanup...');
  
  try {
    // Clear localStorage
    if (typeof Storage !== 'undefined') {
      const localStorageSize = localStorage.length;
      localStorage.clear();
      console.log(`🧹 STORAGE: Cleared localStorage (${localStorageSize} items)`);
    }

    // Clear sessionStorage
    if (typeof sessionStorage !== 'undefined') {
      const sessionStorageSize = sessionStorage.length;
      sessionStorage.clear();
      console.log(`🧹 STORAGE: Cleared sessionStorage (${sessionStorageSize} items)`);
    }

    // Clear IndexedDB
    if (typeof indexedDB !== 'undefined') {
      try {
        const databases = await indexedDB.databases();
        const deletePromises = databases.map(db => {
          if (db.name) {
            return new Promise<void>((resolve, reject) => {
              const deleteReq = indexedDB.deleteDatabase(db.name!);
              deleteReq.onsuccess = () => {
                console.log(`🧹 STORAGE: Deleted IndexedDB database: ${db.name}`);
                resolve();
              };
              deleteReq.onerror = () => reject(deleteReq.error);
              deleteReq.onblocked = () => {
                console.warn(`🧹 STORAGE: IndexedDB deletion blocked for: ${db.name}`);
                resolve(); // Don't fail the whole process
              };
            });
          }
          return Promise.resolve();
        });
        
        await Promise.allSettled(deletePromises);
        console.log('🧹 STORAGE: IndexedDB cleanup completed');
      } catch (error) {
        console.warn('🧹 STORAGE: Failed to clear IndexedDB:', error);
      }
    }

    // Clear Cache Storage
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        const deletePromises = cacheNames.map(cacheName => 
          caches.delete(cacheName).then(success => {
            if (success) {
              console.log(`🧹 STORAGE: Deleted cache: ${cacheName}`);
            }
            return success;
          })
        );
        
        await Promise.allSettled(deletePromises);
        console.log('🧹 STORAGE: Cache storage cleanup completed');
      } catch (error) {
        console.warn('🧹 STORAGE: Failed to clear cache storage:', error);
      }
    }

    // Clear any Firebase Auth persistence
    try {
      // Clear any Firebase-related storage
      const firebaseKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('firebase:') || key.includes('firebase'))) {
          firebaseKeys.push(key);
        }
      }
      firebaseKeys.forEach(key => localStorage.removeItem(key));
      
      if (firebaseKeys.length > 0) {
        console.log(`🧹 STORAGE: Cleared ${firebaseKeys.length} Firebase storage items`);
      }
    } catch (error) {
      console.warn('🧹 STORAGE: Failed to clear Firebase storage:', error);
    }

    console.log('✅ STORAGE: Comprehensive browser data cleanup completed');
  } catch (error) {
    console.error('❌ STORAGE: Failed to clear browser data:', error);
  }
};

export const saveState = (state: AppState, userId?: string): void => {
  try {
    if (typeof Storage === 'undefined') {
      console.warn('localStorage not available');
      return;
    }

    const storageKey = getStorageKey(userId);
    const serializedState = JSON.stringify(state);
    localStorage.setItem(storageKey, serializedState);
    console.log(`State saved successfully for user: ${userId || 'guest'}`);
  } catch (error) {
    console.error('Failed to save state:', error);
    
    // Try to clear some space and retry
    try {
      const storageKey = getStorageKey(userId);
      localStorage.removeItem(storageKey);
      const serializedState = JSON.stringify(state);
      localStorage.setItem(storageKey, serializedState);
      console.log('State saved successfully after clearing');
    } catch (retryError) {
      console.error('Failed to save state even after clearing:', retryError);
    }
  }
};

export const loadState = (userId?: string): AppState => {
  try {
    if (typeof Storage === 'undefined') {
      console.warn('localStorage not available, using default state');
      return defaultState;
    }

    const storageKey = getStorageKey(userId);
    const serializedState = localStorage.getItem(storageKey);
    
    if (!serializedState) {
      console.log(`No saved state found for user: ${userId || 'guest'}, using default state`);
      return defaultState;
    }

    const parsedState = JSON.parse(serializedState);
    
    // CRITICAL: Force migration for existing users to ensure Lists widget is visible
    let widgets = Array.isArray(parsedState.widgets) ? [...parsedState.widgets] : [...defaultState.widgets];
    
    // Check if Lists widget exists
    const hasListsWidget = widgets.some(w => w.type === 'lists');
    
    if (!hasListsWidget) {
      // Add Lists widget if it doesn't exist
      widgets.push({ id: 'lists', type: 'lists', visible: true, order: 9 });
      console.log('✅ Added missing Lists widget for existing user');
    }
    
    // Ensure all widgets are visible by default (migration for existing users)
    widgets = widgets.map(widget => ({
      ...widget,
      visible: widget.visible !== false // Force visible unless explicitly set to false
    }));
    
    // Ensure all default widgets exist (add any missing ones)
    const defaultWidgetTypes = defaultState.widgets.map(w => w.type);
    const existingWidgetTypes = widgets.map(w => w.type);
    
    defaultWidgetTypes.forEach(type => {
      if (!existingWidgetTypes.includes(type)) {
        const defaultWidget = defaultState.widgets.find(w => w.type === type);
        if (defaultWidget) {
          widgets.push({ ...defaultWidget, visible: true });
          console.log(`✅ Added missing ${type} widget for existing user`);
        }
      }
    });
    
    // Sort widgets by order
    widgets.sort((a, b) => a.order - b.order);
    
    // Ensure each list has a valid items array and filter out invalid list objects
    const validatedLists = Array.isArray(parsedState.lists) 
      ? parsedState.lists
          .filter((list: any) => list && typeof list === 'object' && list.id) // Filter out null, undefined, or invalid list objects
          .map((list: any) => ({
            ...list,
            items: Array.isArray(list.items) ? list.items : []
          }))
      : defaultState.lists;
    
    // Validate and merge with default state to ensure all properties exist
    const mergedState = {
      ...defaultState,
      ...parsedState,
      // Ensure arrays are valid
      moods: Array.isArray(parsedState.moods) ? parsedState.moods : defaultState.moods,
      goals: Array.isArray(parsedState.goals) ? parsedState.goals : defaultState.goals,
      reminders: Array.isArray(parsedState.reminders) ? parsedState.reminders : defaultState.reminders,
      habits: Array.isArray(parsedState.habits) ? parsedState.habits : defaultState.habits,
      lists: validatedLists,
      brainDump: Array.isArray(parsedState.brainDump) ? parsedState.brainDump : defaultState.brainDump,
      widgets: widgets, // Use the processed widgets array
    };

    console.log(`State loaded successfully for user: ${userId || 'guest'} with widget migration`);
    return mergedState;
  } catch (error) {
    console.error('Failed to load state:', error);
    
    // Try to clear corrupted data and return default state
    try {
      const storageKey = getStorageKey(userId);
      localStorage.removeItem(storageKey);
      console.log('Cleared corrupted state, using default state');
    } catch (clearError) {
      console.error('Failed to clear corrupted state:', clearError);
    }
    
    return defaultState;
  }
};

// Helper function to get user-specific keys for other components
export const getUserStorageKey = (key: string, userId?: string): string => {
  return getUserSpecificKey(key, userId);
};