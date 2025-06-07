import React, { useState } from 'react';
import { Goal } from '../../types';
import { useApp } from '../../context/AppContext';
import { Check, ChevronDown, ChevronUp, Save, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GoalItemProps {
  goal: Goal;
}

export const GoalItem: React.FC<GoalItemProps> = ({ goal }) => {
  const { toggleGoal, deleteGoal, updateGoal } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(goal.progress || 0);
  const [notes, setNotes] = useState(goal.notes || '');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmComplete, setShowConfirmComplete] = useState(false);

  const handleProgressChange = (newProgress: number) => {
    setProgress(newProgress);
    setUnsavedChanges(true);
  };

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    setUnsavedChanges(true);
  };

  const handleSave = () => {
    updateGoal(goal.id, { progress, notes });
    setUnsavedChanges(false);
  };

  const handleCompleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!goal.completed) {
      setShowConfirmComplete(true);
    } else {
      toggleGoal(goal.id);
    }
  };

  const confirmComplete = () => {
    toggleGoal(goal.id);
    setShowConfirmComplete(false);
  };

  if (showConfirmComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-green-50 rounded-lg p-4 border-2 border-green-200"
      >
        <h3 className="font-medium text-green-800 mb-2">Complete this goal?</h3>
        <p className="text-green-700 text-sm mb-4">"{goal.title}"</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowConfirmComplete(false)}
            className="px-3 py-1.5 text-gray-600 hover:text-gray-700 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={confirmComplete}
            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            Yes, Complete Goal
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg overflow-hidden">
      <div 
        className="flex items-start gap-4 p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <button
          onClick={handleCompleteClick}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200
            ${goal.completed 
              ? 'bg-green-500 border-green-500 text-white' 
              : 'border-gray-300 hover:border-green-500'
            }`}
        >
          {goal.completed && <Check className="w-4 h-4" />}
        </button>
        
        <div className="flex-grow">
          <h3 className={`font-medium ${goal.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
            {goal.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
          <p className="text-xs text-gray-500 mt-2">Due: {goal.dueDate}</p>
        </div>

        <button className="text-gray-400">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-200 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Progress: {progress}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => handleProgressChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              rows={3}
              placeholder="Add any additional notes..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => deleteGoal(goal.id)}
              className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 text-sm"
            >
              Delete
            </button>
            {unsavedChanges && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                className="px-3 py-1.5 flex items-center gap-1 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 text-sm"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            )}
            <button
              onClick={() => toggleGoal(goal.id)}
              className="px-3 py-1.5 text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200 text-sm"
            >
              {goal.completed ? 'Mark Incomplete' : 'Mark Complete'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};