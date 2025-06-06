import { AppState } from '../types';

const STORAGE_KEY = 'focusflow_state';

const defaultState: AppState = {
  moods: [],
  goals: [],
  reminders: [],
  habits: [],
  lists: [],
  brainDump: [],
  todaysFocus: null,
  lastCheckIn: null,
  streak: 0,
  widgets: [
    // First Column (0-3): Priority widgets
    { id: 'dailyFocus', type: 'dailyFocus', visible: true, order: 0 },
    { id: 'goalList', type: 'goalList', visible: true, order: 1 },
    { id: 'focusTimer', type: 'focusTimer', visible: true, order: 2 },
    { id: 'reminderList', type: 'reminderList', visible: true, order: 3 },
    
    // Second Column (4-7): Secondary widgets - balanced height
    { id: 'streakCounter', type: 'streakCounter', visible: true, order: 4 },
    { id: 'moodCheck', type: 'moodCheck', visible: true, order: 5 },
    { id: 'habitTracker', type: 'habitTracker', visible: true, order: 6 },
    { id: 'moodBoard', type: 'moodBoard', visible: true, order: 7 },
    
    // Third Column (8-11): Tertiary widgets - optimized for visual balance
    { id: 'moodHistory', type: 'moodHistory', visible: true, order: 8 },
    { id: 'lists', type: 'lists', visible: true, order: 9 },
    { id: 'brainDump', type: 'brainDump', visible: true, order: 10 },
  ],
};

export const saveState = (state: AppState): void => {
  try {
    // Check if localStorage is available
    if (typeof Storage === 'undefined') {
      console.warn('localStorage not available');
      return;
    }

    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
    console.log('State saved successfully');
  } catch (error) {
    console.error('Failed to save state:', error);
    
    // Try to clear some space and retry
    try {
      localStorage.removeItem(STORAGE_KEY);
      const serializedState = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY, serializedState);
      console.log('State saved successfully after clearing');
    } catch (retryError) {
      console.error('Failed to save state even after clearing:', retryError);
    }
  }
};

export const loadState = (): AppState => {
  try {
    // Check if localStorage is available
    if (typeof Storage === 'undefined') {
      console.warn('localStorage not available, using default state');
      return defaultState;
    }

    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (!serializedState) {
      console.log('No saved state found, using default state');
      return defaultState;
    }

    const parsedState = JSON.parse(serializedState);
    
    // CRITICAL: Force migration for existing users to ensure Lists widget is visible
    let widgets = Array.isArray(parsedState.widgets) ? [...parsedState.widgets] : [...defaultState.widgets];
    
    // Check if Lists widget exists
    const hasListsWidget = widgets.some(w => w.type === 'lists');
    
    if (!hasListsWidget) {
      // Add Lists widget if it doesn't exist
      widgets.push({ id: 'lists', type: 'lists', visible: true, order: 9 });
      console.log('✅ Added missing Lists widget for existing user');
    }
    
    // Ensure all widgets are visible by default (migration for existing users)
    widgets = widgets.map(widget => ({
      ...widget,
      visible: widget.visible !== false // Force visible unless explicitly set to false
    }));
    
    // Ensure all default widgets exist (add any missing ones)
    const defaultWidgetTypes = defaultState.widgets.map(w => w.type);
    const existingWidgetTypes = widgets.map(w => w.type);
    
    defaultWidgetTypes.forEach(type => {
      if (!existingWidgetTypes.includes(type)) {
        const defaultWidget = defaultState.widgets.find(w => w.type === type);
        if (defaultWidget) {
          widgets.push({ ...defaultWidget, visible: true });
          console.log(`✅ Added missing ${type} widget for existing user`);
        }
      }
    });
    
    // Sort widgets by order
    widgets.sort((a, b) => a.order - b.order);
    
    // Ensure each list has a valid items array and filter out invalid list objects
    const validatedLists = Array.isArray(parsedState.lists) 
      ? parsedState.lists
          .filter((list: any) => list && typeof list === 'object' && list.id) // Filter out null, undefined, or invalid list objects
          .map((list: any) => ({
            ...list,
            items: Array.isArray(list.items) ? list.items : []
          }))
      : defaultState.lists;
    
    // Validate and merge with default state to ensure all properties exist
    const mergedState = {
      ...defaultState,
      ...parsedState,
      // Ensure arrays are valid
      moods: Array.isArray(parsedState.moods) ? parsedState.moods : defaultState.moods,
      goals: Array.isArray(parsedState.goals) ? parsedState.goals : defaultState.goals,
      reminders: Array.isArray(parsedState.reminders) ? parsedState.reminders : defaultState.reminders,
      habits: Array.isArray(parsedState.habits) ? parsedState.habits : defaultState.habits,
      lists: validatedLists,
      brainDump: Array.isArray(parsedState.brainDump) ? parsedState.brainDump : defaultState.brainDump,
      widgets: widgets, // Use the processed widgets array
    };

    console.log('State loaded successfully with widget migration');
    return mergedState;
  } catch (error) {
    console.error('Failed to load state:', error);
    
    // Try to clear corrupted data and return default state
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('Cleared corrupted state, using default state');
    } catch (clearError) {
      console.error('Failed to clear corrupted state:', clearError);
    }
    
    return defaultState;
  }
};