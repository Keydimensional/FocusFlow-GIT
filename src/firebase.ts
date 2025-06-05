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
setPersistence(auth, browserLocalPersistence).catch(console.error);

// Initialize Firestore with persistent cache
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager({ forceOwnership: true })
  }),
  experimentalForceLongPolling: true,
});