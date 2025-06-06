import React, { useState, useEffect } from 'react';
import { Reminder } from '../../types';
import { ReminderItem } from './ReminderItem';
import { ReminderForm } from './ReminderForm';
import { ReminderPopup } from './ReminderPopup';
import { Bell, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { trySendNotification } from '../../utils/notifications';

interface ReminderListProps {
  reminders: Reminder[];
}

const SOUND_OPTIONS = {
  gentle: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
  chime: 'https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3'
};

export const ReminderList: React.FC<ReminderListProps> = ({ reminders }) => {
  const [showForm, setShowForm] = useState(false);
  const { toggleReminder } = useApp();
  const [activeTimeouts, setActiveTimeouts] = useState<NodeJS.Timeout[]>([]);
  const [activeReminder, setActiveReminder] = useState<Reminder | null>(null);

  useEffect(() => {
    // Clear existing timeouts when reminders change
    activeTimeouts.forEach(timeout => clearTimeout(timeout));
    setActiveTimeouts([]);

    const newTimeouts: NodeJS.Timeout[] = [];

    reminders.forEach(reminder => {
      if (!reminder.completed) {
        const reminderTime = new Date(reminder.datetime);
        const now = new Date();
        const timeDiff = reminderTime.getTime() - now.getTime();

        if (timeDiff > 0) {
          const timeout = setTimeout(() => {
            // Play sound first to ensure it's not blocked
            if (reminder.playSound) {
              const audio = new Audio(
                reminder.soundType === 'chime' 
                  ? SOUND_OPTIONS.chime 
                  : SOUND_OPTIONS.gentle
              );
              audio.volume = 0.5;
              // Preload the audio
              audio.load();
              // Play when ready
              audio.addEventListener('canplaythrough', () => {
                audio.play().catch(console.error);
              });
            }

            // Try to show browser notification (safe for iOS)
            const notificationSent = trySendNotification('Reminder!', {
              body: reminder.title,
              icon: '/vite.svg'
            });

            if (!notificationSent) {
              console.log('📱 Browser notification not available, showing in-app popup only');
            }

            // Show in-app popup
            setActiveReminder(reminder);
            toggleReminder(reminder.id);
          }, timeDiff);

          newTimeouts.push(timeout);
        }
      }
    });

    setActiveTimeouts(newTimeouts);

    // Cleanup function
    return () => {
      newTimeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [reminders, toggleReminder]);

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-500" />
            Reminders
          </h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            Add Reminder
          </button>
        </div>
        
        {showForm && (
          <div className="mb-6">
            <ReminderForm onComplete={() => setShowForm(false)} />
          </div>
        )}

        <div className="space-y-4">
          {reminders.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No active reminders. Add one to get started!</p>
          ) : (
            reminders.map(reminder => <ReminderItem key={reminder.id} reminder={reminder} />)
          )}
        </div>
      </div>

      {activeReminder && (
        <ReminderPopup
          title={activeReminder.title}
          onClose={() => setActiveReminder(null)}
        />
      )}
    </>
  );
};