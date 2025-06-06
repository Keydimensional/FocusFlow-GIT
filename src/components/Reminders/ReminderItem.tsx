import React, { useState } from 'react';
import { Reminder } from '../../types';
import { useApp } from '../../context/AppContext';
import { Check, Trash2, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReminderItemProps {
  reminder: Reminder;
}

const SOUND_OPTIONS = {
  gentle: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
  chime: 'https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3'
};

export const ReminderItem: React.FC<ReminderItemProps> = ({ reminder }) => {
  const { toggleReminder, deleteReminder, updateReminder } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(reminder.title);
  const [datetime, setDatetime] = useState(reminder.datetime);
  const [playSound, setPlaySound] = useState(reminder.playSound ?? true);
  const [soundType, setSoundType] = useState<'gentle' | 'chime'>(reminder.soundType ?? 'gentle');
  const [showConfirmComplete, setShowConfirmComplete] = useState(false);
  const [testingSound, setTestingSound] = useState<string | null>(null);

  const formatDateTime = (datetime: string) => {
    return new Date(datetime).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSave = async () => {
    if (!title.trim() || !datetime) return;
    
    updateReminder(reminder.id, {
      title: title.trim(),
      datetime,
      playSound,
      soundType,
      completed: reminder.completed
    });
    
    setIsEditing(false);
  };

  const testSound = (type: string) => {
    setTestingSound(type);
    const audio = new Audio(SOUND_OPTIONS[type as keyof typeof SOUND_OPTIONS]);
    audio.volume = 0.5;
    audio.play()
      .then(() => {
        setTimeout(() => setTestingSound(null), 1000);
      })
      .catch(console.error);
  };

  if (showConfirmComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="p-4 bg-white rounded-lg shadow-sm border-2 border-green-100"
      >
        <p className="text-gray-700 mb-4">Do you want to mark this reminder as complete?</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowConfirmComplete(false)}
            className="px-3 py-1.5 text-gray-600 hover:text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toggleReminder(reminder.id);
              setShowConfirmComplete(false);
            }}
            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
          >
            Complete
          </button>
        </div>
      </motion.div>
    );
  }

  if (isEditing) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
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
                {Object.keys(SOUND_OPTIONS).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setSoundType(type as 'gentle' | 'chime');
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

            <div className="bg-blue-50 p-2 rounded">
              <p className="text-xs text-blue-700">
                💡 In-app notification with optional sound alert
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
      <button
        onClick={() => setShowConfirmComplete(true)}
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200
          ${reminder.completed 
            ? 'bg-green-100 border-green-500 text-green-500' 
            : 'border-gray-300 hover:border-green-500'
          }`}
      >
        {reminder.completed && <Check className="w-4 h-4" />}
      </button>
      
      <div 
        className="flex-grow cursor-pointer"
        onClick={() => setIsEditing(true)}
      >
        <h3 className={`font-medium ${reminder.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
          {reminder.title}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {formatDateTime(reminder.datetime)}
        </p>
        {reminder.playSound && (
          <div className="flex items-center gap-1 mt-1 text-purple-600">
            <Volume2 className="w-4 h-4" />
            <span className="text-xs">
              Sound: {reminder.soundType || 'gentle'}
            </span>
          </div>
        )}
      </div>

      <button
        onClick={() => deleteReminder(reminder.id)}
        className="text-gray-400 hover:text-red-500 transition-colors duration-200"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
};