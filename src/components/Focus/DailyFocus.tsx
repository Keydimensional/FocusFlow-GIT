import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ArrowRight, Edit2 } from 'lucide-react';

export const DailyFocus: React.FC = () => {
  const { addFocus, todaysFocus, addGoal } = useApp();
  const [text, setText] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);
  const [showGoalPrompt, setShowGoalPrompt] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Check if the focus is from today - ONLY manually set focus counts
  const isFocusFromToday = () => {
    if (!todaysFocus || !todaysFocus.text || todaysFocus.text.trim() === '') {
      return false; // Empty focus doesn't count
    }
    
    const today = new Date();
    const focusDate = new Date(todaysFocus.timestamp);
    return (
      today.getFullYear() === focusDate.getFullYear() &&
      today.getMonth() === focusDate.getMonth() &&
      today.getDate() === focusDate.getDate()
    );
  };

  // Clear focus at midnight and check for daily reset
  useEffect(() => {
    const checkDate = () => {
      if (todaysFocus && !isFocusFromToday()) {
        // Clear old focus from previous days
        addFocus('');
      }
    };

    // Check immediately
    checkDate();

    // Calculate time until next midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    // Set timeout for midnight
    const timeout = setTimeout(checkDate, timeUntilMidnight);

    return () => clearTimeout(timeout);
  }, [todaysFocus, addFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    addFocus(text.trim());
    setText('');
    setIsEditing(false);
    setShowAnimation(true);
    setTimeout(() => {
      setShowAnimation(false);
      setShowGoalPrompt(true);
    }, 1500);
  };

  const handleEdit = () => {
    if (todaysFocus && todaysFocus.text) {
      setText(todaysFocus.text);
      setIsEditing(true);
    }
  };

  const handleAddGoal = () => {
    if (!todaysFocus || !todaysFocus.text) return;
    
    addGoal({
      title: todaysFocus.text,
      description: 'Added from Today\'s Focus',
      dueDate: new Date().toLocaleDateString('en-GB'),
    });
    setShowGoalPrompt(false);
  };

  const validFocus = todaysFocus && isFocusFromToday() && todaysFocus.text && todaysFocus.text.trim() !== '';

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-500" />
          Today's Focus
        </h2>
        {validFocus && !isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      {!validFocus || isEditing ? (
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-purple-900 font-medium mb-2">What's your main goal for today?</p>
            <p className="text-purple-700 text-sm">Focus on one important task that will make the biggest impact.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              rows={3}
              placeholder="e.g., Complete the project presentation"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setText('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                {isEditing ? 'Update Focus' : 'Set Focus'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {showGoalPrompt && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-purple-50 rounded-lg"
            >
              <p className="text-purple-900 mb-3">Would you like to track this focus as a goal?</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowGoalPrompt(false)}
                  className="px-3 py-1.5 text-gray-600 hover:text-gray-700"
                >
                  Skip
                </button>
                <button
                  onClick={handleAddGoal}
                  className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Add as Goal
                </button>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-purple-50 p-4 rounded-lg"
          >
            <p className="text-purple-900 font-medium">{todaysFocus.text}</p>
            <p className="text-sm text-purple-600 mt-2">
              Set at {new Date(todaysFocus.timestamp).toLocaleTimeString()}
            </p>
          </motion.div>
        </>
      )}

      <AnimatePresence>
        {showAnimation && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: -100 }}
              exit={{ y: -200, opacity: 0 }}
              className="text-6xl"
            >
              🎯
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};