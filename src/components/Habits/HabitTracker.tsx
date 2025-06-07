import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Minus, ListChecks, Trophy, Target, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameStats } from './GameStats';
import { HabitForm } from './HabitForm';
import { HabitItem } from './HabitItem';

export const HabitTracker: React.FC = () => {
  const { habits, deleteHabit } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate fun stats
  const getHabitStats = () => {
    if (habits.length === 0) return null;

    const gameStats = habits.reduce((acc, habit) => {
      acc[habit.gameType] = (acc[habit.gameType] || 0) + habit.completedDates.length;
      return acc;
    }, {} as Record<string, number>);

    const mostPlayedGame = Object.entries(gameStats).reduce((a, b) => 
      gameStats[a[0]] > gameStats[b[0]] ? a : b
    )[0];

    const mostCompletions = Math.max(...habits.map(h => h.completedDates.length));
    const topHabit = habits.find(h => h.completedDates.length === mostCompletions);

    const totalCompletions = habits.reduce((sum, habit) => sum + habit.completedDates.length, 0);

    const gameNames = {
      memory: 'Memory Match',
      '2048': '2048',
      reaction: 'Reaction Time'
    };

    return {
      mostPlayedGame: gameNames[mostPlayedGame as keyof typeof gameNames] || mostPlayedGame,
      mostCompletions,
      topHabit: topHabit?.title,
      totalCompletions
    };
  };

  const stats = getHabitStats();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-purple-500" />
          Habits
        </h2>
        <div className="flex items-center gap-2">
          {showForm ? (
            <button
              onClick={() => {
                setShowForm(false);
                setIsExpanded(true);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <Minus className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => {
                setShowForm(true);
                setIsExpanded(true);
              }}
              className="text-purple-600 hover:text-purple-700"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Brief explanation */}
      <div className="bg-purple-50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Gamepad2 className="w-5 h-5 text-purple-600" />
          <h3 className="font-medium text-purple-900">Build habits through play</h3>
        </div>
        <p className="text-sm text-purple-700">
          Each habit comes with a fun mini-game. Complete the game to mark your habit as done for the day and build your streak!
        </p>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {showForm ? (
              <HabitForm onComplete={() => setShowForm(false)} />
            ) : (
              <>
                {/* Fun Stats */}
                {stats && (
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-700">Most Played</span>
                      </div>
                      <div className="text-sm font-semibold text-blue-800">{stats.mostPlayedGame}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-green-700">Top Streak</span>
                      </div>
                      <div className="text-sm font-semibold text-green-800">
                        {stats.mostCompletions} days
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {habits.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">🎮</div>
                      <p className="text-gray-500 mb-2">
                        No habits yet. Add one to get started!
                      </p>
                      <p className="text-sm text-gray-400">
                        Turn daily tasks into fun mini-games
                      </p>
                    </div>
                  ) : (
                    habits.map((habit) => (
                      <HabitItem 
                        key={habit.id} 
                        habit={habit}
                        onDelete={deleteHabit}
                      />
                    ))
                  )}
                </div>
                
                {habits.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <GameStats habits={habits} />
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};