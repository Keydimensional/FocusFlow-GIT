import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { AppProvider } from './context/AppContext';
import { TutorialOverlay } from './components/Tutorial/TutorialOverlay';
import { Login } from './components/Auth/Login';
import { FinishSignIn } from './components/Auth/FinishSignIn';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader2, AlertCircle } from 'lucide-react';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const maxRetries = 3;
    
    const initAuth = () => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Authentication timeout'));
        }, 10000); // 10 second timeout

        const unsubscribe = onAuthStateChanged(
          auth,
          (user) => {
            clearTimeout(timeout);
            unsubscribe();
            resolve(user);
          },
          (error) => {
            clearTimeout(timeout);
            unsubscribe();
            reject(error);
          }
        );
      });
    };

    const attemptAuth = async () => {
      try {
        const user = await initAuth();
        setUser(user);
        setLoading(false);
        setError(null);
      } catch (err: any) {
        console.error('Auth error:', err);
        if (retryCount < maxRetries) {
          setRetryCount(prev => prev + 1);
          setTimeout(attemptAuth, 1000 * (retryCount + 1));
        } else {
          setError(err.message || 'Authentication failed. Please try again.');
          setLoading(false);
        }
      }
    };

    attemptAuth();
  }, [retryCount]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm mx-4">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setRetryCount(0);
              setError(null);
              setLoading(true);
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/finishSignIn" element={<FinishSignIn />} />
        <Route
          path="/"
          element={
            user ? (
              <AppProvider>
                <Layout>
                  <Dashboard />
                  <TutorialOverlay />
                </Layout>
              </AppProvider>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;