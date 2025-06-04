import React from 'react';
import { useApp } from '../../context/AppContext';
import { MoodEntry } from '../../types';
import { Frown, Meh, Smile, HeartHandshake, History } from 'lucide-react';

const moodConfig = {
  great: { icon: <HeartHandshake className="w-6 h-6" />, color: 'text-green-600' },
  good: { icon: <Smile className="w-6 h-6" />, color: 'text-blue-600' },
  okay: { icon: <Meh className="w-6 h-6" />, color: 'text-yellow-600' },
  bad: { icon: <Frown className="w-6 h-6" />, color: 'text-orange-600' },
  awful: { icon: <Frown className="w-6 h-6" />, color: 'text-red-600' },
};

const MoodCard: React.FC<{ entry: MoodEntry }> = ({ entry }) => {
  const date = new Date(entry.date.split('/').reverse().join('-'));
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 transition-all hover:shadow-md">
      <div className="flex items-center gap-3 mb-2">
        <span className={moodConfig[entry.mood].color}>
          {moodConfig[entry.mood].icon}
        </span>
        <span className="text-sm text-gray-600">
          {date.toLocaleDateString('en-GB', { 
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </span>
      </div>
      {entry.reflection && (
        <p className="text-gray-700 text-sm mt-2 italic">
          "{entry.reflection}"
        </p>
      )}
    </div>
  );
};

export const MoodHistory: React.FC = () => {
  const { moods } = useApp();
  const sortedMoods = [...moods].reverse();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <History className="w-5 h-5 text-purple-500" />
        Mood History
      </h2>
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {sortedMoods.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No mood entries yet. Start by checking in above!</p>
        ) : (
          sortedMoods.map((entry, index) => (
            <MoodCard key={`${entry.date}-${index}`} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
};