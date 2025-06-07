import React, { useState, useEffect } from 'react';
import { Reminder } from '../../types';
import { ReminderItem } from './ReminderItem';
import { ReminderForm } from './ReminderForm';
import { ReminderPopup } from './ReminderPopup';
import { Bell, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { playNotificationSound, scheduleReminderNotification, cancelLocalNotification } from '../../utils/notifications';

interface ReminderListProps {
  reminders: Reminder[];
}

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
          // Schedule local notification for native apps
          scheduleReminderNotification({
            id: reminder.id,
            title: reminder.title,
            datetime: reminder.datetime,
          }).catch(error => {
            console.warn('Failed to schedule local notification:', error);
          });

          // Schedule in-app notification
          const timeout = setTimeout(() => {
            // Play sound first
            if (reminder.playSound) {
              playNotificationSound(reminder.soundType || 'gentle');
            }

            // Show in-app popup
            setActiveReminder(reminder);
            toggleReminder(reminder.id);
          }, timeDiff);

          newTimeouts.push(timeout);
        }
      } else {
        // Cancel local notification if reminder is completed
        const numericId = Math.abs(reminder.id.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0));
        
        cancelLocalNotification(numericId).catch(error => {
          console.warn('Failed to cancel local notification:', error);
        });
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