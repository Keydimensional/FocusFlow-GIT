import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Goal, Mood, Reminder, Habit, Widget } from '../types';
import { loadState, saveState } from '../utils/storage';
import { formatDate, isConsecutiveDay, isToday, calculateStreak } from '../utils/dateUtils';

interface AppContextType extends AppState {
  addMood: (mood: Mood, reflection?: string) => void;
  updateMood: (date: string, mood: Mood, reflection?: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'completed'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  toggleGoal: (id: string) => void;
  deleteGoal: (id: string) => void;
  addReminder: (reminder: Omit<Reminder, 'id' | 'completed'>) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
  addHabit: (habit: Pick<Habit, 'title' | 'frequency' | 'color' | 'gameType'>) => void;
  toggleHabit: (id: string) => void;
  deleteHabit: (id: string) => void;
  addFocus: (text: string) => void;
  updateFocus: (text: string) => void;
  addBrainDump: (text: string) => void;
  clearBrainDump: () => void;
  updateWidgetOrder: (widgets: Widget[]) => void;
  toggleWidget: (widgetId: string) => void;
  resetWidgets: () => void;
}

const defaultWidgets: Widget[] = [
  { id: 'dailyFocus', type: 'dailyFocus', visible: true, order: 0 },
  { id: 'focusTimer', type: 'focusTimer', visible: true, order: 1 },
  { id: 'streakCounter', type: 'streakCounter', visible: true, order: 2 },
  { id: 'moodCheck', type: 'moodCheck', visible: true, order: 3 },
  { id: 'moodBoard', type: 'moodBoard', visible: true, order: 4 },
  { id: 'brainDump', type: 'brainDump', visible: true, order: 5 },
  { id: 'moodHistory', type: 'moodHistory', visible: true, order: 6 },
  { id: 'goalList', type: 'goalList', visible: true, order: 7 },
  { id: 'reminderList', type: 'reminderList', visible: true, order: 8 },
  { id: 'habitTracker', type: 'habitTracker', visible: true, order: 9 },
];

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const savedState = loadState() ?? {};
    return {
      goals: Array.isArray(savedState.goals) ? savedState.goals : [],
      reminders: Array.isArray(savedState.reminders) ? savedState.reminders : [],
      habits: Array.isArray(savedState.habits) ? savedState.habits : [],
      moods: Array.isArray(savedState.moods) ? savedState.moods : [],
      todaysFocus: savedState.todaysFocus || null,
      brainDump: Array.isArray(savedState.brainDump) ? savedState.brainDump : [],
      widgets: savedState.widgets || defaultWidgets,
      streak: typeof savedState.streak === 'number' ? savedState.streak : 0,
      lastCheckIn: savedState.lastCheckIn || null,
    };
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  // ...rest of the unchanged context logic (not repeated here to save space)

  return (
    <AppContext.Provider value={{
      ...state,
      // all your defined actions like addGoal, toggleHabit, etc.
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
