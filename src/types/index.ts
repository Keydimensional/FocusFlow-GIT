export type Mood = 'great' | 'good' | 'okay' | 'bad' | 'awful';

export interface MoodEntry {
  date: string;
  mood: Mood;
  reflection?: string;
}

export interface Reminder {
  id: string;
  title: string;
  datetime: string;
  completed: boolean;
  playSound?: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
  progress?: number;
  notes?: string;
}

export interface Habit {
  id: string;
  title: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  completedDates: string[];
  createdAt: string;
  color: string;
  gameType: string;
}

export interface DailyFocus {
  text: string;
  timestamp: number;
}

export interface BrainDumpItem {
  id: string;
  text: string;
  timestamp: number;
}

export interface Widget {
  id: string;
  type: 'dailyFocus' | 'focusTimer' | 'streakCounter' | 'moodCheck' | 'brainDump' | 'moodHistory' | 'goalList' | 'reminderList' | 'habitTracker' | 'moodBoard';
  visible: boolean;
  order: number;
}

export interface AppState {
  moods: MoodEntry[];
  goals: Goal[];
  reminders: Reminder[];
  habits: Habit[];
  lastCheckIn: string | null;
  streak: number;
  todaysFocus: DailyFocus | null;
  brainDump: BrainDumpItem[];
  widgets: Widget[];
}