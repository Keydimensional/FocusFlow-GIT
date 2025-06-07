import React, { useState } from 'react';
import { Goal } from '../../types';
import { GoalItem } from './GoalItem';
import { GoalForm } from './GoalForm';
import { CompletedGoals } from './CompletedGoals';
import { Plus, Target } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface GoalListProps {
  goals: Goal[];
}

export const GoalList: React.FC<GoalListProps> = ({ goals }) => {
  const [showForm, setShowForm] = useState(false);
  const { goals: allGoals } = useApp();
  
  const completedGoals = allGoals.filter(goal => goal.completed);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-500" />
          Goals
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>
      
      {showForm && (
        <div className="mb-6">
          <GoalForm onComplete={() => setShowForm(false)} />
        </div>
      )}

      <div className="space-y-4">
        {goals.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No active goals. Add one to get started!</p>
        ) : (
          goals.map(goal => <GoalItem key={goal.id} goal={goal} />)
        )}
      </div>

      {/* Completed Goals Section */}
      {completedGoals.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <CompletedGoals goals={completedGoals} />
        </div>
      )}
    </div>
  );
};