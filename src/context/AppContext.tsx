import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Goal, Mood, Reminder, Habit, Widget } from '../types';
import { saveState, loadState } from '../utils/storage';
import { formatDate, isConsecutiveDay, isToday, calculateStreak } from '../utils/dateUtils';
import debounce from 'lodash/debounce';

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

const AppContext = createContext<AppContextType | null>(null);

// Debounced save function to prevent too frequent writes
const debouncedSave = debounce((state: AppState) => {
  saveState(state);
}, 1000);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(loadState());

  // Save state changes to localStorage
  useEffect(() => {
    debouncedSave(state);
  }, [state]);

  // Check daily interactions
  useEffect(() => {
    const checkDailyInteractions = () => {
      const today = formatDate(new Date());
      const hasInteractedToday = 
        state.goals.some(goal => goal.completed) ||
        state.reminders.some(reminder => reminder.completed) ||
        state.habits.some(habit => habit.completedDates.includes(today)) ||
        state.moods.some(mood => mood.date === today);

      if (hasInteractedToday && (!state.lastCheckIn || !isToday(state.lastCheckIn))) {
        setState(prev => ({
          ...prev,
          lastCheckIn: today,
          streak: prev.lastCheckIn && isConsecutiveDay(prev.lastCheckIn, today) 
            ? prev.streak + 1 
            : 1
        }));
      }
    };

    checkDailyInteractions();
  }, [state.goals, state.reminders, state.habits, state.moods]);

  const contextValue: AppContextType = {
    ...state,
    addMood: (mood: Mood, reflection?: string) => {
      const date = formatDate(new Date());
      setState(prev => ({
        ...prev,
        moods: [...prev.moods, { date, mood, reflection }]
      }));
    },
    updateMood: (date: string, mood: Mood, reflection?: string) => {
      setState(prev => ({
        ...prev,
        moods: prev.moods.map(entry => 
          entry.date === date 
            ? { ...entry, mood, reflection }
            : entry
        )
      }));
    },
    addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'completed'>) => {
      const newGoal: Goal = {
        ...goal,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        completed: false
      };
      setState(prev => ({
        ...prev,
        goals: [...prev.goals, newGoal]
      }));
    },
    updateGoal: (id: string, updates: Partial<Goal>) => {
      setState(prev => ({
        ...prev,
        goals: prev.goals.map(goal =>
          goal.id === id ? { ...goal, ...updates } : goal
        )
      }));
    },
    toggleGoal: (id: string) => {
      setState(prev => ({
        ...prev,
        goals: prev.goals.map(goal =>
          goal.id === id ? { ...goal, completed: !goal.completed } : goal
        )
      }));
    },
    deleteGoal: (id: string) => {
      setState(prev => ({
        ...prev,
        goals: prev.goals.filter(goal => goal.id !== id)
      }));
    },
    addReminder: (reminder: Omit<Reminder, 'id' | 'completed'>) => {
      const newReminder: Reminder = {
        ...reminder,
        id: crypto.randomUUID(),
        completed: false
      };
      setState(prev => ({
        ...prev,
        reminders: [...prev.reminders, newReminder]
      }));
    },
    updateReminder: (id: string, updates: Partial<Reminder>) => {
      setState(prev => ({
        ...prev,
        reminders: prev.reminders.map(reminder =>
          reminder.id === id ? { ...reminder, ...updates } : reminder
        )
      }));
    },
    toggleReminder: (id: string) => {
      setState(prev => ({
        ...prev,
        reminders: prev.reminders.map(reminder =>
          reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder
        )
      }));
    },
    deleteReminder: (id: string) => {
      setState(prev => ({
        ...prev,
        reminders: prev.reminders.filter(reminder => reminder.id !== id)
      }));
    },
    addHabit: (habit: Pick<Habit, 'title' | 'frequency' | 'color' | 'gameType'>) => {
      const newHabit: Habit = {
        ...habit,
        id: crypto.randomUUID(),
        completedDates: [],
        streak: 0,
        createdAt: new Date().toISOString()
      };
      setState(prev => ({
        ...prev,
        habits: [...prev.habits, newHabit]
      }));
    },
    toggleHabit: (id: string) => {
      const today = formatDate(new Date());
      setState(prev => ({
        ...prev,
        habits: prev.habits.map(habit => {
          if (habit.id !== id) return habit;

          const isCompleted = habit.completedDates.includes(today);
          const completedDates = isCompleted
            ? habit.completedDates.filter(date => date !== today)
            : [...habit.completedDates, today];

          return {
            ...habit,
            completedDates,
            streak: calculateStreak(completedDates)
          };
        })
      }));
    },
    deleteHabit: (id: string) => {
      setState(prev => ({
        ...prev,
        habits: prev.habits.filter(habit => habit.id !== id)
      }));
    },
    addFocus: (text: string) => {
      setState(prev => ({
        ...prev,
        todaysFocus: {
          text,
          timestamp: Date.now()
        }
      }));
    },
    updateFocus: (text: string) => {
      setState(prev => ({
        ...prev,
        todaysFocus: prev.todaysFocus ? {
          ...prev.todaysFocus,
          text
        } : null
      }));
    },
    addBrainDump: (text: string) => {
      const newItem = {
        id: crypto.randomUUID(),
        text,
        timestamp: Date.now(),
      };
      setState(prev => ({
        ...prev,
        brainDump: [...prev.brainDump, newItem],
      }));
    },
    clearBrainDump: () => {
      setState(prev => ({
        ...prev,
        brainDump: [],
      }));
    },
    updateWidgetOrder: (widgets: Widget[]) => {
      setState(prev => ({
        ...prev,
        widgets,
      }));
    },
    toggleWidget: (widgetId: string) => {
      setState(prev => ({
        ...prev,
        widgets: prev.widgets.map(widget =>
          widget.id === widgetId
            ? { ...widget, visible: !widget.visible }
            : widget
        ),
      }));
    },
    resetWidgets: () => {
      setState(prev => ({
        ...prev,
        widgets: loadState().widgets,
      }));
    },
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};