import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, connectAuthEmulator } from "firebase/auth";

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

// Simple Firestore initialization without complex caching
let db: any = null;
let dbInitialized = false;

const initializeFirestore = async () => {
  if (dbInitialized) return db;
  
  try {
    console.log('🔄 Initializing Firestore...');
    
    // Use simple getFirestore for better compatibility
    const { getFirestore, connectFirestoreEmulator } = await import('firebase/firestore');
    db = getFirestore(app);
    
    console.log('✅ Firestore initialized successfully');
    dbInitialized = true;
    return db;
    
  } catch (error) {
    console.error('❌ Failed to initialize Firestore:', error);
    db = null;
    dbInitialized = true;
    return null;
  }
};

// Export a function to get the database instance
export const getDb = async () => {
  if (!dbInitialized) {
    await initializeFirestore();
  }
  return db;
};

// Export db for backward compatibility
export { db };

// Initialize Firestore in background
initializeFirestore().catch(error => {
  console.error('Background Firestore initialization failed:', error);
});