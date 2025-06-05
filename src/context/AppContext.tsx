import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Goal, Mood, Reminder, Habit, Widget, DailyFocus } from '../types';
import { saveUserData, loadUserData } from '../utils/firestore';
import { auth } from '../firebase';
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

const defaultState: AppState = {
  moods: [],
  goals: [],
  reminders: [],
  habits: [],
  lastCheckIn: null,
  streak: 0,
  todaysFocus: null,
  brainDump: [],
  widgets: defaultWidgets,
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultState);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        if (auth.currentUser) {
          const userData = await loadUserData(auth.currentUser.uid);
          if (userData) {
            setState(userData);
          }
          setIsInitialized(true);
          setError(null);
        }
      } catch (err) {
        console.error('Error initializing data:', err);
        setError('Failed to load your data. Please try refreshing the page.');
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isInitialized && auth.currentUser) {
      timeout = setTimeout(async () => {
        try {
          await saveUserData(auth.currentUser.uid, state);
          setError(null);
        } catch (err) {
          console.error('Error saving data:', err);
          setError('Failed to save your changes. Please check your connection.');
        }
      }, 1000);
    }

    return () => clearTimeout(timeout);
  }, [state, isInitialized]);

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

  const updateReminder = (id: string, updates: Partial<Reminder>) => {
    setState(prev => ({
      ...prev,
      reminders: prev.reminders.map(reminder =>
        reminder.id === id ? { ...reminder, ...updates } : reminder
      )
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

  const addHabit = (habit: Pick<Habit, 'title' | 'frequency' | 'color' | 'gameType'>) => {
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

        return {
          ...habit,
          completedDates,
          streak: calculateStreak(completedDates)
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
      todaysFocus: {
        text,
        timestamp: Date.now()
      }
    }));
  };

  const updateFocus = (text: string) => {
    setState(prev => ({
      ...prev,
      todaysFocus: prev.todaysFocus ? {
        ...prev.todaysFocus,
        text
      } : null
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

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
        {error}
      </div>
    );
  }

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
      updateReminder,
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