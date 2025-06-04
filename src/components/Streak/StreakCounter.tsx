import React from 'react';
import { useApp } from '../../context/AppContext';
import { Flame } from 'lucide-react';

export const StreakCounter: React.FC = () => {
  const { streak } = useApp();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-3">
        <Flame className="w-6 h-6 text-orange-500" />
        <h2 className="text-xl font-semibold text-gray-800">Current Streak</h2>
      </div>
      <div className="mt-4 text-center">
        <span className="text-4xl font-bold text-orange-500">{streak}</span>
        <span className="text-gray-600 ml-2">days</span>
      </div>
      <p className="mt-2 text-sm text-gray-500 text-center">
        Keep checking in daily to maintain your streak!
      </p>
    </div>
  );
};