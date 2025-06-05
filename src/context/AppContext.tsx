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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize data when auth state changes
  useEffect(() => {
    let mounted = true;

    const initializeData = async () => {
      if (!auth.currentUser) {
        if (mounted) {
          setIsLoading(false);
          setIsInitialized(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const userData = await loadUserData(auth.currentUser.uid);
        
        if (mounted) {
          if (userData) {
            setState(userData);
          }
          setIsInitialized(true);
          setError(null);
        }
      } catch (err) {
        console.error('Error initializing data:', err);
        if (mounted) {
          setError('Failed to load your data. Please try refreshing the page.');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeData();

    return () => {
      mounted = false;
    };
  }, [auth.currentUser?.uid]);

  // Save state changes
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isInitialized && auth.currentUser && !isLoading) {
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
  }, [state, isInitialized, isLoading]);

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

    if (!isLoading && isInitialized) {
      checkDailyInteractions();
    }
  }, [state.goals, state.reminders, state.habits, state.moods, isLoading, isInitialized]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
        widgets: defaultWidgets,
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