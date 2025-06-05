import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentSingleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDewpEed7Haz-Zxe_-dLOr7YNytaSdwNlg",
  authDomain: "login-19e25.firebaseapp.com",
  projectId: "login-19e25",
  storageBucket: "login-19e25.appspot.com",
  messagingSenderId: "314560100011",
  appId: "1:314560100011:web:abfc8275d7da9ad350a9ee"
};

// Initialize Firebase with memory management settings
const app = initializeApp({
  ...firebaseConfig,
  experimentalForceLongPolling: true,
  experimentalAutoDetectLongPolling: true
});

// Initialize Auth with session persistence for better mobile compatibility
export const auth = getAuth(app);
setPersistence(auth, browserSessionPersistence).catch((err) => {
  console.warn('Auth persistence failed:', err);
});

// Initialize Firestore with optimized settings for mobile
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager(),
    cacheSizeBytes: 5242880 // 5MB cache limit for mobile
  }),
  experimentalForceLongPolling: true,
  experimentalAutoDetectLongPolling: true
});

// Add connection state monitoring
db.enableNetwork().catch(console.error);