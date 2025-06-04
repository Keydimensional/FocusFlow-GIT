import React from 'react';
import { Reminder } from '../../types';
import { useApp } from '../../context/AppContext';
import { Check, Trash2 } from 'lucide-react';

interface ReminderItemProps {
  reminder: Reminder;
}

export const ReminderItem: React.FC<ReminderItemProps> = ({ reminder }) => {
  const { toggleReminder, deleteReminder } = useApp();

  const formatDateTime = (datetime: string) => {
    return new Date(datetime).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
      <button
        onClick={() => toggleReminder(reminder.id)}
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200
          ${reminder.completed 
            ? 'bg-green-500 border-green-500 text-white' 
            : 'border-gray-300 hover:border-green-500'
          }`}
      >
        {reminder.completed && <Check className="w-4 h-4" />}
      </button>
      
      <div className="flex-grow">
        <h3 className={`font-medium ${reminder.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
          {reminder.title}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {formatDateTime(reminder.datetime)}
        </p>
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