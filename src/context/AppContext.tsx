import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Goal, Mood, Reminder, Habit, Widget } from '../types';
import { loadState, saveState } from '../utils/storage';
import { formatDate, isConsecutiveDay, isToday } from '../utils/dateUtils';

interface AppContextType extends AppState {
  addMood: (mood: Mood, reflection?: string) => void;
  updateMood: (date: string, mood: Mood, reflection?: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'completed'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  toggleGoal: (id: string) => void;
  deleteGoal: (id: string) => void;
  addReminder: (reminder: Omit<Reminder, 'id' | 'completed'>) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
  addHabit: (habit: Pick<Habit, 'title' | 'frequency' | 'color'>) => void;
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
    const savedState = loadState();
    return {
      ...savedState,
      moods: Array.isArray(savedState.moods) ? savedState.moods : [],
      widgets: savedState.widgets || defaultWidgets,
    };
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

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

  const addMood = (mood: Mood, reflection?: string) => {
    const date = formatDate(new Date());
    setState(prev => ({
      ...prev,
      moods: [...prev.moods, { date, mood, reflection }]
    }));
  };

  const updateMood = (date: string, mood: Mood, reflection?: string) => {
    setState(prev => ({
      ...prev,
      moods: prev.moods.map(entry => 
        entry.date === date 
          ? { ...entry, mood, reflection }
          : entry
      )
    }));
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt' | 'completed'>) => {
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
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(goal =>
        goal.id === id ? { ...goal, ...updates } : goal
      )
    }));
  };

  const toggleGoal = (id: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(goal =>
        goal.id === id ? { ...goal, completed: !goal.completed } : goal
      )
    }));
  };

  const deleteGoal = (id: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.filter(goal => goal.id !== id)
    }));
  };

  const addReminder = (reminder: Omit<Reminder, 'id' | 'completed'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: crypto.randomUUID(),
      completed: false
    };
    setState(prev => ({
      ...prev,
      reminders: [...prev.reminders, newReminder]
    }));
  };

  const toggleReminder = (id: string) => {
    setState(prev => ({
      ...prev,
      reminders: prev.reminders.map(reminder =>
        reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder
      )
    }));
  };

  const deleteReminder = (id: string) => {
    setState(prev => ({
      ...prev,
      reminders: prev.reminders.filter(reminder => reminder.id !== id)
    }));
  };

  const addHabit = (habit: Pick<Habit, 'title' | 'frequency' | 'color'>) => {
    const newHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      completedDates: [],
      streak: 0
    };
    setState(prev => ({
      ...prev,
      habits: [...prev.habits, newHabit]
    }));
  };

  const toggleHabit = (id: string) => {
    const today = formatDate(new Date());
    setState(prev => ({
      ...prev,
      habits: prev.habits.map(habit => {
        if (habit.id !== id) return habit;

        const isCompleted = habit.completedDates.includes(today);
        const completedDates = isCompleted
          ? habit.completedDates.filter(date => date !== today)
          : [...habit.completedDates, today];

        const streak = isCompleted
          ? habit.streak - (isConsecutiveDay(habit.completedDates, today) ? 1 : 0)
          : habit.streak + (isConsecutiveDay(habit.completedDates, today) ? 1 : 0);

        return {
          ...habit,
          completedDates,
          streak: Math.max(0, streak)
        };
      })
    }));
  };

  const deleteHabit = (id: string) => {
    setState(prev => ({
      ...prev,
      habits: prev.habits.filter(habit => habit.id !== id)
    }));
  };

  const addFocus = (text: string) => {
    setState(prev => ({
      ...prev,
      dailyFocus: {
        text,
        date: formatDate(new Date())
      }
    }));
  };

  const updateFocus = (text: string) => {
    setState(prev => ({
      ...prev,
      dailyFocus: {
        ...prev.dailyFocus,
        text
      }
    }));
  };

  const addBrainDump = (text: string) => {
    const newItem = {
      id: crypto.randomUUID(),
      text,
      timestamp: Date.now(),
    };
    
    setState(prev => ({
      ...prev,
      brainDump: [...prev.brainDump, newItem],
    }));
  };

  const clearBrainDump = () => {
    setState(prev => ({
      ...prev,
      brainDump: [],
    }));
  };

  const updateWidgetOrder = (widgets: Widget[]) => {
    setState(prev => ({
      ...prev,
      widgets,
    }));
  };

  const toggleWidget = (widgetId: string) => {
    setState(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget =>
        widget.id === widgetId
          ? { ...widget, visible: !widget.visible }
          : widget
      ),
    }));
  };

  const resetWidgets = () => {
    setState(prev => ({
      ...prev,
      widgets: defaultWidgets,
    }));
  };

  return (
    <AppContext.Provider value={{
      ...state,
      addMood,
      updateMood,
      addGoal,
      updateGoal,
      toggleGoal,
      deleteGoal,
      addReminder,
      toggleReminder,
      deleteReminder,
      addHabit,
      toggleHabit,
      deleteHabit,
      addFocus,
      updateFocus,
      addBrainDump,
      clearBrainDump,
      updateWidgetOrder,
      toggleWidget,
      resetWidgets,
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