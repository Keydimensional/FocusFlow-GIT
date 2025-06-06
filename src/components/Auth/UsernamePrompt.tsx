import React, { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { motion } from 'framer-motion';
import { User, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface UsernamePromptProps {
  onComplete: () => void;
}

export const UsernamePrompt: React.FC<UsernamePromptProps> = ({ onComplete }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !user) return;

    setLoading(true);
    setError(null);

    try {
      await updateProfile(user, {
        displayName: username.trim()
      });
      
      console.log('✅ Username set successfully:', username.trim());
      onComplete();
    } catch (err: any) {
      console.error('❌ Failed to set username:', err);
      setError('Failed to set username. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    console.log('⏭️ Username setup skipped');
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to BrainBounce!</h2>
          <p className="text-gray-600">
            Let's set up your profile. What would you like to be called?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Your name or nickname"
                disabled={loading}
                maxLength={50}
                autoFocus
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This is how you'll appear in the app. You can change it later.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={!username.trim() || loading}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleSkip}
              disabled={loading}
              className="w-full text-gray-600 hover:text-gray-700 py-2 px-4 text-sm transition-colors disabled:opacity-50"
            >
              Skip for now
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};