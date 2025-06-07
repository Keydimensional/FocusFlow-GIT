import React, { useState } from 'react';
import { Goal } from '../../types';
import { ChevronDown, ChevronUp, CheckCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';

interface CompletedGoalsProps {
  goals: Goal[];
}

export const CompletedGoals: React.FC<CompletedGoalsProps> = ({ goals }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { deleteGoal, toggleGoal } = useApp();

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium text-gray-600">
            Completed Goals ({goals.length})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 space-y-2 overflow-hidden"
          >
            {goals.map((goal) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-green-50 rounded-lg p-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-grow">
                    <h4 className="font-medium text-green-800 text-sm line-through">
                      {goal.title}
                    </h4>
                    <p className="text-xs text-green-600 mt-1">
                      Completed on {new Date(goal.createdAt).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleGoal(goal.id)}
                      className="p-1 text-green-600 hover:text-green-700 text-xs"
                      title="Mark as incomplete"
                    >
                      Undo
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-1 text-red-500 hover:text-red-600"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};