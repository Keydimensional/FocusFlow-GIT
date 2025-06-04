import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Trophy, Check, X, Trash2, Play, Minus, ListChecks } from 'lucide-react';
import { Habit } from '../../types';
import { MiniGame } from './MiniGame';
import { motion, AnimatePresence } from 'framer-motion';
import { GameStats } from './GameStats';
import { HabitForm } from './HabitForm';
import { HabitItem } from './HabitItem';

export const HabitTracker: React.FC = () => {
  const { habits, deleteHabit } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
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
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {habits.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No habits yet. Add one to get started!
                    </p>
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