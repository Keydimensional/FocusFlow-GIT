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

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch {
    return fallback;
  }
}

export const loadState = (): AppState => {
  const state = loadFromStorage<AppState>(STORAGE_KEY, defaultState);
  
  // Ensure all properties have valid values
  return {
    ...defaultState,
    ...state,
    moods: Array.isArray(state.moods) ? state.moods : defaultState.moods,
    goals: Array.isArray(state.goals) ? state.goals : defaultState.goals,
    reminders: Array.isArray(state.reminders) ? state.reminders : defaultState.reminders,
    habits: Array.isArray(state.habits) ? state.habits : defaultState.habits,
    brainDump: Array.isArray(state.brainDump) ? state.brainDump : defaultState.brainDump,
    widgets: Array.isArray(state.widgets) ? state.widgets : defaultState.widgets,
    todaysFocus: state.todaysFocus || defaultState.todaysFocus,
    lastCheckIn: state.lastCheckIn || defaultState.lastCheckIn,
    streak: typeof state.streak === 'number' ? state.streak : defaultState.streak,
  };
};

export const saveState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state:', err);
  }
};