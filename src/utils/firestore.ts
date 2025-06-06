import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, getDb } from '../firebase';
import { AppState } from '../types';
import debounce from 'lodash/debounce';

const CACHE_KEY = 'focusflow_cache';
let unsubscribeSnapshot: (() => void) | null = null;
let memoryCache: { data: AppState; timestamp: number } | null = null;
let cloudSyncDisabled = false;

// Simple debounced save function
const debouncedSave = debounce(async (uid: string, saveData: any) => {
  if (cloudSyncDisabled) return;
  
  try {
    const db = await getDb();
    if (!db || !auth.currentUser || auth.currentUser.uid !== uid) {
      return;
    }

    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      ...saveData,
      lastUpdated: new Date().toISOString(),
      clientTimestamp: Date.now()
    }, { merge: true });
    
    console.log('✅ Data synced to cloud');
    
  } catch (error: any) {
    console.error('❌ Cloud sync failed:', error);
    
    if (error.code === 'permission-denied' || 
        error.message?.includes('Missing or insufficient permissions')) {
      cloudSyncDisabled = true;
      console.warn('🔒 Cloud sync disabled due to permissions');
    }
  }
}, 3000);

const cacheData = (data: AppState) => {
  const cache = { data, timestamp: Date.now() };
  
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
      memoryCache = cache;
    }
  }
};

const loadCache = (): AppState | null => {
  const MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 hours
  
  try {
    const localData = localStorage.getItem(CACHE_KEY);
    if (localData) {
      const { data, timestamp } = JSON.parse(localData);
      if (Date.now() - timestamp < MAX_CACHE_AGE) {
        return data;
      }
    }
  } catch (e) {
    try {
      const sessionData = sessionStorage.getItem(CACHE_KEY);
      if (sessionData) {
        const { data, timestamp } = JSON.parse(sessionData);
        if (Date.now() - timestamp < MAX_CACHE_AGE) {
          return data;
        }
      }
    } catch (e) {
      if (memoryCache && Date.now() - memoryCache.timestamp < MAX_CACHE_AGE) {
        return memoryCache.data;
      }
    }
  }
  return null;
};

export const saveUserData = async (uid: string, data: AppState): Promise<void> => {
  if (!uid) {
    cacheData(data);
    return;
  }

  try {
    // Always cache data first for immediate response
    cacheData(data);
    
    // Try cloud sync if not disabled
    if (!cloudSyncDisabled) {
      await debouncedSave(uid, data);
    }
    
  } catch (error) {
    console.error('💾 Save error:', error);
    // Ensure data is cached even if cloud sync fails
    cacheData(data);
  }
};

export const loadUserData = async (uid: string): Promise<AppState | null> => {
  if (!uid) {
    return loadCache();
  }

  // Clean up any existing listener
  if (unsubscribeSnapshot) {
    unsubscribeSnapshot();
    unsubscribeSnapshot = null;
  }

  // Return cached data immediately if cloud sync is disabled
  if (cloudSyncDisabled) {
    return loadCache();
  }

  try {
    const db = await getDb();
    if (!db || !auth.currentUser || auth.currentUser.uid !== uid) {
      return loadCache();
    }

    const userDocRef = doc(db, 'users', uid);
    
    // Set up real-time sync with timeout
    const syncPromise = new Promise<AppState | null>((resolve) => {
      const timeout = setTimeout(() => {
        console.warn('⏰ Cloud sync timeout, using cached data');
        resolve(loadCache());
      }, 5000); // 5 second timeout

      unsubscribeSnapshot = onSnapshot(
        userDocRef,
        {
          next: (doc) => {
            clearTimeout(timeout);
            if (doc.exists()) {
              const data = doc.data() as AppState;
              cacheData(data);
              resolve(data);
            } else {
              resolve(loadCache());
            }
          },
          error: (error) => {
            clearTimeout(timeout);
            console.error('🔄 Real-time sync error:', error);
            
            if (error.code === 'permission-denied') {
              cloudSyncDisabled = true;
            }
            
            resolve(loadCache());
          }
        }
      );
    });

    // Try cache first for immediate response
    const cached = loadCache();
    if (cached) {
      // Return cached data immediately, but still set up sync in background
      syncPromise.catch(() => {}); // Ignore sync errors
      return cached;
    }

    // If no cache, wait for sync (with timeout)
    return await syncPromise;
    
  } catch (error) {
    console.error('💾 Load error:', error);
    
    if (error.code === 'permission-denied') {
      cloudSyncDisabled = true;
    }
    
    return loadCache();
  }
};

export const cleanup = () => {
  if (unsubscribeSnapshot) {
    unsubscribeSnapshot();
    unsubscribeSnapshot = null;
  }
  
  cloudSyncDisabled = false;
  
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (e) {
    try {
      sessionStorage.removeItem(CACHE_KEY);
    } catch (e) {
      memoryCache = null;
    }
  }
};

export const isCloudSyncAvailable = async (): Promise<boolean> => {
  if (cloudSyncDisabled) return false;
  
  try {
    const db = await getDb();
    return !!db && !!auth.currentUser;
  } catch {
    return false;
  }
};

export const retryCloudSync = () => {
  cloudSyncDisabled = false;
  console.log('🔄 Cloud sync retry enabled');
};