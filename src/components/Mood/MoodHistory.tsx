import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MoodEntry } from '../../types';
import { Frown, Meh, Smile, HeartHandshake, History, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const moodConfig = {
  great: { icon: <HeartHandshake className="w-6 h-6" />, color: 'text-green-600', value: 5 },
  good: { icon: <Smile className="w-6 h-6" />, color: 'text-blue-600', value: 4 },
  okay: { icon: <Meh className="w-6 h-6" />, color: 'text-yellow-600', value: 3 },
  bad: { icon: <Frown className="w-6 h-6" />, color: 'text-orange-600', value: 2 },
  awful: { icon: <Frown className="w-6 h-6" />, color: 'text-red-600', value: 1 },
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [showGraph, setShowGraph] = useState(true);
  
  const sortedMoods = [...moods].reverse();
  
  // Prepare data for the chart
  const chartData = moods
    .slice(-14) // Last 14 entries for better readability
    .map(mood => ({
      date: mood.date,
      mood: moodConfig[mood.mood].value,
      moodName: mood.mood,
      reflection: mood.reflection
    }));

  const getAverageMood = () => {
    if (moods.length === 0) return 0;
    const sum = moods.reduce((acc, mood) => acc + moodConfig[mood.mood].value, 0);
    return (sum / moods.length).toFixed(1);
  };

  const getMoodTrend = () => {
    if (moods.length < 2) return 'neutral';
    const recent = moods.slice(-3);
    const older = moods.slice(-6, -3);
    
    if (recent.length === 0 || older.length === 0) return 'neutral';
    
    const recentAvg = recent.reduce((acc, mood) => acc + moodConfig[mood.mood].value, 0) / recent.length;
    const olderAvg = older.reduce((acc, mood) => acc + moodConfig[mood.mood].value, 0) / older.length;
    
    if (recentAvg > olderAvg + 0.3) return 'improving';
    if (recentAvg < olderAvg - 0.3) return 'declining';
    return 'stable';
  };

  const trend = getMoodTrend();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <History className="w-5 h-5 text-purple-500" />
          Mood History
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-gray-600"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Compact Summary */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-purple-600">{getAverageMood()}</div>
          <div className="text-sm text-purple-700">Average Mood</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-1">
            <TrendingUp className={`w-4 h-4 ${
              trend === 'improving' ? 'text-green-600' : 
              trend === 'declining' ? 'text-red-600' : 'text-gray-600'
            }`} />
            <span className={`text-sm font-medium ${
              trend === 'improving' ? 'text-green-600' : 
              trend === 'declining' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {trend === 'improving' ? 'Improving' : 
               trend === 'declining' ? 'Declining' : 'Stable'}
            </span>
          </div>
          <div className="text-xs text-gray-600">Recent Trend</div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Graph Toggle */}
            {chartData.length > 1 && (
              <div className="mb-4">
                <button
                  onClick={() => setShowGraph(!showGraph)}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  {showGraph ? 'Hide Graph' : 'Show Graph'}
                </button>
              </div>
            )}

            {/* Mood Graph */}
            {showGraph && chartData.length > 1 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Mood Trend</h3>
                <div className="h-64 bg-gray-50 rounded-lg p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => {
                          const d = new Date(date.split('/').reverse().join('-'));
                          return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                        }}
                        stroke="#6b7280"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        domain={[1, 5]}
                        tickFormatter={(value) => {
                          const moodNames = ['', 'Awful', 'Bad', 'Okay', 'Good', 'Great'];
                          return moodNames[value] || '';
                        }}
                        stroke="#6b7280"
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        labelFormatter={(date) => {
                          const d = new Date(date.split('/').reverse().join('-'));
                          return d.toLocaleDateString('en-GB', { 
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                          });
                        }}
                        formatter={(value, name, props) => [
                          props.payload.moodName.charAt(0).toUpperCase() + props.payload.moodName.slice(1),
                          'Mood'
                        ]}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          padding: '12px'
                        }}
                        itemStyle={{ color: '#7c3aed' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="mood" 
                        stroke="#7c3aed"
                        strokeWidth={3}
                        dot={{ fill: '#7c3aed', strokeWidth: 2, r: 4 }}
                        activeDot={{ 
                          r: 6,
                          fill: '#7c3aed',
                          stroke: 'white',
                          strokeWidth: 2
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Mood Entries List */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Recent Entries</h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {sortedMoods.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No mood entries yet. Start by checking in above!</p>
                ) : (
                  sortedMoods.map((entry, index) => (
                    <motion.div
                      key={`${entry.date}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <MoodCard entry={entry} />
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};