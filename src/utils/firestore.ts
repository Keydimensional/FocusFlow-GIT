import { doc, getDoc, setDoc, onSnapshot, enableNetwork, disableNetwork } from 'firebase/firestore';
import { auth, getDb, isFirestoreAvailable, resetFirestoreInit } from '../firebase';
import { AppState } from '../types';
import debounce from 'lodash/debounce';

const CACHE_KEY = 'focusflow_cache';
const RETRY_QUEUE_KEY = 'focusflow_retry_queue';
const CONNECTION_STATE_KEY = 'focusflow_connection_state';

let unsubscribeSnapshot: (() => void) | null = null;
let memoryCache: { data: AppState; timestamp: number } | null = null;
let cloudSyncDisabled = false;
let isAdBlockerDetected = false;
let retryQueue: Array<{ uid: string; data: AppState; timestamp: number }> = [];
let connectionState: 'online' | 'offline' | 'blocked' = 'online';
let lastConnectionTest = 0;

// Toast notification system
let showToast: ((message: string, type: 'error' | 'warning' | 'success') => void) | null = null;

export const setToastHandler = (handler: (message: string, type: 'error' | 'warning' | 'success') => void) => {
  showToast = handler;
};

const displayToast = (message: string, type: 'error' | 'warning' | 'success' = 'error') => {
  if (showToast) {
    showToast(message, type);
  } else {
    console.warn(`Toast: ${message}`);
  }
};

// Load connection state
const loadConnectionState = () => {
  try {
    const stored = localStorage.getItem(CONNECTION_STATE_KEY);
    if (stored) {
      const { state, timestamp } = JSON.parse(stored);
      // Use cached state if less than 5 minutes old
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        connectionState = state;
        if (state === 'blocked') {
          isAdBlockerDetected = true;
          cloudSyncDisabled = true;
        }
      }
    }
  } catch (error) {
    console.warn('Failed to load connection state:', error);
  }
};

