import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import { saveUserData, loadUserData, cleanup, isCloudSyncAvailable, retryCloudSync } from '../../utils/firestore';
import { AppState } from '../../types';
import { loadState } from '../../utils/storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  syncUserData: (data: AppState) => Promise<void>;
  loadUserData: () => Promise<AppState | null>;
  isCloudSyncAvailable: () => boolean;
  retryCloudSync: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cloudSyncAvailable, setCloudSyncAvailable] = useState(false);

  useEffect(() => {
    console.log('🔐 Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(
      auth, 
      async (user) => {
        console.log('🔐 Auth state changed:', user ? `signed in as ${user.email}` : 'signed out');
        setUser(user);
        
        if (user) {
          // Check cloud sync availability
          try {
            const available = await isCloudSyncAvailable();
            setCloudSyncAvailable(available);
          } catch (error) {
            console.warn('⚠️ Could not check cloud sync availability:', error);
            setCloudSyncAvailable(false);
          }
        } else {
          setCloudSyncAvailable(false);
          cleanup();
        }
        
        setLoading(false);
      },
      (error) => {
        console.error('🔐 Auth state change error:', error);
        setLoading(false);
        setCloudSyncAvailable(false);
      }
    );

    return () => {
      console.log('🔐 Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('🔐 Signing out user');
      await auth.signOut();
      cleanup();
      setCloudSyncAvailable(false);
      console.log('✅ Sign out successful');
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      // Clean up local state even if sign out fails
      cleanup();
      setCloudSyncAvailable(false);
    }
  };

  const syncUserData = async (data: AppState) => {
    if (!user) {
      console.warn('⚠️ Cannot sync data - user not authenticated');
      return;
    }
    
    try {
      await saveUserData(user.uid, data);
    } catch (error) {
      console.error('💾 Failed to sync user data:', error);
    }
  };

  const loadUserDataForUser = async (): Promise<AppState | null> => {
    if (!user) {
      console.warn('⚠️ Cannot load user data - user not authenticated');
      return loadState();
    }
    
    try {
      const userData = await loadUserData(user.uid);
      if (userData) {
        console.log('✅ User data loaded successfully');
        return userData;
      } else {
        console.log('📱 No cloud data found, using local storage');
        return loadState();
      }
    } catch (error) {
      console.error('❌ Failed to load user data:', error);
      return loadState();
    }
  };

  const checkCloudSyncAvailable = () => {
    return cloudSyncAvailable && !!user && !loading;
  };

  const handleRetryCloudSync = async () => {
    retryCloudSync();
    
    if (user) {
      try {
        const available = await isCloudSyncAvailable();
        setCloudSyncAvailable(available);
      } catch (error) {
        console.warn('⚠️ Cloud sync retry failed:', error);
        setCloudSyncAvailable(false);
      }
    }
  };

  const value = {
    user,
    loading,
    signOut,
    syncUserData,
    loadUserData: loadUserDataForUser,
    isCloudSyncAvailable: checkCloudSyncAvailable,
    retryCloudSync: handleRetryCloudSync
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};