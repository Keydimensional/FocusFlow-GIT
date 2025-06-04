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
  const [testingSound, setTestingSound] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !datetime) return;

    // Request notification permission
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Schedule notification
        const notificationTime = new Date(datetime).getTime();
        const currentTime = new Date().getTime();
        const timeUntilNotification = notificationTime - currentTime;

        if (timeUntilNotification > 0) {
          setTimeout(() => {
            new Notification('Reminder: ' + title, {
              body: 'Time to complete your task!',
              icon: '/vite.svg'
            });

            if (playSound) {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.volume = 0.5;
              audio.play().catch(console.error);
            }
          }, timeUntilNotification);
        }
      }
    }

    addReminder({
      title: title.trim(),
      datetime,
      playSound,
    });
    
    onComplete();
  };

  const testSound = () => {
    setTestingSound(true);
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.volume = 0.5;
    audio.play()
      .then(() => {
        setTimeout(() => setTestingSound(false), 1000);
      })
      .catch(console.error);
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
          onChange={(e) => setDatetime(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          required
        />
      </div>

      <div className="flex items-center justify-between">
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
          <button
            type="button"
            onClick={testSound}
            disabled={testingSound}
            className="text-sm text-purple-600 hover:text-purple-700"
          >
            {testingSound ? 'Playing...' : 'Test sound'}
          </button>
        )}
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