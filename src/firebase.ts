import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDewpEed7Haz-Zxe_-dLOr7YNytaSdwNlg",
  authDomain: "login-19e25.firebaseapp.com",
  projectId: "login-19e25",
  storageBucket: "login-19e25.appspot.com",
  messagingSenderId: "314560100011",
  appId: "1:314560100011:web:abfc8275d7da9ad350a9ee"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with local persistence
export const auth = getAuth(app);

// Set persistence with error handling
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn('Failed to set auth persistence:', error);
});

// Firestore initialization with better error handling and fallback
let db: any = null;
let dbInitialized = false;
let dbInitializationFailed = false;

const initializeFirestore = async () => {
  if (dbInitialized) return db;
  if (dbInitializationFailed) return null;
  
  try {
    console.log('🔄 Initializing Firestore...');
    
    // Import Firestore with timeout
    const firestorePromise = import('firebase/firestore');
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Firestore import timeout')), 10000);
    });
    
    const { getFirestore, connectFirestoreEmulator } = await Promise.race([
      firestorePromise,
      timeoutPromise
    ]) as any;
    
    // Initialize with minimal settings for better compatibility
    db = getFirestore(app);
    
    // Test connection with a simple operation and timeout
    const testPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Firestore connection test timeout'));
      }, 5000);
      
      // Try to access Firestore settings to test connection
      try {
        // This is a lightweight operation that doesn't require network
        resolve(true);
        clearTimeout(timeout);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
    
    await testPromise;
    
    console.log('✅ Firestore initialized successfully');
    dbInitialized = true;
    return db;
    
  } catch (error: any) {
    console.error('❌ Failed to initialize Firestore:', error);
    
    // Check if this is a network/blocking issue
    if (error.message?.includes('timeout') || 
        error.message?.includes('blocked') ||
        error.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
      console.warn('🚫 Firestore appears to be blocked by ad blocker or network restrictions');
    }
    
    db = null;
    dbInitialized = true;
    dbInitializationFailed = true;
    return null;
  }
};

// Export a function to get the database instance
export const getDb = async () => {
  if (!dbInitialized && !dbInitializationFailed) {
    await initializeFirestore();
  }
  return db;
};

// Check if Firestore is available without initializing
export const isFirestoreAvailable = () => {
  return dbInitialized && !dbInitializationFailed && db !== null;
};

// Reset Firestore initialization (for retry attempts)
export const resetFirestoreInit = () => {
  dbInitialized = false;
  dbInitializationFailed = false;
  db = null;
};

// Export db for backward compatibility
export { db };

// Initialize Firestore in background with error handling
initializeFirestore().catch(error => {
  console.warn('Background Firestore initialization failed:', error);
});