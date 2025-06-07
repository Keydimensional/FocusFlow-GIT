import React, { useState } from 'react';
import { Habit } from '../../types';
import { useApp } from '../../context/AppContext';
import { Check, Play, Trash2, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MiniGame } from './MiniGame';

interface HabitItemProps {
  habit: Habit;
  onDelete: (id: string) => void;
}

const CompletionAnimation = () => (
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
      🔥
    </motion.div>
  </motion.div>
);

const gameTypeNames: Record<string, string> = {
  memory: 'Memory',
  '2048': '2048',
  reaction: 'Reaction'
};

export const HabitItem: React.FC<HabitItemProps> = ({ habit, onDelete }) => {
  const { toggleHabit } = useApp();
  const [showGame, setShowGame] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = habit.completedDates.includes(today);

  const handleGameComplete = () => {
    setShowAnimation(true);
    toggleHabit(habit.id);
    setShowGame(false);
    setTimeout(() => setShowAnimation(false), 1500);
  };

  const getStatusMessage = () => {
    if (isCompletedToday) {
      return `Completed today! Check back ${habit.frequency === 'daily' ? 'tomorrow' : 'next week'} to continue your streak!`;
    }
    return 'Click to play today\'s mini-game!';
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`p-4 rounded-lg border ${habit.color} relative group`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-grow">
            <h3 className="font-medium">{habit.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm">Streak: {habit.streak} days</span>
            </div>
            <p className="text-sm mt-1 opacity-75">{getStatusMessage()}</p>
          </div>
          
          <div className="flex items-center gap-2">
            {!isCompletedToday && (
              <button
                onClick={() => setShowGame(true)}
                className="w-8 h-8 rounded-full bg-white bg-opacity-50 hover:bg-opacity-75 flex items-center justify-center transition-colors"
              >
                <Play className="w-4 h-4" />
              </button>
            )}
            {isCompletedToday && (
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(habit.id);
            }}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-4 h-4 text-red-500 hover:text-red-600" />
          </button>
        </div>
      </motion.div>
      
      <AnimatePresence>
        {showGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg p-6 max-w-lg w-full mx-4"
            >
              <MiniGame
                gameType={habit.gameType}
                onComplete={handleGameComplete}
                onCancel={() => setShowGame(false)}
              />
            </motion.div>
          </motion.div>
        )}
        {showAnimation && <CompletionAnimation />}
      </AnimatePresence>
    </>
  );
};