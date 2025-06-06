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

  useEffect(() => {
    console.log('🔐 Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(
      auth, 
      (user) => {
        console.log('🔐 Auth state changed:', user ? `signed in as ${user.email}` : 'signed out');
        setUser(user);
        setLoading(false);
        
        if (!user) {
          // Clean up when user signs out
          cleanup();
        }
      },
      (error) => {
        console.error('🔐 Auth state change error:', error);
        setLoading(false);
        
        // Show user-friendly error message
        if (error.code === 'auth/network-request-failed') {
          console.warn('⚠️ Network error during authentication. App will work offline.');
        }
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
      console.log('✅ Sign out successful');
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      
      // Even if sign out fails, clean up local state
      cleanup();
      
      // Show user-friendly error
      if (error.code === 'auth/network-request-failed') {
        console.warn('⚠️ Network error during sign out. Local session cleared.');
      }
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
      // Don't throw error to prevent app crashes
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
      // Fallback to local storage
      return loadState();
    }
  };

  const value = {
    user,
    loading,
    signOut,
    syncUserData,
    loadUserData: loadUserDataForUser,
    isCloudSyncAvailable,
    retryCloudSync
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