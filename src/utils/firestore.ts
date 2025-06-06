import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { AppState } from '../types';
import debounce from 'lodash/debounce';

const CACHE_KEY = 'focusflow_cache';
let unsubscribeSnapshot: (() => void) | null = null;
let memoryCache: { data: AppState; timestamp: number } | null = null;
let permissionDenied = false;
let permissionChecked = false;
let showedPermissionAlert = false;

// Show user-friendly alert for permission issues
const showPermissionAlert = () => {
  if (showedPermissionAlert) return;
  showedPermissionAlert = true;
  
  if (typeof window !== 'undefined' && window.alert) {
    setTimeout(() => {
      alert(`🔒 Cloud Sync Unavailable

Your data is being saved locally, but cloud sync is disabled.

This usually means Firebase permissions need to be configured. Your app will continue to work normally with local storage.

Contact support if you need help enabling cloud sync.`);
    }, 1000);
  }
};

// Enhanced debounced save function with proper auth checks
const debouncedSave = debounce(async (uid: string, saveData: any) => {
  // Skip if no database or permissions denied
  if (!db || permissionDenied) {
    return;
  }

  // Verify user is still authenticated
  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    console.warn('User not authenticated for save operation');
    return;
  }

  const maxRetries = 3;
  let retries = 0;
  
  const attemptSave = async (): Promise<void> => {
    try {
      const userDocRef = doc(db, 'users', uid);
      
      // Add server timestamp for conflict resolution
      const dataWithTimestamp = {
        ...saveData,
        lastUpdated: serverTimestamp(),
        clientTimestamp: Date.now()
      };
      
      await setDoc(userDocRef, dataWithTimestamp, { merge: true });
      console.log('✅ Firestore save successful');
      
      // Reset permission flags on successful save
      permissionDenied = false;
      
    } catch (error: any) {
      console.error('Firestore save error:', error);
      
      // Handle permission errors specifically
      if (error.code === 'permission-denied' || 
          error.message?.includes('Missing or insufficient permissions')) {
        
        if (!permissionDenied) {
          console.error('❌ Permission denied - Firestore rules may not be configured correctly');
          permissionDenied = true;
          showPermissionAlert();
        }
        return; // Don't retry permission errors
      }
      
      // Handle network/temporary errors with retry
      if ((error.code === 'unavailable' || 
           error.code === 'deadline-exceeded' || 
           error.code === 'unauthenticated') && 
          retries < maxRetries) {
        
        retries++;
        const delay = Math.min(1000 * Math.pow(2, retries), 10000);
        console.log(`🔄 Retrying save in ${delay}ms... (attempt ${retries}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return attemptSave();
      }
      
      // For other errors, log but don't crash the app
      console.error('💾 Firestore save failed, data saved locally only:', error.code || error.message);
    }
  };
  
  return attemptSave();
}, 2000);

const cacheData = (data: AppState) => {
  const cache = {
    data,
    timestamp: Date.now()
  };
  
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    console.log('💾 Data cached to localStorage');
  } catch (e) {
    console.warn('⚠️ localStorage failed, trying sessionStorage:', e);
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      console.log('💾 Data cached to sessionStorage');
    } catch (e) {
      console.warn('⚠️ sessionStorage failed, using memory cache:', e);
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
        console.log('📱 Loaded data from localStorage cache');
        return data;
      }
    }
  } catch (e) {
    console.warn('⚠️ Failed to load from localStorage:', e);
    try {
      const sessionData = sessionStorage.getItem(CACHE_KEY);
      if (sessionData) {
        const { data, timestamp } = JSON.parse(sessionData);
        if (Date.now() - timestamp < MAX_CACHE_AGE) {
          console.log('📱 Loaded data from sessionStorage cache');
          return data;
        }
      }
    } catch (e) {
      console.warn('⚠️ Failed to load from sessionStorage:', e);
      if (memoryCache && Date.now() - memoryCache.timestamp < MAX_CACHE_AGE) {
        console.log('🧠 Loaded data from memory cache');
        return memoryCache.data;
      }
    }
  }
  return null;
};

export const saveUserData = async (uid: string, data: AppState): Promise<void> => {
  if (!uid) {
    console.error('❌ No user ID provided for save operation');
    cacheData(data);
    return;
  }

  if (!db) {
    console.warn('⚠️ Firestore not initialized, saving locally only');
    cacheData(data);
    return;
  }

  // Verify current user matches the UID
  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    console.warn('⚠️ User authentication mismatch, saving locally only');
    cacheData(data);
    return;
  }

  try {
    // Ensure data is serializable
    const serializableData = JSON.parse(JSON.stringify(data));
    
    // Update cache immediately for responsive UI
    cacheData(serializableData);
    
    // Save to Firestore with debouncing (will be skipped if permissions denied)
    await debouncedSave(uid, serializableData);
    
  } catch (error: any) {
    console.error('💾 Error in saveUserData:', error);
    
    // Handle permission errors specifically
    if (error.code === 'permission-denied' || 
        error.message?.includes('Missing or insufficient permissions')) {
      
      if (!permissionDenied) {
        permissionDenied = true;
        console.warn('🔒 Cloud sync disabled due to permission issues. Data saved locally only.');
        showPermissionAlert();
      }
    }
    
    // Ensure data is cached even if Firestore save fails
    cacheData(data);
    
    // Don't throw error to prevent app crashes
  }
};

export const loadUserData = async (uid: string): Promise<AppState | null> => {
  if (!uid) {
    console.error('❌ No user ID provided for load operation');
    return loadCache();
  }

  if (!db) {
    console.warn('⚠️ Firestore not initialized, using cache only');
    return loadCache();
  }

  // Verify current user matches the UID
  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    console.warn('⚠️ User authentication mismatch, using cache only');
    return loadCache();
  }

  // Clean up any existing listener
  if (unsubscribeSnapshot) {
    unsubscribeSnapshot();
    unsubscribeSnapshot = null;
  }

  // If permissions are denied, just return cached data
  if (permissionDenied) {
    console.log('🔒 Using cache due to permission restrictions');
    return loadCache();
  }

  try {
    const userDocRef = doc(db, 'users', uid);
    
    // Set up real-time sync with enhanced error handling
    unsubscribeSnapshot = onSnapshot(
      userDocRef,
      {
        next: (doc) => {
          if (doc.exists()) {
            const data = doc.data() as AppState;
            console.log('🔄 Real-time data update received');
            cacheData(data);
            // Reset permission flag on successful read
            permissionDenied = false;
          }
        },
        error: (error) => {
          console.error('🔄 Real-time sync error:', error);
          
          // Handle permission errors
          if (error.code === 'permission-denied' || 
              error.message?.includes('Missing or insufficient permissions')) {
            
            if (!permissionDenied) {
              console.warn('🔒 Real-time sync disabled due to permission issues');
              permissionDenied = true;
              showPermissionAlert();
            }
          }
          
          // Don't throw error, just log it
        }
      }
    );

    // Try cache first for faster loading
    const cached = loadCache();
    if (cached) {
      console.log('⚡ Using cached data for immediate load');
      
      // Still try to load from Firestore in background (unless permissions denied)
      if (!permissionDenied) {
        setTimeout(async () => {
          try {
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
              const firestoreData = docSnap.data() as AppState;
              // Only update cache if Firestore data is newer
              const firestoreTime = firestoreData.clientTimestamp || 0;
              const cachedTime = cached.clientTimestamp || 0;
              
              if (firestoreTime > cachedTime) {
                console.log('🔄 Updated with newer Firestore data');
                cacheData(firestoreData);
              }
            }
          } catch (error: any) {
            if (error.code === 'permission-denied' || 
                error.message?.includes('Missing or insufficient permissions')) {
              if (!permissionDenied) {
                permissionDenied = true;
                showPermissionAlert();
              }
            }
            // Silently handle background load failures
          }
        }, 100);
      }
      
      return cached;
    }

    // Load from Firestore with retries
    const maxRetries = 3;
    let retries = 0;
    
    const attemptLoad = async (): Promise<AppState | null> => {
      try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as AppState;
          console.log('☁️ Loaded data from Firestore');
          cacheData(data);
          // Reset permission flag on successful read
          permissionDenied = false;
          return data;
        }
        console.log('📄 No document found in Firestore');
        return null;
      } catch (error: any) {
        console.error('☁️ Firestore load error:', error);
        
        // Handle permission errors
        if (error.code === 'permission-denied' || 
            error.message?.includes('Missing or insufficient permissions')) {
          
          if (!permissionDenied) {
            console.warn('🔒 Firestore access denied - using local storage only');
            permissionDenied = true;
            showPermissionAlert();
          }
          return loadCache();
        }
        
        // Handle network/temporary errors with retry
        if ((error.code === 'unavailable' || 
             error.code === 'deadline-exceeded' || 
             error.code === 'unauthenticated') && 
            retries < maxRetries) {
          
          retries++;
          const delay = Math.min(1000 * Math.pow(2, retries), 5000);
          console.log(`🔄 Retrying load in ${delay}ms... (attempt ${retries}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return attemptLoad();
        }
        
        throw error;
      }
    };
    
    return await attemptLoad();
    
  } catch (error: any) {
    console.error('💾 Error loading user data:', error);
    
    // Handle permission errors
    if (error.code === 'permission-denied' || 
        error.message?.includes('Missing or insufficient permissions')) {
      
      if (!permissionDenied) {
        permissionDenied = true;
        console.warn('🔒 Cloud sync disabled due to permission issues. Using local storage only.');
        showPermissionAlert();
      }
    }
    
    // Return cached data as fallback
    return loadCache();
  }
};

export const cleanup = () => {
  if (unsubscribeSnapshot) {
    unsubscribeSnapshot();
    unsubscribeSnapshot = null;
  }
  
  // Reset permission flags
  permissionDenied = false;
  permissionChecked = false;
  showedPermissionAlert = false;
  
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (e) {
    try {
      sessionStorage.removeItem(CACHE_KEY);
    } catch (e) {
      memoryCache = null;
    }
  }
  
  console.log('🧹 Firestore cleanup completed');
};

// Export function to check if cloud sync is available
export const isCloudSyncAvailable = (): boolean => {
  return !permissionDenied && !!db && !!auth.currentUser;
};

// Export function to retry cloud sync
export const retryCloudSync = () => {
  permissionDenied = false;
  showedPermissionAlert = false;
  console.log('🔄 Cloud sync retry enabled');
};