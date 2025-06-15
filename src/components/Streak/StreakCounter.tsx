import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, Trophy, Crown, Star, Zap, Target, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../Auth/AuthProvider';
import { getUserStorageKey } from '../../utils/storage';

const getStreakMilestone = (streak: number) => {
  if (streak >= 70) return { level: 'legendary', icon: Crown, color: 'text-purple-600', bg: 'bg-purple-100', title: 'Legendary Streak!', message: 'You\'re unstoppable! 🏆' };
  if (streak >= 49) return { level: 'champion', icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-100', title: 'Champion Level!', message: 'Incredible dedication! 🌟' };
  if (streak >= 35) return { level: 'master', icon: Star, color: 'text-blue-600', bg: 'bg-blue-100', title: 'Master Streak!', message: 'You\'re on fire! 🔥' };
  if (streak >= 21) return { level: 'expert', icon: Zap, color: 'text-green-600', bg: 'bg-green-100', title: 'Expert Level!', message: 'Amazing consistency! ⚡' };
  if (streak >= 14) return { level: 'advanced', icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-100', title: 'Advanced Streak!', message: 'Two weeks strong! 🎯' };
  if (streak >= 10) return { level: 'committed', icon: Flame, color: 'text-orange-600', bg: 'bg-orange-100', title: 'Committed!', message: 'Double digits! 🔥' };
  if (streak >= 7) return { level: 'building', icon: Flame, color: 'text-red-500', bg: 'bg-red-100', title: 'Building Momentum!', message: 'One week down! 📈' };
  if (streak >= 3) return { level: 'started', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-100', title: 'Getting Started!', message: 'Keep it up! 🌱' };
  return { level: 'beginning', icon: Flame, color: 'text-gray-500', bg: 'bg-gray-100', title: 'Start Your Journey', message: 'Every expert was once a beginner! 💪' };
};

const getNextMilestone = (streak: number) => {
  const milestones = [3, 7, 10, 14, 21, 35, 49, 70];
  return milestones.find(milestone => milestone > streak) || null;
};

export const StreakCounter: React.FC = () => {
  const { streak, lastCheckIn } = useApp();
  const { user } = useAuth();
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastCelebratedStreak, setLastCelebratedStreak] = useState(0);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [hasShownEncouragementToday, setHasShownEncouragementToday] = useState(false);
  
  const milestone = getStreakMilestone(streak);
  const nextMilestone = getNextMilestone(streak);
  const IconComponent = milestone.icon;

  // Check for missed days and show encouragement
  useEffect(() => {
    if (!user || !lastCheckIn || hasShownEncouragementToday) return;

    const checkForMissedDays = () => {
      const today = new Date();
      const lastCheck = new Date(lastCheckIn.split('/').reverse().join('-'));
      const daysDiff = Math.floor((today.getTime() - lastCheck.getTime()) / (1000 * 60 * 60 * 24));
      
      // If user missed a day (gap of 2+ days), show encouragement
      if (daysDiff >= 2) {
        const encouragementKey = getUserStorageKey('encouragementShown', user.uid);
        const lastEncouragementDate = localStorage.getItem(encouragementKey);
        const todayString = today.toDateString();
        
        // Only show once per day
        if (lastEncouragementDate !== todayString) {
          console.log('💝 Showing encouragement for missed day');
          setShowEncouragement(true);
          localStorage.setItem(encouragementKey, todayString);
          setHasShownEncouragementToday(true);
          
          // Auto-hide after 8 seconds
          setTimeout(() => {
            setShowEncouragement(false);
          }, 8000);
        }
      }
    };

    // Check after a short delay
    const timer = setTimeout(checkForMissedDays, 2000);
    return () => clearTimeout(timer);
  }, [user, lastCheckIn, hasShownEncouragementToday]);

  // Check for milestone achievements
  useEffect(() => {
    const milestones = [3, 7, 10, 14, 21, 35, 49, 70];
    const shouldCelebrate = milestones.includes(streak) && streak > lastCelebratedStreak;
    
    if (shouldCelebrate) {
      setShowCelebration(true);
      setLastCelebratedStreak(streak);
      
      // Auto-hide celebration after 3 seconds
      setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
    }
  }, [streak, lastCelebratedStreak]);

  const getProgressToNext = () => {
    if (!nextMilestone) return 100;
    const previousMilestone = [0, 3, 7, 10, 14, 21, 35, 49].find((m, i, arr) => arr[i + 1] === nextMilestone) || 0;
    return ((streak - previousMilestone) / (nextMilestone - previousMilestone)) * 100;
  };

  const getEncouragementMessage = () => {
    if (streak === 0) return "Start your journey today! Check in to begin building your streak.";
    if (streak === 1) return "Great start! Come back tomorrow to keep it going.";
    if (streak === 2) return "Two days in a row! You're building a habit.";
    if (nextMilestone) {
      const daysLeft = nextMilestone - streak;
      return `${daysLeft} more day${daysLeft > 1 ? 's' : ''} until your next milestone!`;
    }
    return "You've reached the highest level! Keep checking in weekly to maintain your legendary status.";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 relative overflow-hidden">
      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center z-10 rounded-lg"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="text-center text-white"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: 3, duration: 0.5 }}
                className="text-6xl mb-2"
              >
                🎉
              </motion.div>
              <h3 className="text-xl font-bold">{milestone.title}</h3>
              <p className="text-sm opacity-90">{milestone.message}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Encouragement Message for Missed Days */}
      <AnimatePresence>
        {showEncouragement && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex items-center justify-center z-10 rounded-lg border-2 border-pink-200"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-center p-4"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: 2, duration: 1 }}
                className="text-4xl mb-3"
              >
                💝
              </motion.div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Don't worry!</h3>
              <p className="text-gray-700 text-sm mb-2">
                What's important is that you're still here
              </p>
              <p className="text-gray-600 text-xs">
                Every day is a fresh start ✨
              </p>
              <button
                onClick={() => setShowEncouragement(false)}
                className="mt-3 px-4 py-1.5 bg-purple-600 text-white text-xs rounded-full hover:bg-purple-700 transition-colors"
              >
                Thanks! 💜
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-full ${milestone.bg}`}>
          <IconComponent className={`w-6 h-6 ${milestone.color}`} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Current Streak</h2>
          <p className="text-sm text-gray-600">{milestone.title}</p>
        </div>
      </div>

      <div className="text-center mb-4">
        <motion.span 
          key={streak}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className={`text-4xl font-bold ${milestone.color}`}
        >
          {streak}
        </motion.span>
        <span className="text-gray-600 ml-2">days</span>
      </div>

      {/* Progress to next milestone */}
      {nextMilestone && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress to {nextMilestone} days</span>
            <span>{Math.round(getProgressToNext())}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${getProgressToNext()}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-2 rounded-full ${milestone.color.replace('text-', 'bg-')}`}
            />
          </div>
        </div>
      )}

      <p className="text-sm text-gray-600 text-center mb-4">
        {getEncouragementMessage()}
      </p>

      {/* Milestone hint */}
      <div className="bg-purple-50 p-3 rounded-lg">
        <p className="text-xs text-purple-700 text-center">
          💡 <strong>Tip:</strong> Keep checking in daily to unlock special animations and reach new milestones! 
          {streak >= 7 && " After 7+ days, weekly check-ins maintain your streak."}
        </p>
      </div>
    </div>
  );
};