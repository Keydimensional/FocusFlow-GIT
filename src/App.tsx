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
import ReloadPromptBanner from './components/Auth/ReloadPromptBanner';

const AppContent: React.FC = () => {
  const { user, loading, showReloadPrompt, confirmReload } = useAuth();
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      if (!user.displayName || user.displayName.trim() === '') {
        const accountAge = Date.now() - new Date(user.metadata.creationTime || 0).getTime();
        const isNewUser = accountAge < 5 * 60 * 1000;
        const hasSkippedUsername = localStorage.getItem(`username_skipped_${user.uid}`);

        if (isNewUser || !hasSkippedUsername) {
          setShowUsernamePrompt(true);
        }
      }
    }
  }, [user, loading]);

  const handleUsernameComplete = () => {
    setShowUsernamePrompt(false);
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

 if (!user) {
  return (
    <>
      <Routes>
        <Route path="/finishSignIn" element={<FinishSignIn />} />
        <Route path="/signin" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route path="*" element={<Login />} />
      </Routes>
      {showReloadPrompt && <ReloadPromptBanner onConfirm={confirmReload} />}
    </>
  );
}


  return (
    <AppProvider>
      <Layout>
        <Dashboard />
      </Layout>
      <TutorialOverlayWrapper />
      {showUsernamePrompt && <UsernamePrompt onComplete={handleUsernameComplete} />}
      {showReloadPrompt && <ReloadPromptBanner onConfirm={confirmReload} />}
    </AppProvider>
  );
};

const TutorialOverlayWrapper: React.FC = () => {
  const { showTutorial, setShowTutorial } = useApp();
  return (
    <TutorialOverlay 
      forceShow={showTutorial}
      onComplete={() => setShowTutorial(false)}
    />
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;