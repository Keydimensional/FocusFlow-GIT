import { AppState } from '../types';

const STORAGE_KEY = 'adhd-app-state';

const defaultState: AppState = {
  moods: [],
  goals: [],
  reminders: [],
  habits: [],
  brainDump: [],
  todaysFocus: null,
  lastCheckIn: null,
  streak: 0,
  widgets: [
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
  ],
};

const isStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

function loadFromStorage<T>(key: string, fallback: T): T {
  if (!isStorageAvailable()) {
    console.warn('localStorage is not available');
    return fallback;
  }

  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;

    const parsed = JSON.parse(item);
    if (!parsed || typeof parsed !== 'object') return fallback;

    return parsed;
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    return fallback;
  }
}

export const loadState = (): AppState => {
  const state = loadFromStorage<AppState>(STORAGE_KEY, defaultState);
  
  // Ensure all properties have valid values with type checking
  return {
    ...defaultState,
    ...state,
    moods: Array.isArray(state.moods) ? state.moods : defaultState.moods,
    goals: Array.isArray(state.goals) ? state.goals : defaultState.goals,
    reminders: Array.isArray(state.reminders) ? state.reminders : defaultState.reminders,
    habits: Array.isArray(state.habits) ? state.habits : defaultState.habits,
    brainDump: Array.isArray(state.brainDump) ? state.brainDump : defaultState.brainDump,
    widgets: Array.isArray(state.widgets) ? state.widgets : defaultState.widgets,
    todaysFocus: state.todaysFocus && typeof state.todaysFocus === 'object' ? state.todaysFocus : defaultState.todaysFocus,
    lastCheckIn: typeof state.lastCheckIn === 'string' ? state.lastCheckIn : defaultState.lastCheckIn,
    streak: typeof state.streak === 'number' && !isNaN(state.streak) ? state.streak : defaultState.streak,
  };
};

export const saveState = (state: AppState): void => {
  if (!isStorageAvailable()) {
    console.warn('localStorage is not available');
    return;
  }

  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
};