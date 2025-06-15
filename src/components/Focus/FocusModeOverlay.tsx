import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ArrowRight, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface FocusModeOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const FocusModeOverlay: React.FC<FocusModeOverlayProps> = ({ 
  isVisible, 
  onComplete, 
  onSkip 
}) => {
  const { addFocus, addGoal, todaysFocus } = useApp();
  const [text, setText] = useState('');
  const [showGoalPrompt, setShowGoalPrompt] = useState(false);
  const [focusText, setFocusText] = useState('');

  // Check if user already has focus for today
  const hasTodaysFocus = todaysFocus && (() => {
    const today = new Date();
    const focusDate = new Date(todaysFocus.timestamp);
    return (
      today.getFullYear() === focusDate.getFullYear() &&
      today.getMonth() === focusDate.getMonth() &&
      today.getDate() === focusDate.getDate()
    );
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    addFocus(text.trim());
    setFocusText(text.trim());
    setText('');
    setShowGoalPrompt(true);
  };

  const handleAddGoal = () => {
    if (!focusText) return;
    
    addGoal({
      title: focusText,
      description: 'Added from Today\'s Focus',
      dueDate: new Date().toLocaleDateString('en-GB'),
    });
    setShowGoalPrompt(false);
    onComplete();
  };

  const handleSkipGoal = () => {
    setShowGoalPrompt(false);
    onComplete();
  };

  // Get appropriate greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning! 🌅';
    if (hour < 17) return 'Good afternoon! ☀️';
    return 'Good evening! 🌙';
  };

  // Get appropriate message based on whether user already has focus
  const getMessage = () => {
    if (hasTodaysFocus) {
      return "Ready to set a new focus for today?";
    }
    return "Let's start your day with intention. What's your main focus for today?";
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full"
          >
            {!showGoalPrompt ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{getGreeting()}</h2>
                  <p className="text-gray-600">
                    {getMessage()}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="focus-input" className="block text-sm font-medium text-gray-700 mb-2">
                      Today's Focus
                    </label>
                    <textarea
                      id="focus-input"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                      rows={3}
                      placeholder="e.g., Complete the project presentation, Exercise for 30 minutes, Call mom..."
                      autoFocus
                    />
                  </div>

                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs text-purple-700">
                      💡 <strong>Tip:</strong> Choose one meaningful task that will make the biggest impact on your day.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onSkip}
                      className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Skip for now
                    </button>
                    <button
                      type="submit"
                      disabled={!text.trim()}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                    >
                      Set Focus
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Focus Set! 🎯</h2>
                  <div className="bg-purple-50 p-3 rounded-lg mb-4">
                    <p className="text-purple-900 font-medium">"{focusText}"</p>
                  </div>
                  <p className="text-gray-600">
                    Would you like to track this as a goal to monitor your progress?
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSkipGoal}
                    className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    No thanks
                  </button>
                  <button
                    onClick={handleAddGoal}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Add as Goal
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};