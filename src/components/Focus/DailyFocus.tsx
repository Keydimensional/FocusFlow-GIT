import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';
import { Target, Save, X } from 'lucide-react';

export const DailyFocus: React.FC = () => {
  const { addFocus, todaysFocus, updateFocus } = useApp();
  const [focus, setFocus] = useState(todaysFocus?.text || '');
  const [isEditing, setIsEditing] = useState(!todaysFocus);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!focus.trim()) return;

    if (todaysFocus) {
      updateFocus(focus.trim());
    } else {
      addFocus(focus.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-500" />
          Today's Focus
        </h2>
        {todaysFocus && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-purple-600 hover:text-purple-700"
          >
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What's your main focus for today?
            </label>
            <input
              type="text"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="e.g., Complete project presentation"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2">
            {todaysFocus && (
              <button
                type="button"
                onClick={() => {
                  setFocus(todaysFocus.text);
                  setIsEditing(false);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Focus
            </button>
          </div>
        </form>
      ) : todaysFocus ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-50 p-4 rounded-lg"
        >
          <p className="text-lg text-purple-900">{todaysFocus.text}</p>
          <p className="text-sm text-purple-600 mt-2">
            Set at {new Date(todaysFocus.timestamp).toLocaleTimeString()}
          </p>
        </motion.div>
      ) : (
        <p className="text-gray-500 text-center py-4">
          Set your main focus for today to stay on track!
        </p>
      )}
    </div>
  );
};