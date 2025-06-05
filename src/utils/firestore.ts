import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { AppState } from '../types';
import debounce from 'lodash/debounce';

const CACHE_KEY = 'focusflow_cache';
let unsubscribeSnapshot: (() => void) | null = null;
let memoryCache: { data: AppState; timestamp: number } | null = null;

// Debounced save function
const debouncedSave = debounce(async (userDocRef: any, saveData: any) => {
  try {
    await setDoc(userDocRef, saveData, { merge: true });
  } catch (error) {
    console.error('Debounced save failed:', error);
    throw error;
  }
}, 1000);

const cacheData = (data: AppState) => {
  const cache = {
    data,
    timestamp: Date.now()
  };
  
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
  const MAX_CACHE_AGE = 3600000; // 1 hour
  
  try {
    const localData = localStorage.getItem(CACHE_KEY);
    if (localData) {
      const { data, timestamp } = JSON.parse(localData);
      if (Date.now() - timestamp < MAX_CACHE_AGE) return data;
    }
  } catch (e) {
    try {
      const sessionData = sessionStorage.getItem(CACHE_KEY);
      if (sessionData) {
        const { data, timestamp } = JSON.parse(sessionData);
        if (Date.now() - timestamp < MAX_CACHE_AGE) return data;
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
  try {
    const userDocRef = doc(db, 'users', uid);
    const saveData = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    
    // Update cache immediately
    cacheData(saveData);
    
    // Debounced Firestore update with retry logic
    const maxRetries = 3;
    let retries = 0;
    
    const attemptSave = async (): Promise<void> => {
      try {
        await debouncedSave(userDocRef, saveData);
      } catch (error) {
        console.error(`Save attempt ${retries + 1} failed:`, error);
        if (retries < maxRetries) {
          retries++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          return attemptSave();
        }
        throw error;
      }
    };
    
    await attemptSave();
  } catch (error) {
    console.error('Error saving user data:', error);
    // Ensure data is cached even if save fails
    cacheData(data);
  }
};

export const loadUserData = async (uid: string): Promise<AppState | null> => {
  if (unsubscribeSnapshot) {
    unsubscribeSnapshot();
  }

  try {
    const userDocRef = doc(db, 'users', uid);
    
    // Set up real-time sync with error handling
    unsubscribeSnapshot = onSnapshot(
      userDocRef,
      {
        next: (doc) => {
          if (doc.exists()) {
            const data = doc.data() as AppState;
            cacheData(data);
          }
        },
        error: (error) => {
          console.error('Real-time sync error:', error);
          const cached = loadCache();
          if (cached) cacheData(cached);
        }
      }
    );

    // Try cache first
    const cached = loadCache();
    if (cached) return cached;

    // Load from Firestore with retries
    const maxRetries = 3;
    let retries = 0;
    
    const attemptLoad = async (): Promise<AppState | null> => {
      try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as AppState;
          cacheData(data);
          return data;
        }
        return null;
      } catch (error) {
        console.error(`Load attempt ${retries + 1} failed:`, error);
        if (retries < maxRetries) {
          retries++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          return attemptLoad();
        }
        throw error;
      }
    };
    
    return await attemptLoad();
  } catch (error) {
    console.error('Error loading user data:', error);
    return loadCache();
  }
};

export const cleanup = () => {
  if (unsubscribeSnapshot) {
    unsubscribeSnapshot();
    unsubscribeSnapshot = null;
  }
  
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