import React, { useState, useEffect } from 'react';
import { Reminder } from '../../types';
import { ReminderItem } from './ReminderItem';
import { ReminderForm } from './ReminderForm';
import { Bell, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ReminderListProps {
  reminders: Reminder[];
}

export const ReminderList: React.FC<ReminderListProps> = ({ reminders }) => {
  const [showForm, setShowForm] = useState(false);
  const { toggleReminder } = useApp();

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      reminders.forEach(reminder => {
        if (!reminder.completed && new Date(reminder.datetime) <= now) {
          if (Notification.permission === 'granted') {
            new Notification('Reminder: ' + reminder.title, {
              body: 'Time to complete your task!',
              icon: '/vite.svg'
            });

            if (reminder.playSound) {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.volume = 0.5;
              audio.play().catch(console.error);
            }
          }
          toggleReminder(reminder.id);
        }
      });
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    checkReminders(); // Initial check

    return () => clearInterval(interval);
  }, [reminders, toggleReminder]);

  return (
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
  );
};