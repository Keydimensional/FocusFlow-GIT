import React, { useEffect, useState } from 'react';
import { auth } from '../../firebase';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const FinishSignIn: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const completeSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = localStorage.getItem('emailForSignIn');
        
        if (!email) {
          email = window.prompt('Please provide your email for confirmation');
        }
        
        if (email) {
          try {
            await signInWithEmailLink(auth, email, window.location.href);
            localStorage.removeItem('emailForSignIn');
            console.log('Signed in as:', auth.currentUser?.email);
            navigate('/');
          } catch (err) {
            setError('Failed to complete sign in. The link may have expired.');
            console.error(err);
          }
        }
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
          <>
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={() => navigate('/login')}
              className="text-purple-600 hover:text-purple-700"
            >
              Return to login
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            <p className="text-gray-600">Completing your sign in...</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};