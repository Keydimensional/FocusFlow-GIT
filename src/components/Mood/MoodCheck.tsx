import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Mood } from '../../types';
import { Frown, Meh, Smile, Frown as FrownOpen, X } from 'lucide-react';
import { motion } from 'framer-motion';

const moodConfig: Record<Mood, { icon: React.ReactNode; color: string; label: string }> = {
  great: { icon: <Smile className="w-6 sm:w-8 h-6 sm:h-8" />, color: 'bg-green-100 hover:bg-green-200 text-green-700', label: 'Great' },
  good: { icon: <Smile className="w-6 sm:w-8 h-6 sm:h-8" />, color: 'bg-blue-100 hover:bg-blue-200 text-blue-700', label: 'Good' },
  okay: { icon: <Meh className="w-6 sm:w-8 h-6 sm:h-8" />, color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700', label: 'Okay' },
  bad: { icon: <Frown className="w-6 sm:w-8 h-6 sm:h-8" />, color: 'bg-orange-100 hover:bg-orange-200 text-orange-700', label: 'Bad' },
  awful: { icon: <FrownOpen className="w-6 sm:w-8 h-6 sm:h-8" />, color: 'bg-red-100 hover:bg-red-200 text-red-700', label: 'Awful' },
};

export const MoodCheck: React.FC = () => {
  const { addMood, moods, updateMood } = useApp();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [reflection, setReflection] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  
  const todaysMood = moods.find(mood => {
    const moodDate = new Date(mood.date.split('/').reverse().join('-'));
    const today = new Date();
    return moodDate.toDateString() === today.toDateString();
  });

  const handleMoodSelect = (mood: Mood) => {
    if (todaysMood) {
      setShowWarning(true);
      return;
    }
    setSelectedMood(mood);
  };

  const handleSubmit = () => {
    if (!selectedMood) return;
    
    if (isEditing && todaysMood) {
      updateMood(todaysMood.date, selectedMood, reflection);
    } else {
      addMood(selectedMood, reflection);
    }
    
    setSelectedMood(null);
    setReflection('');
    setIsEditing(false);
    setShowWarning(false);
  };

  const handleCancel = () => {
    setSelectedMood(null);
    setReflection('');
    setIsEditing(false);
    setShowWarning(false);
  };

  if (showWarning) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <h3 className="text-lg font-medium mb-4">You've already logged your mood today</h3>
        <p className="text-gray-600 mb-6">Would you like to edit your earlier entry?</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowWarning(false)}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setIsEditing(true);
              setSelectedMood(todaysMood.mood);
              setReflection(todaysMood.reflection || '');
              setShowWarning(false);
            }}
            className="px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg"
          >
            Edit Entry
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      {!selectedMood ? (
        <>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
            How are you feeling today?
          </h2>
          <div className="grid grid-cols-5 gap-2 sm:gap-4">
            {(Object.entries(moodConfig) as [Mood, typeof moodConfig[Mood]][]).map(([mood, config]) => (
              <button
                key={mood}
                onClick={() => handleMoodSelect(mood)}
                className={`${config.color} p-2 sm:p-4 rounded-lg flex flex-col items-center transition-colors duration-200`}
              >
                {config.icon}
                <span className="mt-1 sm:mt-2 text-xs sm:text-sm">{config.label}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              {isEditing ? 'Edit Your Mood Entry' : 'Add Your Thoughts'}
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`${moodConfig[selectedMood].color} p-2 rounded-lg flex items-center gap-2`}>
              {moodConfig[selectedMood].icon}
              <span className="text-sm">{moodConfig[selectedMood].label}</span>
            </div>
          </div>

          <div>
            <label htmlFor="reflection" className="block text-sm font-medium text-gray-700 mb-2">
              What made you feel this way?
            </label>
            <textarea
              id="reflection"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              rows={4}
              placeholder="Share your thoughts..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200"
            >
              {isEditing ? 'Update Entry' : 'Save Entry'}
            </button>
          </div>
        </div>
      )}

      {todaysMood && !selectedMood && !showWarning && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Today's mood: <span className="font-medium">{moodConfig[todaysMood.mood].label}</span>
          </p>
          {todaysMood.reflection && (
            <p className="text-sm text-gray-600 mt-1">
              Reflection: <span className="italic">{todaysMood.reflection}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};