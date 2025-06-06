import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Goal, Mood, Reminder, Habit, Widget } from '../types';
import { saveState, loadState } from '../utils/storage';
import { formatDate, isConsecutiveDay, isToday, calculateStreak } from '../utils/dateUtils';
import { useAuth } from '../components/Auth/AuthProvider';
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
  isCloudSyncAvailable: boolean;
  retryCloudSync: () => void;
  dataLoadError: string | null;
  retryDataLoad: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

// Safe ID generation for mobile compatibility
const generateId = (): string => {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch (error) {
    console.warn('crypto.randomUUID failed, using fallback:', error);
  }
  
  // Fallback for older browsers
  return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, syncUserData, loadUserData, isCloudSyncAvailable, retryCloudSync } = useAuth();
  const [state, setState] = useState<AppState>(() => {
    try {
      return loadState();
    } catch (error) {
      console.error('Failed to load initial state:', error);
      return loadState(); // loadState has its own error handling
    }
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);

  // Debounced save function to prevent too frequent writes
  const debouncedSave = debounce((newState: AppState) => {
    try {
      // Always save to local storage first
      saveState(newState);
      
      // Sync to Firestore if user is authenticated
      if (user) {
        syncUserData(newState).catch(error => {
          console.error('Failed to sync to Firestore:', error);
          // Don't show error to user as local save succeeded
        });
      }
    } catch (error) {
      console.error('Failed to save state:', error);
      setDataLoadError('Failed to save data locally. Please check your browser storage.');
    }
  }, 2000);

  // Load user data when user signs in
  useEffect(() => {
    const initializeUserData = async () => {
      if (user && !isInitialized) {
        setDataLoadError(null);
        
        try {
          console.log('🔄 Loading user data...');
          const userData = await loadUserData();
          
          if (userData) {
            console.log('✅ User data loaded from cloud');
            setState(userData);
          } else {
            console.log('📱 Using local data');
            // Keep current local state
          }
          
        } catch (error: any) {
          console.error('❌ Failed to load user data:', error);
          
          // Set user-friendly error message
          let errorMessage = 'Failed to load your data from the cloud. Using local data instead.';
          
          if (error.code === 'permission-denied') {
            errorMessage = 'Cloud sync is not available. Your data is saved locally.';
          } else if (error.code === 'unavailable') {
            errorMessage = 'Cloud service is temporarily unavailable. Using local data.';
          }
          
          setDataLoadError(errorMessage);
          
          // Continue with local state
        } finally {
          setIsInitialized(true);
        }
      } else if (!user && isInitialized) {
        // User signed out, reset to local state
        console.log('🔄 User signed out, resetting to local state');
        setIsInitialized(false);
        setDataLoadError(null);
        setState(loadState());
      }
    };

    initializeUserData();
  }, [user, loadUserData, isInitialized]);

  // Save state changes
  useEffect(() => {
    if (isInitialized || !user) {
      try {
        debouncedSave(state);
      } catch (error) {
        console.error('Failed to schedule save:', error);
        setDataLoadError('Failed to save data. Please try again.');
      }
    }
  }, [state, isInitialized, user, debouncedSave]);

  // Check daily interactions
  useEffect(() => {
    try {
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
    } catch (error) {
      console.error('Error in daily interactions check:', error);
    }
  }, [state.goals, state.reminders, state.habits, state.moods]);

  const retryDataLoad = async () => {
    if (!user) return;
    
    setDataLoadError(null);
    
    try {
      console.log('🔄 Retrying data load...');
      const userData = await loadUserData();
      
      if (userData) {
        console.log('✅ Data load retry successful');
        setState(userData);
      }
      
    } catch (error: any) {
      console.error('❌ Data load retry failed:', error);
      setDataLoadError('Retry failed. Please check your connection and try again.');
    }
  };

  const handleRetryCloudSync = () => {
    retryCloudSync();
    setDataLoadError(null);
    
    // Try to sync current state
    if (user) {
      syncUserData(state).catch(error => {
        console.error('Failed to sync after retry:', error);
      });
    }
  };

  const contextValue: AppContextType = {
    ...state,
    isCloudSyncAvailable: isCloudSyncAvailable(),
    retryCloudSync: handleRetryCloudSync,
    dataLoadError,
    retryDataLoad,
    
    addMood: (mood: Mood, reflection?: string) => {
      try {
        const date = formatDate(new Date());
        setState(prev => ({
          ...prev,
          moods: [...prev.moods, { date, mood, reflection }]
        }));
      } catch (error) {
        console.error('Error adding mood:', error);
        setDataLoadError('Failed to add mood. Please try again.');
      }
    },
    
    updateMood: (date: string, mood: Mood, reflection?: string) => {
      try {
        setState(prev => ({
          ...prev,
          moods: prev.moods.map(entry => 
            entry.date === date 
              ? { ...entry, mood, reflection }
              : entry
          )
        }));
      } catch (error) {
        console.error('Error updating mood:', error);
        setDataLoadError('Failed to update mood. Please try again.');
      }
    },
    
    addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'completed'>) => {
      try {
        const newGoal: Goal = {
          ...goal,
          id: generateId(),
          createdAt: new Date().toISOString(),
          completed: false
        };
        setState(prev => ({
          ...prev,
          goals: [...prev.goals, newGoal]
        }));
      } catch (error) {
        console.error('Error adding goal:', error);
        setDataLoadError('Failed to add goal. Please try again.');
      }
    },
    
    updateGoal: (id: string, updates: Partial<Goal>) => {
      try {
        setState(prev => ({
          ...prev,
          goals: prev.goals.map(goal =>
            goal.id === id ? { ...goal, ...updates } : goal
          )
        }));
      } catch (error) {
        console.error('Error updating goal:', error);
        setDataLoadError('Failed to update goal. Please try again.');
      }
    },
    
    toggleGoal: (id: string) => {
      try {
        setState(prev => ({
          ...prev,
          goals: prev.goals.map(goal =>
            goal.id === id ? { ...goal, completed: !goal.completed } : goal
          )
        }));
      } catch (error) {
        console.error('Error toggling goal:', error);
        setDataLoadError('Failed to update goal. Please try again.');
      }
    },
    
    deleteGoal: (id: string) => {
      try {
        setState(prev => ({
          ...prev,
          goals: prev.goals.filter(goal => goal.id !== id)
        }));
      } catch (error) {
        console.error('Error deleting goal:', error);
        setDataLoadError('Failed to delete goal. Please try again.');
      }
    },
    
    addReminder: (reminder: Omit<Reminder, 'id' | 'completed'>) => {
      try {
        const newReminder: Reminder = {
          ...reminder,
          id: generateId(),
          completed: false
        };
        setState(prev => ({
          ...prev,
          reminders: [...prev.reminders, newReminder]
        }));
      } catch (error) {
        console.error('Error adding reminder:', error);
        setDataLoadError('Failed to add reminder. Please try again.');
      }
    },
    
    updateReminder: (id: string, updates: Partial<Reminder>) => {
      try {
        setState(prev => ({
          ...prev,
          reminders: prev.reminders.map(reminder =>
            reminder.id === id ? { ...reminder, ...updates } : reminder
          )
        }));
      } catch (error) {
        console.error('Error updating reminder:', error);
        setDataLoadError('Failed to update reminder. Please try again.');
      }
    },
    
    toggleReminder: (id: string) => {
      try {
        setState(prev => ({
          ...prev,
          reminders: prev.reminders.map(reminder =>
            reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder
          )
        }));
      } catch (error) {
        console.error('Error toggling reminder:', error);
        setDataLoadError('Failed to update reminder. Please try again.');
      }
    },
    
    deleteReminder: (id: string) => {
      try {
        setState(prev => ({
          ...prev,
          reminders: prev.reminders.filter(reminder => reminder.id !== id)
        }));
      } catch (error) {
        console.error('Error deleting reminder:', error);
        setDataLoadError('Failed to delete reminder. Please try again.');
      }
    },
    
    addHabit: (habit: Pick<Habit, 'title' | 'frequency' | 'color' | 'gameType'>) => {
      try {
        const newHabit: Habit = {
          ...habit,
          id: generateId(),
          completedDates: [],
          streak: 0,
          createdAt: new Date().toISOString()
        };
        setState(prev => ({
          ...prev,
          habits: [...prev.habits, newHabit]
        }));
      } catch (error) {
        console.error('Error adding habit:', error);
        setDataLoadError('Failed to add habit. Please try again.');
      }
    },
    
    toggleHabit: (id: string) => {
      try {
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
      } catch (error) {
        console.error('Error toggling habit:', error);
        setDataLoadError('Failed to update habit. Please try again.');
      }
    },
    
    deleteHabit: (id: string) => {
      try {
        setState(prev => ({
          ...prev,
          habits: prev.habits.filter(habit => habit.id !== id)
        }));
      } catch (error) {
        console.error('Error deleting habit:', error);
        setDataLoadError('Failed to delete habit. Please try again.');
      }
    },
    
    addFocus: (text: string) => {
      try {
        setState(prev => ({
          ...prev,
          todaysFocus: {
            text,
            timestamp: Date.now()
          }
        }));
      } catch (error) {
        console.error('Error adding focus:', error);
        setDataLoadError('Failed to set focus. Please try again.');
      }
    },
    
    updateFocus: (text: string) => {
      try {
        setState(prev => ({
          ...prev,
          todaysFocus: prev.todaysFocus ? {
            ...prev.todaysFocus,
            text
          } : null
        }));
      } catch (error) {
        console.error('Error updating focus:', error);
        setDataLoadError('Failed to update focus. Please try again.');
      }
    },
    
    addBrainDump: (text: string) => {
      try {
        const newItem = {
          id: generateId(),
          text,
          timestamp: Date.now(),
        };
        setState(prev => ({
          ...prev,
          brainDump: [...prev.brainDump, newItem],
        }));
      } catch (error) {
        console.error('Error adding brain dump:', error);
        setDataLoadError('Failed to add brain dump. Please try again.');
      }
    },
    
    clearBrainDump: () => {
      try {
        setState(prev => ({
          ...prev,
          brainDump: [],
        }));
      } catch (error) {
        console.error('Error clearing brain dump:', error);
        setDataLoadError('Failed to clear brain dump. Please try again.');
      }
    },
    
    updateWidgetOrder: (widgets: Widget[]) => {
      try {
        setState(prev => ({
          ...prev,
          widgets,
        }));
      } catch (error) {
        console.error('Error updating widget order:', error);
        setDataLoadError('Failed to update widget order. Please try again.');
      }
    },
    
    toggleWidget: (widgetId: string) => {
      try {
        setState(prev => ({
          ...prev,
          widgets: prev.widgets.map(widget =>
            widget.id === widgetId
              ? { ...widget, visible: !widget.visible }
              : widget
          ),
        }));
      } catch (error) {
        console.error('Error toggling widget:', error);
        setDataLoadError('Failed to toggle widget. Please try again.');
      }
    },
    
    resetWidgets: () => {
      try {
        setState(prev => ({
          ...prev,
          widgets: loadState().widgets,
        }));
      } catch (error) {
        console.error('Error resetting widgets:', error);
        setDataLoadError('Failed to reset widgets. Please try again.');
      }
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