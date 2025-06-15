import React, { useState } from 'react';
import { auth } from '../../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Lock, AlertCircle, User, ArrowLeft, CheckCircle, Brain, Heart, Target, ChevronDown } from 'lucide-react';
import { FeatureShowcase } from './FeatureShowcase';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Password reset states
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!username.trim()) {
          setError('Please enter a username.');
          return;
        }
        
        // Create account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update profile with username
        await updateProfile(userCredential.user, {
          displayName: username.trim()
        });
      } else {
        // Sign in
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      
      // Provide user-friendly error messages
      let errorMessage = 'Authentication failed. Please try again.';
      
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email. Please sign up first.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists. Please sign in instead.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters long.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        default:
          errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      
      let errorMessage = 'Failed to send password reset email. Please try again.';
      
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many requests. Please wait a moment before trying again.';
          break;
        default:
          errorMessage = err.message || errorMessage;
      }
      
      setResetError(errorMessage);
    } finally {
      setResetLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowPasswordReset(false);
    setResetEmail('');
    setResetError(null);
    setResetSuccess(false);
    setResetLoading(false);
  };

  const handleForgotPasswordClick = () => {
    setShowPasswordReset(true);
    setResetEmail(email); // Pre-fill with current email if available
    setError(null);
  };

  const scrollToContent = () => {
    const contentElement = document.getElementById('supporting-content');
    if (contentElement) {
      contentElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      {/* Main Login Section - Prominent and Centered */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full border-4 border-purple-200"
        >
          {/* Prominent Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">BrainBounce</h1>
            <p className="text-lg text-purple-600 font-medium">
              {isSignUp ? 'Join BrainBounce' : 'Welcome Back'}
            </p>
            <p className="text-sm text-gray-600 mt-2 px-2">
              <span className="sm:hidden">Neurodiverse-friendly productivity</span>
              <span className="hidden sm:inline">Neurodiverse-friendly productivity that actually works</span>
            </p>
          </div>

          <AnimatePresence mode="wait">
            {showPasswordReset ? (
              <motion.div
                key="password-reset"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {resetSuccess ? (
                  // Success State
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                    <p className="text-gray-600 mb-6">
                      We've sent a password reset link to <strong>{resetEmail}</strong>
                    </p>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-500">
                        Didn't receive the email? Check your spam folder or try again.
                      </p>
                      <button
                        onClick={() => {
                          setResetSuccess(false);
                          setResetError(null);
                        }}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                      >
                        Send another email
                      </button>
                    </div>
                    <button
                      onClick={handleBackToLogin}
                      className="mt-6 flex items-center gap-2 text-gray-600 hover:text-gray-700 mx-auto"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to login
                    </button>
                  </div>
                ) : (
                  // Reset Form
                  <div>
                    <div className="text-center mb-6">
                      <button
                        onClick={handleBackToLogin}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-700 mb-4"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to login
                      </button>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h2>
                      <p className="text-gray-600">
                        Enter your email address and we'll send you a link to reset your password.
                      </p>
                    </div>

                    <form onSubmit={handlePasswordReset} className="space-y-4">
                      <div>
                        <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="email"
                            id="reset-email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                            placeholder="you@example.com"
                            required
                            disabled={resetLoading}
                            autoFocus
                          />
                        </div>
                      </div>

                      {resetError && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                          <p className="text-red-700 text-sm">{resetError}</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={resetLoading || !resetEmail.trim()}
                        className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
                      >
                        {resetLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            Send Reset Email
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleAuth} className="space-y-6">
                  {isSignUp && (
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                          placeholder="Your display name"
                          required={isSignUp}
                          disabled={loading}
                          maxLength={50}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                        placeholder="you@example.com"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                        placeholder="••••••••"
                        required
                        disabled={loading}
                        minLength={6}
                      />
                    </div>
                    {isSignUp && (
                      <p className="text-xs text-gray-500 mt-1">
                        Password must be at least 6 characters long
                      </p>
                    )}
                  </div>

                  {/* Forgot Password Link - Only show for sign in */}
                  {!isSignUp && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleForgotPasswordClick}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                        disabled={loading}
                      >
                        Forgot your password?
                      </button>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold shadow-lg"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        {isSignUp ? 'Create Account' : 'Sign In'}
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(!isSignUp);
                          setError(null);
                          setUsername('');
                        }}
                        className="text-purple-600 hover:text-purple-700 font-medium underline"
                        disabled={loading}
                      >
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                      </button>
                    </p>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Prominent Pulsating Arrow - Between Sections */}
      <div className="relative -mt-32 mb-16 flex justify-center">
        <motion.button
          onClick={scrollToContent}
          className="relative z-10 bg-white rounded-full p-6 shadow-2xl border-4 border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-3xl group"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, type: "spring", stiffness: 300 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Pulsing background effect */}
          <motion.div
            className="absolute inset-0 bg-purple-100 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ 
              repeat: Infinity, 
              duration: 2,
              ease: "easeInOut"
            }}
          />
          
          {/* Main arrow with bounce animation */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ 
              repeat: Infinity, 
              duration: 2,
              ease: "easeInOut"
            }}
            className="relative z-10"
          >
            <ChevronDown className="w-8 h-8 text-purple-600 group-hover:text-purple-700 transition-colors" />
          </motion.div>
          
          {/* Tooltip */}
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-gray-800 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
              Explore features below
            </div>
          </div>
        </motion.button>
      </div>

      {/* Supporting Content Below */}
      <div id="supporting-content" className="max-w-6xl mx-auto pb-8 space-y-6 px-4">
        {/* Interactive Feature Showcase */}
        <div className="opacity-90">
          <FeatureShowcase />
        </div>

        {/* SEO Content for Google AdSense */}
        <div className="opacity-80">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-purple-600 mb-3 flex items-center justify-center gap-2">
                <Brain className="w-5 h-5" />
                BrainBounce – Neurodiverse-Friendly Productivity
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm">
                A supportive productivity tool designed specifically for neurodiverse minds. 
                Build focus habits, track your mood, and celebrate small wins with gentle accountability.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <Target className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-800 text-sm mb-1">Focus Tools</h3>
                <p className="text-gray-600 text-xs">
                  Customisable timers, daily intentions, and brain dump space for racing thoughts.
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <Heart className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-800 text-sm mb-1">Gentle Tracking</h3>
                <p className="text-gray-600 text-xs">
                  Mood monitoring, habit building through games, and progress celebration.
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4 text-center">
                <Brain className="w-5 h-5 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-800 text-sm mb-1">Neurodiverse-Designed</h3>
                <p className="text-gray-600 text-xs">
                  No guilt, flexible reminders, and dopamine-friendly design for neurodiverse brains.
                </p>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Join thousands using BrainBounce for neurodiverse-friendly productivity and executive function support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};