const saveConnectionState = (state: 'online' | 'offline' | 'blocked') => {
  try {
    connectionState = state;
    localStorage.setItem(CONNECTION_STATE_KEY, JSON.stringify({
      state,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.warn('Failed to save connection state:', error);
  }
};

// Load retry queue from storage
const loadRetryQueue = () => {
  try {
    const stored = localStorage.getItem(RETRY_QUEUE_KEY);
    if (stored) {
      retryQueue = JSON.parse(stored);
      // Clean old entries (older than 24 hours)
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      retryQueue = retryQueue.filter(item => item.timestamp > cutoff);
      saveRetryQueue();
    }
  } catch (error) {
    console.warn('Failed to load retry queue:', error);
    retryQueue = [];
  }
};

const saveRetryQueue = () => {
  try {
    localStorage.setItem(RETRY_QUEUE_KEY, JSON.stringify(retryQueue));
  } catch (error) {
    console.warn('Failed to save retry queue:', error);
  }
};

const addToRetryQueue = (uid: string, data: AppState) => {
  retryQueue.push({ uid, data, timestamp: Date.now() });
  // Keep only last 10 items
  if (retryQueue.length > 10) {
    retryQueue = retryQueue.slice(-10);
  }
  saveRetryQueue();
};

// Test Firestore connection
const testFirestoreConnection = async (): Promise<boolean> => {
  const now = Date.now();
  
  // Don't test too frequently
  if (now - lastConnectionTest < 30000) { // 30 seconds
    return connectionState === 'online';
  }
  
  lastConnectionTest = now;
  
  try {
    const db = await getDb();
    if (!db || !auth.currentUser) {
      saveConnectionState('offline');
      return false;
    }

    // Test with a simple read operation with timeout
    const testPromise = getDoc(doc(db, 'test', 'connection'));
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection test timeout')), 8000);
    });

    await Promise.race([testPromise, timeoutPromise]);
    
    saveConnectionState('online');
    cloudSyncDisabled = false;
    isAdBlockerDetected = false;
    return true;
    
  } catch (error: any) {
    console.warn('🔍 Firestore connection test failed:', error);
    
    if (detectAdBlocker(error)) {
      saveConnectionState('blocked');
      isAdBlockerDetected = true;
      cloudSyncDisabled = true;
      return false;
    } else {
      saveConnectionState('offline');
      return false;
    }
  }
};

const processRetryQueue = async () => {
  if (retryQueue.length === 0 || cloudSyncDisabled) return;

  // Test connection first
  const isConnected = await testFirestoreConnection();
  if (!isConnected) {
    console.warn('⚠️ Connection test failed, skipping retry queue processing');
    return;
  }

  console.log(`🔄 Processing ${retryQueue.length} queued sync operations...`);
  
  const itemsToRetry = [...retryQueue];
  retryQueue = [];
  saveRetryQueue();

  let successCount = 0;
  
  for (const item of itemsToRetry) {
    try {
      await saveUserDataDirect(item.uid, item.data);
      successCount++;
    } catch (error) {
      console.warn('❌ Queued sync failed, re-adding to queue:', error);
      addToRetryQueue(item.uid, item.data);
    }
  }
  
  if (successCount > 0) {
    displayToast(`${successCount} sync operation${successCount > 1 ? 's' : ''} completed!`, 'success');
  }
};

// Initialize
loadConnectionState();
loadRetryQueue();

// Check for ad blocker by detecting blocked requests
const detectAdBlocker = (error: any): boolean => {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorCode = error?.code?.toLowerCase() || '';
  
  return (
    errorMessage.includes('blocked') ||
    errorMessage.includes('net::err_blocked_by_client') ||
    errorMessage.includes('network error') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('failed to fetch') ||
    errorCode.includes('unavailable') ||
    errorCode.includes('network-request-failed') ||
    errorCode.includes('deadline-exceeded')
  );
};

// Direct save without debouncing (for retry queue)
const saveUserDataDirect = async (uid: string, data: AppState): Promise<void> => {
  const db = await getDb();
  if (!db || !auth.currentUser || auth.currentUser.uid !== uid) {
    throw new Error('Database or authentication not available');
  }

  const userDocRef = doc(db, 'users', uid);
  
  // Add timeout to setDoc operation
  const savePromise = setDoc(userDocRef, {
    ...data,
    lastUpdated: new Date().toISOString(),
    clientTimestamp: Date.now()
  }, { merge: true });
  
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Save operation timeout')), 10000);
  });
  
  await Promise.race([savePromise, timeoutPromise]);
};

