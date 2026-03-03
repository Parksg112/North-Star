// ─── Goal Types ───────────────────────────────────────────────────────────────

export type GoalPeriod = 'daily' | 'weekly' | 'yearly' | 'custom';
export type MetricType = 'count' | 'duration' | 'boolean' | 'distance' | 'weight' | 'currency' | 'percentage';
export type GoalStatus = 'active' | 'completed' | 'expired' | 'paused';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  period: GoalPeriod;
  metricType: MetricType;
  unit: string;
  target: number;
  current: number;
  weeklyTarget?: number;
  deadline?: string; // ISO date string
  startDate: string;
  status: GoalStatus;
  color: string;
  icon: string;
  distributeEvenly: boolean;
  history: GoalEntry[];
  category?: string;
}

export interface GoalEntry {
  date: string;
  value: number;
  note?: string;
}

// ─── Calendar / Event Types ────────────────────────────────────────────────────

export type EventCategory =
  | 'work'
  | 'fitness'
  | 'health'
  | 'personal'
  | 'family'
  | 'learning'
  | 'finance'
  | 'social'
  | 'other';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO datetime
  endTime: string;   // ISO datetime
  allDay?: boolean;
  category: EventCategory;
  color: string;
  templateId?: string;
  googleEventId?: string;
  recurring?: RecurringRule;
  goalId?: string;
  location?: string;
  completed?: boolean;
}

export interface RecurringRule {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek?: number[]; // 0=Sunday ... 6=Saturday
  endDate?: string;
  count?: number;
}

// ─── Template Block Types ──────────────────────────────────────────────────────

export interface TemplateBlock {
  id: string;
  name: string;
  description?: string;
  category: EventCategory;
  defaultDuration: number; // minutes
  color: string;
  icon: string;
  defaultTitle: string;
  goalId?: string;
  recurring?: Partial<RecurringRule>;
}

// ─── Note Types ───────────────────────────────────────────────────────────────

export interface Note {
  id: string;
  content: string;
  title?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  linkedEventId?: string;
  pinned?: boolean;
  color?: string;
}

// ─── AI Coach Types ───────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface CoachProfile {
  name: string;
  bio: string;
  strengths: string[]; // Gallup strengths
  goals: string;
  challenges: string;
  values: string;
  weeklyRoutine: string;
  otherContext: string;
}

// ─── Settings Types ───────────────────────────────────────────────────────────

export interface AppSettings {
  theme: 'dark' | 'light';
  googleCalendarConnected: boolean;
  googleCalendarId?: string;
  sharedWithEmails: string[];
  defaultView: 'day' | 'week' | 'month';
  startHour: number;
  endHour: number;
  firstDayOfWeek: 0 | 1; // 0=Sunday, 1=Monday
  notificationsEnabled: boolean;
}

// ─── Store Shape ──────────────────────────────────────────────────────────────

export interface NorthStarStore {
  goals: Goal[];
  events: CalendarEvent[];
  templates: TemplateBlock[];
  notes: Note[];
  messages: ChatMessage[];
  coachProfile: CoachProfile;
  settings: AppSettings;

  // Goal actions
  addGoal: (goal: Omit<Goal, 'id' | 'history' | 'current'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  logGoalProgress: (goalId: string, value: number, note?: string) => void;

  // Event actions
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  toggleEventComplete: (id: string) => void;

  // Template actions
  addTemplate: (template: Omit<TemplateBlock, 'id'>) => void;
  updateTemplate: (id: string, updates: Partial<TemplateBlock>) => void;
  deleteTemplate: (id: string) => void;

  // Note actions
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;

  // Coach actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateCoachProfile: (profile: Partial<CoachProfile>) => void;

  // Settings actions
  updateSettings: (updates: Partial<AppSettings>) => void;
}
