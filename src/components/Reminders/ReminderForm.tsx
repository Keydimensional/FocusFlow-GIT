import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Volume2, VolumeX } from 'lucide-react';

interface ReminderFormProps {
  onComplete: () => void;
}

export const ReminderForm: React.FC<ReminderFormProps> = ({ onComplete }) => {
  const { addReminder } = useApp();
  const [title, setTitle] = useState('');
  const [datetime, setDatetime] = useState('');
  const [playSound, setPlaySound] = useState(true);
  const [soundType, setSoundType] = useState<'gentle' | 'chime'>('gentle');
  const [testingSound, setTestingSound] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !datetime) return;

    const reminderTime = new Date(datetime);
    const now = new Date();

    if (reminderTime <= now) {
      setError("Please select a future time for the reminder");
      return;
    }

    const reminder = {
      title: title.trim(),
      datetime,
      playSound,
      soundType
    };

    addReminder(reminder);
    onComplete();
  };

  const testSound = (type: 'gentle' | 'chime') => {
    setTestingSound(type);
    
    const SOUND_OPTIONS = {
      gentle: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
      chime: 'https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3'
    };

    const audio = new Audio(SOUND_OPTIONS[type]);
    audio.volume = 0.5;
    audio.load();
    audio.addEventListener('canplaythrough', () => {
      audio.play()
        .then(() => {
          setTimeout(() => setTestingSound(null), 1000);
        })
        .catch(console.error);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          required
        />
      </div>

      <div>
        <label htmlFor="datetime" className="block text-sm font-medium text-gray-700 mb-1">
          Date & Time
        </label>
        <input
          type="datetime-local"
          id="datetime"
          value={datetime}
          onChange={(e) => {
            setDatetime(e.target.value);
            setError(null);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          required
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPlaySound(!playSound)}
            className={`p-2 rounded-lg transition-colors ${
              playSound ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {playSound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <span className="text-sm text-gray-600">
            {playSound ? 'Sound enabled' : 'Sound disabled'}
          </span>
        </div>

        {playSound && (
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys({ gentle: '', chime: '' }) as Array<'gentle' | 'chime'>).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setSoundType(type);
                  testSound(type);
                }}
                className={`p-2 rounded-lg text-sm transition-colors ${
                  soundType === type
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-gray-100 text-gray-600'
                } ${testingSound === type ? 'animate-pulse' : ''}`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        )}

        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 Reminders will show as in-app popups with optional sound alerts. No browser notifications are used.
          </p>
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
          Add Reminder
        </button>
      </div>
    </form>
  );
};