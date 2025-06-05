import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { AppState } from '../types';

const CACHE_KEY = 'focusflow_cache';
let unsubscribeSnapshot: (() => void) | null = null;

// Cache data locally
const cacheData = (data: AppState) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      ...data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error caching data:', error);
  }
};

// Load cached data
const loadCache = (): AppState | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const data = JSON.parse(cached);
    const cacheAge = Date.now() - data.timestamp;
    
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
    
    // Update Firestore
    await setDoc(userDocRef, saveData, { merge: true });
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
    
    // Set up real-time sync
    unsubscribeSnapshot = onSnapshot(userDocRef, 
      (doc) => {
        if (doc.exists()) {
          const data = doc.data() as AppState;
          cacheData(data);
        }
      },
      (error) => {
        console.error('Error in real-time sync:', error);
      }
    );

    // Try loading from cache first
    const cached = loadCache();
    if (cached) {
      return cached;
    }

    // If no cache, load from Firestore
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as AppState;
      cacheData(data);
      return data;
    }

    return null;
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
  localStorage.removeItem(CACHE_KEY);
};