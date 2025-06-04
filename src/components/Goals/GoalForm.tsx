import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { detectDevice } from '../../utils/deviceDetection';

interface GoalFormProps {
  onComplete: () => void;
}

export const GoalForm: React.FC<GoalFormProps> = ({ onComplete }) => {
  const { addGoal } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showCalendarPrompt, setShowCalendarPrompt] = useState(false);
  const [calendarFormat, setCalendarFormat] = useState<'ics' | 'vcs' | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    const goal = {
      title: title.trim(),
      description: description.trim(),
      dueDate: new Date(dueDate).toLocaleDateString('en-GB'),
    };

    addGoal(goal);
    setShowCalendarPrompt(true);
  };

  const generateCalendarContent = (format: 'ics' | 'vcs') => {
    const dateStr = new Date(dueDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    if (format === 'ics') {
      return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${title}
DESCRIPTION:${description}
DTSTART:${dateStr}
DTEND:${dateStr}
END:VEVENT
END:VCALENDAR`;
    }
    
    return `BEGIN:VCALENDAR
VERSION:1.0
BEGIN:VEVENT
SUMMARY:${title}
DESCRIPTION:${description}
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
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onComplete();
  };

  const handleGoogleCalendar = () => {
    const startDate = new Date(dueDate);
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 1);

    const googleUrl = new URL('https://calendar.google.com/calendar/render');
    googleUrl.searchParams.append('action', 'TEMPLATE');
    googleUrl.searchParams.append('text', title);
    googleUrl.searchParams.append('details', description);
    googleUrl.searchParams.append('dates', 
      `${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z` +
      '/' +
      `${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
    );

    window.open(googleUrl.toString(), '_blank');
    onComplete();
  };

  if (showCalendarPrompt) {
    const device = detectDevice();
    
    return (
      <div className="text-center p-4">
        <h3 className="text-lg font-medium mb-4">Would you like to add this goal to your calendar?</h3>
        <div className="flex flex-col gap-3">
          {device.isIOS && (
            <button
              onClick={() => downloadCalendarFile('ics')}
              className="px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200"
            >
              Add to Apple Calendar
            </button>
          )}
          
          {device.isAndroid && (
            <>
              <button
                onClick={handleGoogleCalendar}
                className="px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200"
              >
                Add to Google Calendar
              </button>
              <button
                onClick={() => downloadCalendarFile('vcs')}
                className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
              >
                Download .vcs File
              </button>
            </>
          )}
          
          {!device.isMobile && (
            <div className="space-y-3">
              <button
                onClick={() => downloadCalendarFile('ics')}
                className="w-full px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200"
              >
                Download .ics File (Apple Calendar)
              </button>
              <button
                onClick={handleGoogleCalendar}
                className="w-full px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
              >
                Add to Google Calendar
              </button>
              <button
                onClick={() => downloadCalendarFile('vcs')}
                className="w-full px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200"
              >
                Download .vcs File (Other Calendars)
              </button>
            </div>
          )}
          
          <button
            onClick={() => onComplete()}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            Skip
          </button>
        </div>
      </div>
    );
  }

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
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          rows={3}
        />
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
          Due Date
        </label>
        <input
          type="datetime-local"
          id="dueDate"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          required
        />
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
          Add Goal
        </button>
      </div>
    </form>
  );
};