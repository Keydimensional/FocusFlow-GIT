import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { Login } from './components/Auth/Login';
import { FinishSignIn } from './components/Auth/FinishSignIn';
import { UsernamePrompt } from './components/Auth/UsernamePrompt';
import { AuthProvider, useAuth } from './components/Auth/AuthProvider';
import { AppProvider, useApp } from './context/AppContext';
import { TutorialOverlay } from './components/Tutorial/TutorialOverlay';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);

  // Check if new user needs username setup
  useEffect(() => {
    if (user && !loading) {
      // Check if user has a display name
      if (!user.displayName || user.displayName.trim() === '') {
        // Check if this is a new user (account created recently)
        const accountAge = Date.now() - new Date(user.metadata.creationTime || 0).getTime();
        const isNewUser = accountAge < 5 * 60 * 1000; // 5 minutes
        
        // Also check if user has never set a username before
        const hasSkippedUsername = localStorage.getItem(`username_skipped_${user.uid}`);
        
        if (isNewUser || !hasSkippedUsername) {
          setShowUsernamePrompt(true);
        }
      }
    }
  }, [user, loading]);

  const handleUsernameComplete = () => {
    setShowUsernamePrompt(false);
    
    // Mark that username setup was completed/skipped for this user
    if (user) {
      localStorage.setItem(`username_skipped_${user.uid}`, 'true');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="text-gray-600">Loading BrainBounce...</p>
        </div>
      </div>
    );
  }

  // CRITICAL: If no user, show login/auth routes only - no redirects here
  if (!user) {
    return (
      <Routes>
        <Route path="/finishSignIn" element={<FinishSignIn />} />
        <Route path="/signin" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // User is authenticated, show main app
  return (
    <AppProvider>
      <AppContentWithTutorial />
      
      {showUsernamePrompt && (
        <UsernamePrompt onComplete={handleUsernameComplete} />
      )}
    </AppProvider>
  );
};

// Separate component to access AppContext
const AppContentWithTutorial: React.FC = () => {
  const { showTutorial, setShowTutorial } = useApp();

  return (
    <>
      <Layout>
        <Dashboard />
      </Layout>
      
      {/* Tutorial Overlay - now properly connected to global state */}
      <TutorialOverlay 
        forceShow={showTutorial}
        onComplete={() => {
          console.log('🎓 Tutorial completed');
          setShowTutorial(false);
        }}
      />
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;