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

export const loadState = (): AppState => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (!serializedState) return defaultState;
    
    const parsedState = JSON.parse(serializedState);
    
    return {
      ...defaultState,
      ...parsedState,
      moods: Array.isArray(parsedState.moods) ? parsedState.moods : [],
      goals: Array.isArray(parsedState.goals) ? parsedState.goals : [],
      reminders: Array.isArray(parsedState.reminders) ? parsedState.reminders : [],
      habits: Array.isArray(parsedState.habits) ? parsedState.habits : [],
      brainDump: Array.isArray(parsedState.brainDump) ? parsedState.brainDump : [],
      widgets: Array.isArray(parsedState.widgets) ? parsedState.widgets : defaultState.widgets,
      todaysFocus: parsedState.todaysFocus || null,
      lastCheckIn: parsedState.lastCheckIn || null,
      streak: typeof parsedState.streak === 'number' ? parsedState.streak : 0,
    };
  } catch {
    return defaultState;
  }
};

export const saveState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state:', err);
  }
};