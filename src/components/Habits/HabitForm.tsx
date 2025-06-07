import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

interface HabitFormProps {
  onComplete: () => void;
}

const COLORS = [
  'bg-blue-100 text-blue-700 border-blue-300',
  'bg-green-100 text-green-700 border-green-300',
  'bg-purple-100 text-purple-700 border-purple-300',
  'bg-yellow-100 text-yellow-700 border-yellow-300',
  'bg-pink-100 text-pink-700 border-pink-300',
  'bg-indigo-100 text-indigo-700 border-indigo-300',
];

const GAMES = [
  { id: 'memory', name: 'Memory Match', icon: '🧠' },
  { id: '2048', name: '2048', icon: '🎯' },
  { id: 'reaction', name: 'Reaction Time', icon: '⚡' }
];

export const HabitForm: React.FC<HabitFormProps> = ({ onComplete }) => {
  const { addHabit } = useApp();
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [color, setColor] = useState(COLORS[0]);
  const [selectedGame, setSelectedGame] = useState(GAMES[0].id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addHabit({
      title: title.trim(),
      frequency,
      color,
      gameType: selectedGame
    });
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Habit Name
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="e.g., Daily Exercise"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Frequency
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setFrequency('daily')}
            className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
              frequency === 'daily'
                ? 'bg-purple-100 text-purple-700 border-purple-300'
                : 'bg-gray-50 text-gray-700 border-gray-300'
            }`}
          >
            Daily
          </button>
          <button
            type="button"
            onClick={() => setFrequency('weekly')}
            className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
              frequency === 'weekly'
                ? 'bg-purple-100 text-purple-700 border-purple-300'
                : 'bg-gray-50 text-gray-700 border-gray-300'
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mini-Game
        </label>
        <div className="grid grid-cols-3 gap-2">
          {GAMES.map(game => (
            <button
              key={game.id}
              type="button"
              onClick={() => setSelectedGame(game.id)}
              className={`p-3 rounded-lg border text-center transition-colors ${
                selectedGame === game.id
                  ? 'bg-purple-100 text-purple-700 border-purple-300'
                  : 'bg-gray-50 text-gray-700 border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{game.icon}</div>
              <div className="text-xs font-medium">{game.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color
        </label>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${c} ${
                color === c ? 'scale-110 shadow-md' : ''
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onComplete}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200"
        >
          Add Habit
        </button>
      </div>
    </form>
  );
};