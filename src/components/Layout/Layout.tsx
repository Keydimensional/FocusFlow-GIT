import React, { useState, useRef, useEffect } from 'react';
import {
  SunMedium,
  Settings,
  LogOut,
  User,
  ChevronDown,
  AlertTriangle,
  RefreshCw,
  Wifi,
  WifiOff,
  Clock,
  MessageSquare,
  Smartphone,
  Shield
} from 'lucide-react';
import { SettingsModal } from '../Settings/SettingsModal';
import { HeroSection } from './HeroSection';
import { SEOContent } from './SEOContent';
import { ToastNotification } from './ToastNotification';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { useAuth } from '../Auth/AuthProvider';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { setToastHandler, getRetryQueueSize } from '../../utils/firestore';
import ReloadPromptBanner from '../Auth/ReloadPromptBanner';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [retryQueueSize, setRetryQueueSize] = useState(0);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showLocalReloadPrompt, setShowLocalReloadPrompt] = useState(false);
  const {
    user,
    signOut,
    loading: authLoading,
    showReloadPrompt: authReloadPrompt,
    confirmReload
  } = useAuth();
  const { isCloudSyncAvailable, retryCloudSync, dataLoadError, retryDataLoad } = useApp();
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateQueueSize = () => {
      setRetryQueueSize(getRetryQueueSize());
    };
    updateQueueSize();
    const interval = setInterval(updateQueueSize, 5000);
    return () => clearInterval(interval);
  }, []);

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
    if (isSigningOut || authLoading) return;
    
    console.log('🚪 Sign out button clicked - showing banner immediately');
    setIsSigningOut(true);
    setShowAccountMenu(false);
    
    // Show the reload prompt banner immediately
    setShowLocalReloadPrompt(true);
    
    try {
      await signOut();
      console.log('✅ Sign out completed');
    } catch (error) {
      console.error('❌ Sign out failed:', error);
      setIsSigningOut(false);
      setShowLocalReloadPrompt(false);
    }
  };

  const handleConfirmReload = () => {
    console.log('🔄 User confirmed reload from layout');
    window.location.reload();
  };

  const getDisplayName = () => user?.displayName || user?.email?.split('@')[0] || 'User';
  const getInitials = () => getDisplayName().charAt(0).toUpperCase();

  const getSyncStatusInfo = () => {
    if (!user) return { icon: null, text: '', color: '' };
    if (retryQueueSize > 0) {
      return { icon: <Clock className="w-4 h-4" />, text: `${retryQueueSize} pending sync${retryQueueSize > 1 ? 's' : ''}`, color: 'text-yellow-600' };
    }
    if (isCloudSyncAvailable) {
      return { icon: <Wifi className="w-4 h-4" />, text: 'Cloud sync active', color: 'text-green-600' };
    }
    return { icon: <WifiOff className="w-4 h-4" />, text: 'Local storage only', color: 'text-gray-400' };
  };

  const syncStatus = getSyncStatusInfo();

  // Show reload prompt if either local state or auth state indicates it should be shown
  const shouldShowReloadPrompt = showLocalReloadPrompt || authReloadPrompt;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <ToastNotification onToastHandler={setToastHandler} />

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <SunMedium className="h-6 w-6 text-yellow-500 mr-2" />
              <h1 className="text-xl font-semibold text-gray-800">BrainBounce</h1>
              {user && syncStatus.icon && (
                <div className={`ml-3 flex items-center ${syncStatus.color}`} title={syncStatus.text}>
                  {syncStatus.icon}
                  {retryQueueSize > 0 && (
                    <span className="ml-1 text-xs font-medium">{retryQueueSize}</span>
                  )}
                </div>
              )}
            </div>
            {user && (
              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  disabled={isSigningOut || authLoading}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                              {syncStatus.icon && (
                                <>
                                  <span className={syncStatus.color}>{syncStatus.icon}</span>
                                  <span className={`text-xs ${syncStatus.color}`}>{syncStatus.text}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="py-1">
                        {(!isCloudSyncAvailable || retryQueueSize > 0) && (
                          <button
                            onClick={() => { retryCloudSync(); setShowAccountMenu(false); }}
                            disabled={isSigningOut || authLoading}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
                          >
                            <RefreshCw className="w-4 h-4" />
                            {retryQueueSize > 0 ? `Retry Sync (${retryQueueSize} pending)` : 'Retry Cloud Sync'}
                          </button>
                        )}
                        <button
                          onClick={() => { setShowSettings(true); setShowAccountMenu(false); }}
                          disabled={isSigningOut || authLoading}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          <Settings className="w-4 h-4" />
                          Dashboard Settings
                        </button>
                        <button
                          onClick={handleSignOut}
                          disabled={isSigningOut || authLoading}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          <LogOut className="w-4 h-4" />
                          {isSigningOut ? 'Signing out...' : 'Sign Out'}
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
                disabled={authLoading}
                className="flex items-center gap-1 px-3 py-1 text-sm text-yellow-700 hover:text-yellow-800 hover:bg-yellow-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Show SEO content only for unauthenticated users */}
        {!user && <SEOContent />}
        
        {/* Show hero section for authenticated users */}
        {user && <HeroSection />}
        
        {children}
      </main>

      <footer className="text-center text-sm text-gray-600 py-6 space-y-3 border-t border-gray-200 bg-white/50">
        <p>Optimised for your wellbeing</p>
        <div className="flex items-center justify-center gap-1 text-xs text-purple-600 bg-purple-50 rounded-full px-3 py-1 mx-auto w-fit">
          <Smartphone className="w-3 h-3" />
          <span>Pick up where you left off on any device</span>
        </div>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <a
            href="https://forms.gle/jFwJcs5AgTe3vSsJ8"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Feature Request
          </a>
          <button
            onClick={() => setShowPrivacyPolicy(true)}
            className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Shield className="w-3 h-3" />
            Privacy Policy
          </button>
        </div>
      </footer>

      {!isSigningOut && !showAccountMenu && (
        <button
          onClick={() => setShowSettings(true)}
          disabled={authLoading}
          className="fixed bottom-6 right-6 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 text-gray-600 hover:text-purple-600 disabled:opacity-50"
        >
          <Settings className="w-6 h-6" />
        </button>
      )}

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showPrivacyPolicy && <PrivacyPolicyModal onClose={() => setShowPrivacyPolicy(false)} />}
      
      {/* Reload Prompt Banner - Show if either local or auth state indicates it should be shown */}
      {shouldShowReloadPrompt && (
        <ReloadPromptBanner 
          onConfirm={authReloadPrompt ? confirmReload : handleConfirmReload} 
        />
      )}
    </div>
  );
};