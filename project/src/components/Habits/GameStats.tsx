import React from 'react';
import { Habit } from '../../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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

  return (
    <div>
      <h3 className="text-md font-semibold text-gray-700 mb-4">Weekly Activity</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => new Date(date).toLocaleDateString('en-GB', { weekday: 'short' })}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(date) => new Date(date).toLocaleDateString('en-GB')}
              formatter={(value) => [`${value} completions`]}
            />
            <Line 
              type="monotone" 
              dataKey="completions" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={{ fill: '#8b5cf6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};