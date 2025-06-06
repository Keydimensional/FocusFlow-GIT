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

// Set persistence with error handling (no await at top level)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Failed to set auth persistence:', error);
});

// Initialize Firestore with lazy loading and error handling
let db: any = null;
let dbInitialized = false;
let dbInitPromise: Promise<any> | null = null;

const initializeFirestoreAsync = async () => {
  if (dbInitialized) return db;
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = (async () => {
    try {
      // Dynamic import to avoid top-level await
      const { initializeFirestore, persistentLocalCache, persistentSingleTabManager } = await import('firebase/firestore');
      
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentSingleTabManager({ forceOwnership: true })
        }),
        experimentalForceLongPolling: true,
      });
      
      console.log('✅ Firestore initialized with persistent cache');
    } catch (error) {
      console.error('Failed to initialize Firestore with persistent cache:', error);
      
      // Fallback to default initialization
      try {
        const { getFirestore } = await import('firebase/firestore');
        db = getFirestore(app);
        console.log('✅ Firestore initialized with fallback method');
      } catch (fallbackError) {
        console.error('Failed to initialize Firestore fallback:', fallbackError);
        db = null;
      }
    }
    
    dbInitialized = true;
    return db;
  })();

  return dbInitPromise;
};

// Export a function to get the database instance
export const getDb = async () => {
  if (!dbInitialized) {
    await initializeFirestoreAsync();
  }
  return db;
};

// Export db for backward compatibility, but it will be null initially
export { db };

// Initialize Firestore when the module loads (but don't await it)
initializeFirestoreAsync().catch(error => {
  console.error('Background Firestore initialization failed:', error);
});