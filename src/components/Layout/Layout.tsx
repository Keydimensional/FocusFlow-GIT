import React, { useState, useRef, useEffect } from 'react';
import { SunMedium, Settings, LogOut, User, ChevronDown, AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { SettingsModal } from '../Settings/SettingsModal';
import { HeroSection } from './HeroSection';
import { useAuth } from '../Auth/AuthProvider';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const { user, signOut } = useAuth();
  const { isCloudSyncAvailable, retryCloudSync, dataLoadError, retryDataLoad } = useApp();
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowAccountMenu(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getDisplayName = () => {
    if (user?.displayName) {
      return user.displayName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <SunMedium className="h-6 w-6 text-yellow-500 mr-2" />
              <h1 className="text-xl font-semibold text-gray-800">BrainBounce</h1>
              
              {/* Cloud sync status indicator */}
              {user && (
                <div className="ml-3 flex items-center">
                  {isCloudSyncAvailable ? (
                    <div className="flex items-center text-green-600\" title="Cloud sync active">
                      <Wifi className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-400" title="Local storage only">
                      <WifiOff className="w-4 h-4" />
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {user && (
              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-medium text-sm">
                    {getInitials()}
                  </div>
                  <span className="hidden sm:inline font-medium">{getDisplayName()}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showAccountMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.1 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-medium">
                            {getInitials()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{getDisplayName()}</p>
                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {isCloudSyncAvailable ? (
                                <>
                                  <Wifi className="w-3 h-3 text-green-600" />
                                  <span className="text-xs text-green-600">Cloud sync active</span>
                                </>
                              ) : (
                                <>
                                  <WifiOff className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">Local storage only</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-1">
                        {!isCloudSyncAvailable && (
                          <button
                            onClick={() => {
                              retryCloudSync();
                              setShowAccountMenu(false);
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Retry Cloud Sync
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            setShowSettings(true);
                            setShowAccountMenu(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Dashboard Settings
                        </button>
                        
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Data load error banner */}
      {dataLoadError && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-yellow-800">{dataLoadError}</span>
              </div>
              <button
                onClick={retryDataLoad}
                className="flex items-center gap-1 px-3 py-1 text-sm text-yellow-700 hover:text-yellow-800 hover:bg-yellow-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          </div>
        </div>
      )}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <HeroSection />
        {children}
      </main>
      
      <footer className="text-center text-sm text-gray-600 py-4">
        <p>Optimised for your wellbeing</p>
      </footer>

      {/* Settings button - only show if account menu is not visible */}
      {!showAccountMenu && (
        <button
          onClick={() => setShowSettings(true)}
          className="fixed bottom-6 right-6 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 text-gray-600 hover:text-purple-600"
        >
          <Settings className="w-6 h-6" />
        </button>
      )}

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
};