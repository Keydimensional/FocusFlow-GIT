import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { AppState } from '../types';

const CACHE_KEY = 'focusflow_cache';
let unsubscribeSnapshot: (() => void) | null = null;

// Cache data locally with fallback for private browsing
const cacheData = (data: AppState) => {
  try {
    const cache = {
      data,
      timestamp: Date.now()
    };
    
    // Try localStorage first
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
      // If localStorage fails, try sessionStorage
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    }
  } catch (error) {
    console.error('Error caching data:', error);
  }
};

// Load cached data with fallback
const loadCache = (): AppState | null => {
  try {
    let cached: string | null = null;
    
    // Try localStorage first
    try {
      cached = localStorage.getItem(CACHE_KEY);
    } catch (e) {
      // If localStorage fails, try sessionStorage
      cached = sessionStorage.getItem(CACHE_KEY);
    }
    
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const cacheAge = Date.now() - timestamp;
    
    // Only use cache if it's less than 1 hour old
    return cacheAge < 3600000 ? data : null;
  } catch (error) {
    console.error('Error loading cache:', error);
    return null;
  }
};

export const saveUserData = async (uid: string, data: AppState): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const saveData = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    
    // Update cache
    cacheData(saveData);
    
    // Update Firestore with retry logic
    const maxRetries = 3;
    let retries = 0;
    
    const attemptSave = async (): Promise<void> => {
      try {
        await setDoc(userDocRef, saveData, { merge: true });
      } catch (error) {
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
    // Fallback to cache
    cacheData(data);
  }
};

export const loadUserData = async (uid: string): Promise<AppState | null> => {
  // Unsubscribe from any existing snapshot listener
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
          console.error('Error in real-time sync:', error);
          // On error, fall back to cache
          const cached = loadCache();
          if (cached) {
            cacheData(cached);
          }
        }
      }
    );

    // Try loading from cache first
    const cached = loadCache();
    if (cached) {
      return cached;
    }

    // If no cache, load from Firestore with retry logic
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
    return loadCache(); // Fallback to cache
  }
};

// Cleanup function to be called when user logs out
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
      console.warn('Failed to clean up cache');
    }
  }
};