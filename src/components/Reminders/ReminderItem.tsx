import React, { useState } from 'react';
import { Reminder } from '../../types';
import { useApp } from '../../context/AppContext';
import { Check, Trash2, Volume2, VolumeX } from 'lucide-react';
import { detectDevice } from '../../utils/deviceDetection';

interface ReminderItemProps {
  reminder: Reminder;
}

export const ReminderItem: React.FC<ReminderItemProps> = ({ reminder }) => {
  const { toggleReminder, deleteReminder, updateReminder } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(reminder.title);
  const [datetime, setDatetime] = useState(reminder.datetime);
  const [playSound, setPlaySound] = useState(reminder.playSound ?? true);
  const [showCalendarPrompt, setShowCalendarPrompt] = useState(false);

  const formatDateTime = (datetime: string) => {
    return new Date(datetime).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSave = () => {
    if (!title.trim() || !datetime) return;
    
    updateReminder(reminder.id, {
      title: title.trim(),
      datetime,
      playSound,
    });
    
    setIsEditing(false);
    setShowCalendarPrompt(true);
  };

  const generateCalendarContent = (format: 'ics' | 'vcs') => {
    const dateStr = new Date(datetime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    if (format === 'ics') {
      return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${title}
DESCRIPTION:Reminder
DTSTART:${dateStr}
DTEND:${dateStr}
END:VEVENT
END:VCALENDAR`;
    }
    
    return `BEGIN:VCALENDAR
VERSION:1.0
BEGIN:VEVENT
SUMMARY:${title}
DESCRIPTION:Reminder
DTSTART:${dateStr}
DTEND:${dateStr}
END:VEVENT
END:VCALENDAR`;
  };

  const downloadCalendarFile = (format: 'ics' | 'vcs') => {
    const content = generateCalendarContent(format);
    const mimeType = format === 'ics' ? 'text/calendar' : 'text/x-vcalendar';
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `reminder-${title.toLowerCase().replace(/\s+/g, '-')}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowCalendarPrompt(false);
  };

  const handleGoogleCalendar = () => {
    const startDate = new Date(datetime);
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 1);

    const googleUrl = new URL('https://calendar.google.com/calendar/render');
    googleUrl.searchParams.append('action', 'TEMPLATE');
    googleUrl.searchParams.append('text', title);
    googleUrl.searchParams.append('details', 'Reminder');
    googleUrl.searchParams.append('dates', 
      `${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z` +
      '/' +
      `${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
    );

    window.open(googleUrl.toString(), '_blank');
    setShowCalendarPrompt(false);
  };

  if (showCalendarPrompt) {
    const device = detectDevice();
    
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4">Add to Calendar</h3>
        <div className="space-y-3">
          {device.isIOS && (
            <button
              onClick={() => downloadCalendarFile('ics')}
              className="w-full px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg"
            >
              Add to Apple Calendar
            </button>
          )}
          
          {device.isAndroid && (
            <>
              <button
                onClick={handleGoogleCalendar}
                className="w-full px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg"
              >
                Add to Google Calendar
              </button>
              <button
                onClick={() => downloadCalendarFile('vcs')}
                className="w-full px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Download .vcs File
              </button>
            </>
          )}
          
          {!device.isMobile && (
            <>
              <button
                onClick={() => downloadCalendarFile('ics')}
                className="w-full px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg"
              >
                Download .ics File (Apple Calendar)
              </button>
              <button
                onClick={handleGoogleCalendar}
                className="w-full px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Add to Google Calendar
              </button>
              <button
                onClick={() => downloadCalendarFile('vcs')}
                className="w-full px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg"
              >
                Download .vcs File (Other Calendars)
              </button>
            </>
          )}
          
          <button
            onClick={() => setShowCalendarPrompt(false)}
            className="w-full px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Skip
          </button>
        </div>
      </div>
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

          <div className="flex items-center gap-2">
            <button
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
        onClick={() => toggleReminder(reminder.id)}
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200
          ${reminder.completed 
            ? 'bg-green-500 border-green-500 text-white' 
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
            <span className="text-xs">Sound enabled</span>
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