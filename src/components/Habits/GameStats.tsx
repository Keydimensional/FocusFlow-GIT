import React from 'react';
import { Habit } from '../../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Trophy, TrendingUp, Calendar, Award } from 'lucide-react';

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

  const getDetailedStats = () => {
    const totalCompletions = habits.reduce((sum, habit) => sum + habit.completedDates.length, 0);
    const longestStreak = Math.max(...habits.map(h => h.streak), 0);
    const activeHabits = habits.filter(h => {
      const today = new Date().toISOString().split('T')[0];
      const todayFormatted = today.split('-').reverse().join('/');
      return h.completedDates.includes(todayFormatted);
    }).length;

    // Calculate current week completions
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const thisWeekCompletions = habits.reduce((sum, habit) => {
      return sum + habit.completedDates.filter(date => {
        const completionDate = new Date(date.split('/').reverse().join('-'));
        return completionDate >= weekStart && completionDate <= today;
      }).length;
    }, 0);

    return {
      totalCompletions,
      longestStreak,
      activeHabits,
      thisWeekCompletions
    };
  };

  const data = getGameStats();
  const detailedStats = getDetailedStats();
  const maxCompletions = Math.max(...data.map(d => d.completions), 3);
  const todayStats = data[data.length - 1];

  return (
    <div className="space-y-4">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-purple-700">Total Games</span>
          </div>
          <div className="text-lg font-bold text-purple-800">{detailedStats.totalCompletions}</div>
        </div>

        <div className="bg-orange-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-medium text-orange-700">Best Streak</span>
          </div>
          <div className="text-lg font-bold text-orange-800">{detailedStats.longestStreak}</div>
        </div>

        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-700">This Week</span>
          </div>
          <div className="text-lg font-bold text-green-800">{detailedStats.thisWeekCompletions}</div>
        </div>

        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Today</span>
          </div>
          <div className="text-lg font-bold text-blue-800">{todayStats?.completions || 0}</div>
        </div>
      </div>

      {/* Weekly Progress Chart */}
      {data.length > 1 && (
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-900">Weekly Progress</h3>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-purple-800">
                {todayStats?.completions || 0} games today
              </span>
            </div>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date.split('/').reverse().join('-')).toLocaleDateString('en-GB', { weekday: 'short' })}
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={[0, maxCompletions + 1]}
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  labelFormatter={(date) => new Date(date.split('/').reverse().join('-')).toLocaleDateString('en-GB', { 
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                  formatter={(value) => [`${value} games completed`, 'Score']}
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
              Keep playing games to build stronger habits! 🎮
            </p>
          </div>
        </div>
      )}
    </div>
  );
};