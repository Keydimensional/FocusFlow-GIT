import React from 'react';
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
import { useApp } from '../../context/AppContext';

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
  const { goals, reminders, widgets } = useApp();
  const activeGoals = goals.filter(goal => !goal.completed);
  const activeReminders = reminders.filter(reminder => !reminder.completed);

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* First Column: Priority widgets (0-3) */}
      <div className="space-y-6">
        {getVisibleWidgets(0, 4).map(renderWidget)}
      </div>
      
      {/* Second Column: Secondary widgets (4-7) */}
      <div className="space-y-6">
        {getVisibleWidgets(4, 8).map(renderWidget)}
      </div>
      
      {/* Third Column: Tertiary widgets (8-11) - Lists positioned after Mood History */}
      <div className="space-y-6">
        {getVisibleWidgets(8, 12).map(renderWidget)}
      </div>
    </div>
  );
};