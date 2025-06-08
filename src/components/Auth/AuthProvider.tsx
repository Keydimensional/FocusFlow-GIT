import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import {
  saveUserData,
  loadUserData,
  cleanup,
  isCloudSyncAvailable,
  retryCloudSync,
} from '../../utils/firestore';
import { AppState } from '../../types';
import {
  loadState,
  clearUserData,
  clearAllBrowserData,
} from '../../utils/storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  syncUserData: (data: AppState) => Promise<void>;
  loadUserData: () => Promise<AppState | null>;
  isCloudSyncAvailable: () => boolean;
  retryCloudSync: () => Promise<boolean>;
  showReloadPrompt: boolean;
  confirmReload: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

if (typeof window !== 'undefined') {
  localStorage.removeItem('preventAutoReauth');
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cloudSyncAvailable, setCloudSyncAvailable] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showReloadPrompt, setShowReloadPrompt] = useState(false);

  useEffect(() => {
    const preventAutoReauth = localStorage.getItem('preventAutoReauth') === 'true';

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (preventAutoReauth || isSigningOut) return;

      const currentPath = window.location.pathname;
      const isOnAuthPage = ['/signin', '/login', '/finishSignIn', '/'].includes(currentPath);

      if (!user && !loading && !isOnAuthPage) {
        await clearAllBrowserData();
        window.location.href = '/signin';
        return;
      }

      setUser(user);

      if (user) {
        try {
          const checkSyncPromise = isCloudSyncAvailable();
          const timeoutPromise = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 5000));
          const available = await Promise.race([checkSyncPromise, timeoutPromise]);
          setCloudSyncAvailable(available);
        } catch {
          setCloudSyncAvailable(false);
        }
      } else {
        setCloudSyncAvailable(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [loading, isSigningOut]);

  const signOut = async () => {
    console.log('🚪 Starting sign out process...');
    setIsSigningOut(true);
    setCloudSyncAvailable(false);

    try {
      const currentUserId = user?.uid;
      if (currentUserId) clearUserData(currentUserId);

      await clearAllBrowserData();
      await cleanup();
      await auth.signOut();

      const deleteIndexedDB = (name: string) => new Promise<void>((resolve) => {
        const tryDelete = (attempts = 5) => {
          const deleteRequest = indexedDB.deleteDatabase(name);
          deleteRequest.onsuccess = () => resolve();
          deleteRequest.onerror = () => resolve();
          deleteRequest.onblocked = () => {
            if (attempts > 0) setTimeout(() => tryDelete(attempts - 1), 250);
            else resolve();
          };
        };
        tryDelete();
      });

      await deleteIndexedDB('firebaseLocalStorageDb');
      await deleteIndexedDB('firebase-heartbeat-database');

      localStorage.setItem('preventAutoReauth', 'true');
      
      console.log('✅ Sign out completed, showing reload prompt');
      setShowReloadPrompt(true);
      
    } catch (error) {
      console.error('❌ Sign out error:', error);
      await clearAllBrowserData();
      await cleanup();
      window.location.href = '/signin';
    }
  };

  const confirmReload = () => {
    console.log('🔄 User confirmed reload');
    window.location.reload();
  };

  const syncUserData = async (data: AppState) => {
    if (isSigningOut || !user) return;
    try {
      await saveUserData(user.uid, data);
    } catch {
      // error ignored
    }
  };

  const loadUserDataForUser = async (): Promise<AppState | null> => {
    if (isSigningOut) return null;
    if (!user) return loadState();
    try {
      const userData = await loadUserData(user.uid);
      return userData || loadState(user.uid);
    } catch {
      return loadState(user.uid);
    }
  };

  const checkCloudSyncAvailable = () => cloudSyncAvailable && !!user && !loading && !isSigningOut;

  const handleRetryCloudSync = async (): Promise<boolean> => {
    if (!user || isSigningOut) return false;
    try {
      await retryCloudSync();
      const available = await isCloudSyncAvailable();
      setCloudSyncAvailable(available);
      return available;
    } catch {
      setCloudSyncAvailable(false);
      return false;
    }
  };

  const value = {
    user,
    loading,
    signOut,
    syncUserData,
    loadUserData: loadUserDataForUser,
    isCloudSyncAvailable: checkCloudSyncAvailable,
    retryCloudSync: handleRetryCloudSync,
    showReloadPrompt,
    confirmReload,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};