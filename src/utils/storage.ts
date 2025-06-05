import { AppState } from '../types';

const STORAGE_KEY = 'focusflow_state';

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

export const saveState = (state: AppState): void => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (error) {
    console.error('Failed to save state:', error);
  }
};

export const loadState = (): AppState => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (!serializedState) return defaultState;

    const parsedState = JSON.parse(serializedState);
    
    // Validate and merge with default state to ensure all properties exist
    return {
      ...defaultState,
      ...parsedState,
      // Ensure arrays are valid
      moods: Array.isArray(parsedState.moods) ? parsedState.moods : defaultState.moods,
      goals: Array.isArray(parsedState.goals) ? parsedState.goals : defaultState.goals,
      reminders: Array.isArray(parsedState.reminders) ? parsedState.reminders : defaultState.reminders,
      habits: Array.isArray(parsedState.habits) ? parsedState.habits : defaultState.habits,
      brainDump: Array.isArray(parsedState.brainDump) ? parsedState.brainDump : defaultState.brainDump,
      widgets: Array.isArray(parsedState.widgets) ? parsedState.widgets : defaultState.widgets,
    };
  } catch (error) {
    console.error('Failed to load state:', error);
    return defaultState;
  }
};