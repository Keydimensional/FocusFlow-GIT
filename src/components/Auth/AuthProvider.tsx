import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import { saveUserData, loadUserData, cleanup, isCloudSyncAvailable, retryCloudSync } from '../../utils/firestore';
import { AppState } from '../../types';
import { loadState, clearUserData, clearAllBrowserData } from '../../utils/storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  syncUserData: (data: AppState) => Promise<void>;
  loadUserData: () => Promise<AppState | null>;
  isCloudSyncAvailable: () => boolean;
  retryCloudSync: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cloudSyncAvailable, setCloudSyncAvailable] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    console.log('🔐 Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(
      auth, 
      async (user) => {
        console.log('🔐 Auth state changed:', user ? `signed in as ${user.email}` : 'signed out');
        
        // CRITICAL: Only redirect if we're not already on auth pages and not currently signing out
        if (!user && !loading && !isSigningOut) {
          const currentPath = window.location.pathname;
          const isOnAuthPage = currentPath === '/signin' || 
                              currentPath === '/login' || 
                              currentPath === '/finishSignIn' ||
                              currentPath === '/';
          
          console.log('🔐 Current path:', currentPath, 'Is on auth page:', isOnAuthPage);
          
          // Only redirect if we're not already on an auth page
          if (!isOnAuthPage) {
            console.log('🔐 User signed out detected - initiating cleanup and redirect');
            
            // Clear all browser data immediately
            await clearAllBrowserData();
            
            // Force hard redirect to signin page
            console.log('🔐 Forcing hard redirect to /signin');
            window.location.href = '/signin';
            return;
          } else {
            console.log('🔐 Already on auth page, skipping redirect');
          }
        }
        
        setUser(user);
        
        if (user) {
          // Check cloud sync availability with timeout
          try {
            const checkSyncPromise = isCloudSyncAvailable();
            const timeoutPromise = new Promise<boolean>((resolve) => {
              setTimeout(() => resolve(false), 5000); // 5 second timeout
            });
            
            const available = await Promise.race([checkSyncPromise, timeoutPromise]);
            setCloudSyncAvailable(available);
            
            if (!available) {
              console.warn('⚠️ Cloud sync not available, using local storage');
            } else {
              console.log('✅ Cloud sync available');
            }
          } catch (error) {
            console.warn('⚠️ Could not check cloud sync availability:', error);
            setCloudSyncAvailable(false);
          }
        } else {
          setCloudSyncAvailable(false);
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
  }, [loading, isSigningOut]);

  const signOut = async () => {
    console.log('🔐 AUTH PROVIDER: Starting comprehensive sign out process...');
    
    // Prevent any further operations
    setIsSigningOut(true);
    setCloudSyncAvailable(false);
    
    try {
      // Get current user ID before signing out
      const currentUserId = user?.uid;
      console.log('🔐 AUTH PROVIDER: Current user ID:', currentUserId);
      
      // Step 1: Clear all user-specific data immediately
      if (currentUserId) {
        console.log('🧹 AUTH PROVIDER: Clearing user-specific data...');
        clearUserData(currentUserId);
      }
      
      // Step 2: Clear all browser storage completely
      console.log('🧹 AUTH PROVIDER: Clearing all browser storage...');
      await clearAllBrowserData();
      
      // Step 3: Clean up Firestore connections and cache
      console.log('🧹 AUTH PROVIDER: Cleaning up Firestore connections...');
      await cleanup();
      
      // Step 4: Sign out from Firebase (this clears the session)
      console.log('🔐 AUTH PROVIDER: Signing out from Firebase...');
      await auth.signOut();
      
      console.log('✅ AUTH PROVIDER: Firebase sign out completed');
      
      // Step 5: Force hard redirect to signin page
      console.log('🔐 AUTH PROVIDER: Forcing hard redirect to /signin');
      window.location.href = '/signin';
      
    } catch (error: any) {
      console.error('❌ AUTH PROVIDER: Sign out error:', error);
      
      // Even if there are errors, force cleanup and redirect
      try {
        await clearAllBrowserData();
        await cleanup();
      } catch (cleanupError) {
        console.error('❌ AUTH PROVIDER: Emergency cleanup error:', cleanupError);
      }
      
      // Force redirect regardless of errors
      console.warn('⚠️ AUTH PROVIDER: Sign out had errors, forcing emergency redirect');
      window.location.href = '/signin';
    }
  };

  const syncUserData = async (data: AppState) => {
    // CRITICAL: Don't sync if signing out
    if (isSigningOut) {
      console.log('🔐 Skipping sync - signing out');
      return;
    }
    
    if (!user) {
      console.warn('⚠️ Cannot sync data - user not authenticated');
      return;
    }
    
    try {
      await saveUserData(user.uid, data);
    } catch (error) {
      console.error('💾 Failed to sync user data:', error);
      // Don't throw error as local save should have succeeded
    }
  };

  const loadUserDataForUser = async (): Promise<AppState | null> => {
    // CRITICAL: Don't load if signing out
    if (isSigningOut) {
      console.log('🔐 Skipping load - signing out');
      return null;
    }
    
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
        return loadState(user.uid);
      }
    } catch (error) {
      console.error('❌ Failed to load user data:', error);
      return loadState(user.uid);
    }
  };

  const checkCloudSyncAvailable = () => {
    return cloudSyncAvailable && !!user && !loading && !isSigningOut;
  };

  const handleRetryCloudSync = async (): Promise<boolean> => {
    if (!user || isSigningOut) return false;
    
    try {
      const success = await retryCloudSync();
      
      if (success) {
        // Re-check availability after successful retry
        const available = await isCloudSyncAvailable();
        setCloudSyncAvailable(available);
        return available;
      }
      
      return false;
    } catch (error) {
      console.warn('⚠️ Cloud sync retry failed:', error);
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