import React, { useEffect, useState } from 'react';
import { auth } from '../../firebase';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';

export const FinishSignIn: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const completeSignIn = async () => {
      try {
        // Check if this is a sign-in link
        const isSignInLink = isSignInWithEmailLink(auth, window.location.href);
        setDebugInfo(prev => prev + `\nIs sign-in link: ${isSignInLink}`);

        if (!isSignInLink) {
          setError('Invalid sign-in link. Please request a new one.');
          return;
        }

        // Get email from storage
        let email = localStorage.getItem('emailForSignIn');
        setDebugInfo(prev => prev + `\nStored email: ${email || 'none'}`);

        if (!email) {
          email = window.prompt('Please provide your email for confirmation');
          setDebugInfo(prev => prev + `\nPrompted email: ${email || 'none'}`);
        }

        if (!email) {
          setError('Email is required to complete sign in.');
          return;
        }

        // Attempt sign in
        setDebugInfo(prev => prev + '\nAttempting sign in...');
        await signInWithEmailLink(auth, email, window.location.href);
        
        // Clear email from storage
        localStorage.removeItem('emailForSignIn');
        
        // Log success and redirect
        setDebugInfo(prev => prev + `\nSigned in successfully as: ${auth.currentUser?.email}`);
        navigate('/');
      } catch (err: any) {
        console.error('Sign in error:', err);
        setDebugInfo(prev => prev + `\nError: ${err.message}`);
        setError(err.message || 'Failed to complete sign in. The link may have expired.');
      }
    };

    completeSignIn();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center"
      >
        {error ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center text-red-600 mb-2">
              <AlertCircle className="w-6 h-6 mr-2" />
              <span>Authentication Error</span>
            </div>
            <p className="text-red-600">{error}</p>
            {process.env.NODE_ENV === 'development' && (
              <pre className="mt-4 p-4 bg-gray-100 rounded-lg text-left text-xs overflow-auto">
                Debug Info:{debugInfo}
              </pre>
            )}
            <button
              onClick={() => navigate('/login')}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            <p className="text-gray-600">Completing your sign in...</p>
            {process.env.NODE_ENV === 'development' && (
              <pre className="mt-4 p-4 bg-gray-100 rounded-lg text-left text-xs overflow-auto">
                Debug Info:{debugInfo}
              </pre>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};