// Debounced save function with error handling
const debouncedSave = debounce(async (uid: string, saveData: any) => {
  if (cloudSyncDisabled || connectionState === 'blocked') return;
  
  try {
    await saveUserDataDirect(uid, saveData);
    console.log('✅ Data synced to cloud');
    
    // If sync succeeds, process any queued items
    if (retryQueue.length > 0) {
      setTimeout(processRetryQueue, 2000);
    }
    
  } catch (error: any) {
    console.error('❌ Cloud sync failed:', error);
    
    // Check if this is an ad blocker issue
    if (detectAdBlocker(error)) {
      isAdBlockerDetected = true;
      saveConnectionState('blocked');
      
      if (!cloudSyncDisabled) {
        displayToast(
          'Sync blocked by ad blocker. Try disabling ad blockers for this app.',
          'warning'
        );
        cloudSyncDisabled = true;
      }
      
      // Add to retry queue
      addToRetryQueue(uid, saveData);
      
    } else if (error.code === 'permission-denied' || 
               error.message?.includes('Missing or insufficient permissions')) {
      cloudSyncDisabled = true;
      displayToast(
        'Cloud sync unavailable. Your data is saved locally.',
        'warning'
      );
      
    } else if (error.code === 'unavailable' || error.code === 'deadline-exceeded') {
      saveConnectionState('offline');
      displayToast(
        'Cloud service temporarily unavailable. Will retry automatically.',
        'warning'
      );
      
      // Add to retry queue for temporary issues
      addToRetryQueue(uid, saveData);
      
    } else {
      displayToast(
        'Sync failed. Your data is saved locally.',
        'error'
      );
      
      // Add to retry queue for unknown errors
      addToRetryQueue(uid, saveData);
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
    
    // Try cloud sync if not disabled and Firestore is available
    if (!cloudSyncDisabled && isFirestoreAvailable()) {
      await debouncedSave(uid, data);
    } else if (!isFirestoreAvailable()) {
      console.warn('⚠️ Firestore not available, using local storage only');
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

  // Return cached data immediately if cloud sync is disabled or Firestore unavailable
  if (cloudSyncDisabled || !isFirestoreAvailable()) {
    return loadCache();
  }

  try {
    const db = await getDb();
    if (!db || !auth.currentUser || auth.currentUser.uid !== uid) {
      return loadCache();
    }

    const userDocRef = doc(db, 'users', uid);
    
    // Set up real-time sync with timeout and error handling
    const syncPromise = new Promise<AppState | null>((resolve) => {
      const timeout = setTimeout(() => {
        console.warn('⏰ Cloud sync timeout, using cached data');
        resolve(loadCache());
      }, 10000); // 10 second timeout

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
            
            if (detectAdBlocker(error)) {
              isAdBlockerDetected = true;
              saveConnectionState('blocked');
              if (!cloudSyncDisabled) {
                displayToast(
                  'Real-time sync blocked. Try disabling ad blockers for this app.',
                  'warning'
                );
                cloudSyncDisabled = true;
              }
            } else if (error.code === 'permission-denied') {
              cloudSyncDisabled = true;
              displayToast(
                'Cloud sync unavailable. Using local storage.',
                'warning'
              );
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
    
    if (detectAdBlocker(error)) {
      isAdBlockerDetected = true;
      saveConnectionState('blocked');
      displayToast(
        'Data loading blocked. Try disabling ad blockers for this app.',
        'warning'
      );
    } else if (error.code === 'permission-denied') {
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
  isAdBlockerDetected = false;
  retryQueue = [];
  connectionState = 'online';
  
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(RETRY_QUEUE_KEY);
    localStorage.removeItem(CONNECTION_STATE_KEY);
  } catch (e) {
    try {
      sessionStorage.removeItem(CACHE_KEY);
    } catch (e) {
      memoryCache = null;
    }
  }
};

export const isCloudSyncAvailable = async (): Promise<boolean> => {
  if (cloudSyncDisabled || isAdBlockerDetected || connectionState === 'blocked') {
    return false;
  }
  
  if (!isFirestoreAvailable()) {
    return false;
  }
  
  try {
    const db = await getDb();
    return !!db && !!auth.currentUser;
  } catch {
    return false;
  }
};

export const retryCloudSync = async () => {
  console.log('🔄 Retrying cloud sync...');
  
  // Reset Firestore initialization
  resetFirestoreInit();
  
  cloudSyncDisabled = false;
  isAdBlockerDetected = false;
  connectionState = 'online';
  
  // Test connectivity
  const isConnected = await testFirestoreConnection();
  
  if (isConnected) {
    displayToast('Cloud sync restored successfully!', 'success');
    
    // Process any queued items
    if (retryQueue.length > 0) {
      setTimeout(processRetryQueue, 1000);
    }
    
    return true;
  } else {
    if (connectionState === 'blocked') {
      displayToast(
        'Still blocked by ad blocker. Please disable ad blockers for this app.',
        'warning'
      );
    } else {
      displayToast(
        'Cloud sync retry failed. Check your connection.',
        'error'
      );
    }
    
    return false;
  }
};

export const getRetryQueueSize = (): number => {
  return retryQueue.length;
};

export const clearRetryQueue = () => {
  retryQueue = [];
  saveRetryQueue();
};

// Auto-retry mechanism - try to process queue when network comes back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('🌐 Network restored, testing connection...');
    setTimeout(async () => {
      const isConnected = await testFirestoreConnection();
      if (isConnected && retryQueue.length > 0) {
        processRetryQueue();
      }
    }, 3000);
  });
  
  // Periodic connection test (every 5 minutes)
  setInterval(async () => {
    if (cloudSyncDisabled && connectionState !== 'blocked') {
      await testFirestoreConnection();
    }
  }, 5 * 60 * 1000);
}