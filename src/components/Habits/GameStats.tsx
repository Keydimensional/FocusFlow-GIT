import React from 'react';
import { Habit } from '../../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Trophy } from 'lucide-react';

interface GameStatsProps {
  habits: Habit[];
}

export const GameStats: React.FC<GameStatsProps> = ({ habits }) => {
  const getGameStats = () => {
    const stats = habits.reduce((acc, habit) => {
      const dates = habit.completedDates.sort();
      dates.forEach(date => {
        if (!acc[date]) {
          acc[date] = { date, completions: 0 };
        }
        acc[date].completions++;
      });
      return acc;
    }, {} as Record<string, { date: string; completions: number }>);

    return Object.values(stats).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ).slice(-7);
  };

  const data = getGameStats();
  const maxCompletions = Math.max(...data.map(d => d.completions), 3);
  const todayStats = data[data.length - 1];

  return (
    <div className="bg-purple-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-purple-900">Weekly Progress</h3>
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span className="text-sm font-medium text-purple-800">
            Today: {todayStats?.completions || 0} completions
          </span>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => new Date(date).toLocaleDateString('en-GB', { weekday: 'short' })}
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={[0, maxCompletions + 1]}
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              labelFormatter={(date) => new Date(date).toLocaleDateString('en-GB', { 
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
              formatter={(value) => [`${value} completions`, 'Score']}
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
              dataKey="completions" 
              stroke="#7c3aed"
              strokeWidth={3}
              dot={{ fill: '#7c3aed', strokeWidth: 2 }}
              activeDot={{ 
                r: 8,
                fill: '#7c3aed',
                stroke: 'white',
                strokeWidth: 2
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-purple-700">
          Keep completing habits to increase your daily score!
        </p>
      </div>
    </div>
  );
};