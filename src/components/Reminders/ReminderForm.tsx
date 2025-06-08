import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Volume2, VolumeX } from 'lucide-react';
import { detectDevice } from '../../utils/deviceDetection';

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
  const [showCalendarPrompt, setShowCalendarPrompt] = useState(false);

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
    setShowCalendarPrompt(true);
  };

  const generateCalendarContent = (format: 'ics' | 'vcs') => {
    const dateStr = new Date(datetime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    if (format === 'ics') {
      return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${title}
DESCRIPTION:BrainBounce Reminder
DTSTART:${dateStr}
DTEND:${dateStr}
END:VEVENT
END:VCALENDAR`;
    }
    
    return `BEGIN:VCALENDAR
VERSION:1.0
BEGIN:VEVENT
SUMMARY:${title}
DESCRIPTION:BrainBounce Reminder
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
    const startDate = new Date(datetime);
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 1);

    const googleUrl = new URL('https://calendar.google.com/calendar/render');
    googleUrl.searchParams.append('action', 'TEMPLATE');
    googleUrl.searchParams.append('text', title);
    googleUrl.searchParams.append('details', 'BrainBounce Reminder');
    googleUrl.searchParams.append('dates', 
      `${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z` +
      '/' +
      `${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
    );

    window.open(googleUrl.toString(), '_blank');
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

  if (showCalendarPrompt) {
    const device = detectDevice();
    
    return (
      <div className="text-center p-4">
        <h3 className="text-lg font-medium mb-4">Would you like to add this reminder to your calendar?</h3>
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
            💡 <strong>Web App:</strong> Reminders will show as in-app popups with optional sound alerts while BrainBounce is open in your browser. Future native mobile apps will support background notifications!
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