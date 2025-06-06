import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentSingleTabManager } from "firebase/firestore";

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
  console.error('Failed to set auth persistence:', error);
});

// Initialize Firestore with persistent cache and error handling
let db: any;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentSingleTabManager({ forceOwnership: true })
    }),
    experimentalForceLongPolling: true,
  });
} catch (error) {
  console.error('Failed to initialize Firestore with persistent cache:', error);
  // Fallback to default initialization
  try {
    const { getFirestore } = await import('firebase/firestore');
    db = getFirestore(app);
  } catch (fallbackError) {
    console.error('Failed to initialize Firestore fallback:', fallbackError);
  }
}

export { db };