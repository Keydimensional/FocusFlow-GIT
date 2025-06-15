import React, { useState, useEffect } from 'react';
import { MoodCheck } from '../Mood/MoodCheck';
import { GoalList } from '../Goals/GoalList';
import { StreakCounter } from '../Streak/StreakCounter';
import { ReminderList } from '../Reminders/ReminderList';
import { MoodHistory } from '../Mood/MoodHistory';
import { HabitTracker } from '../Habits/HabitTracker';
import { DailyFocus } from '../Focus/DailyFocus';
import { BrainDump } from '../BrainDump/BrainDump';
import { FocusTimer } from '../Timer/FocusTimer';
import { MoodBoard } from '../MoodBoard/MoodBoard';
import { ListsWidget } from '../Lists/ListsWidget';
import { FocusModeOverlay } from '../Focus/FocusModeOverlay';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../Auth/AuthProvider';
import { getUserStorageKey } from '../../utils/storage';

const widgetEmojis = {
  dailyFocus: '🎯',
  focusTimer: '⏱️',
  streakCounter: '🔥',
  moodCheck: '😊',
  moodBoard: '💭',
  brainDump: '🧠',
  moodHistory: '📊',
  goalList: '✨',
  reminderList: '⏰',
  habitTracker: '📝',
  lists: '📋',
};

export const Dashboard: React.FC = () => {
  const { goals, reminders, widgets, todaysFocus } = useApp();
  const { user } = useAuth();
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [hasCheckedFocusToday, setHasCheckedFocusToday] = useState(false);

  const activeGoals = goals.filter(goal => !goal.completed);
  const activeReminders = reminders.filter(reminder => !reminder.completed);

  // Check if user needs to set today's focus - DAILY for all users
  useEffect(() => {
    if (!user || hasCheckedFocusToday) return;

    const checkDailyFocus = () => {
      const today = new Date();
      const lastFocusCheckKey = getUserStorageKey('lastFocusCheck', user.uid);
      const lastFocusCheck = localStorage.getItem(lastFocusCheckKey);
      const todayString = today.toDateString();

      // Check if we've already checked today
      if (lastFocusCheck === todayString) {
        setHasCheckedFocusToday(true);
        return;
      }

      // Check if user has MANUALLY set a valid focus for today
      const hasTodaysFocus = todaysFocus && 
        todaysFocus.text && 
        todaysFocus.text.trim() !== '' && 
        (() => {
          const focusDate = new Date(todaysFocus.timestamp);
          return (
            today.getFullYear() === focusDate.getFullYear() &&
            today.getMonth() === focusDate.getMonth() &&
            today.getDate() === focusDate.getDate()
          );
        })();

      if (!hasTodaysFocus) {
        // Show focus mode overlay for daily prompt
        console.log('🎯 Showing daily focus prompt - no valid focus set today');
        setShowFocusMode(true);
      }

      // Mark that we've checked today
      localStorage.setItem(lastFocusCheckKey, todayString);
      setHasCheckedFocusToday(true);
    };

    // Small delay to ensure app is fully loaded
    const timer = setTimeout(checkDailyFocus, 1000);
    return () => clearTimeout(timer);
  }, [user, todaysFocus, hasCheckedFocusToday]);

  const handleFocusModeComplete = () => {
    setShowFocusMode(false);
  };

  const handleFocusModeSkip = () => {
    setShowFocusMode(false);
    // Mark as checked so it doesn't show again today
    if (user) {
      const todayString = new Date().toDateString();
      const lastFocusCheckKey = getUserStorageKey('lastFocusCheck', user.uid);
      localStorage.setItem(lastFocusCheckKey, todayString);
    }
  };

  const getVisibleWidgets = (columnStart: number, columnEnd: number) => {
    return widgets
      .filter(w => w.visible && w.order >= columnStart && w.order < columnEnd)
      .sort((a, b) => a.order - b.order);
  };

  const renderWidget = (widget: typeof widgets[0]) => {
    switch (widget.type) {
      case 'dailyFocus':
        return <DailyFocus key={widget.id} />;
      case 'focusTimer':
        return <FocusTimer key={widget.id} />;
      case 'streakCounter':
        return <StreakCounter key={widget.id} />;
      case 'moodCheck':
        return <MoodCheck key={widget.id} />;
      case 'moodBoard':
        return <MoodBoard key={widget.id} />;
      case 'brainDump':
        return <BrainDump key={widget.id} />;
      case 'moodHistory':
        return <MoodHistory key={widget.id} />;
      case 'goalList':
        return <GoalList key={widget.id} goals={activeGoals} />;
      case 'reminderList':
        return <ReminderList key={widget.id} reminders={activeReminders} />;
      case 'habitTracker':
        return <HabitTracker key={widget.id} />;
      case 'lists':
        return <ListsWidget key={widget.id} />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Main Dashboard Content */}
      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-all duration-300 ${
        showFocusMode ? 'blur-sm pointer-events-none' : ''
      }`}>
        {/* First Column: Priority widgets (0-3) */}
        <div className="space-y-6">
          {getVisibleWidgets(0, 4).map(renderWidget)}
        </div>
        
        {/* Second Column: Secondary widgets (4-7) */}
        <div className="space-y-6">
          {getVisibleWidgets(4, 8).map(renderWidget)}
        </div>
        
        {/* Third Column: Tertiary widgets (8-11) */}
        <div className="space-y-6">
          {getVisibleWidgets(8, 12).map(renderWidget)}
        </div>
      </div>

      {/* Focus Mode Overlay - Now shows daily for all users */}
      <FocusModeOverlay
        isVisible={showFocusMode}
        onComplete={handleFocusModeComplete}
        onSkip={handleFocusModeSkip}
      />
    </>
  );
};