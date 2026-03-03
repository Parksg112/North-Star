'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';
import { generateId } from './utils';
import type {
  NorthStarStore,
  Goal,
  CalendarEvent,
  TemplateBlock,
  Note,
  ChatMessage,
  CoachProfile,
  AppSettings,
} from './types';

const DEFAULT_TEMPLATES: TemplateBlock[] = [
  { id: 't1', name: 'Morning Run', description: 'Daily cardio run', category: 'fitness', defaultDuration: 60, color: '#10b981', icon: '🏃', defaultTitle: 'Morning Run', goalId: undefined },
  { id: 't2', name: 'Strength Training', description: 'Weight lifting session', category: 'fitness', defaultDuration: 60, color: '#10b981', icon: '🏋️', defaultTitle: 'Strength Training' },
  { id: 't3', name: 'Deep Work', description: 'Focused work session', category: 'work', defaultDuration: 90, color: '#6366f1', icon: '💻', defaultTitle: 'Deep Work' },
  { id: 't4', name: 'Team Meeting', description: 'Team sync', category: 'work', defaultDuration: 60, color: '#6366f1', icon: '🤝', defaultTitle: 'Team Meeting' },
  { id: 't5', name: 'Reading', description: 'Personal development reading', category: 'learning', defaultDuration: 30, color: '#3b82f6', icon: '📚', defaultTitle: 'Reading' },
  { id: 't6', name: 'Meditation', description: 'Mindfulness practice', category: 'health', defaultDuration: 20, color: '#f59e0b', icon: '🧘', defaultTitle: 'Meditation' },
  { id: 't7', name: 'Family Time', description: 'Quality family time', category: 'family', defaultDuration: 120, color: '#ec4899', icon: '❤️', defaultTitle: 'Family Time' },
  { id: 't8', name: 'Finance Review', description: 'Review finances and budget', category: 'finance', defaultDuration: 30, color: '#14b8a6', icon: '💰', defaultTitle: 'Finance Review' },
];

const DEFAULT_GOALS: Goal[] = [
  {
    id: 'g1',
    title: 'Run Miles',
    description: 'Weekly running distance',
    period: 'weekly',
    metricType: 'distance',
    unit: 'miles',
    target: 20,
    current: 7.5,
    weeklyTarget: 20,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    status: 'active',
    color: '#10b981',
    icon: '🏃',
    distributeEvenly: true,
    history: [
      { date: format(new Date(), 'yyyy-MM-dd'), value: 3.5 },
      { date: format(new Date(Date.now() - 86400000), 'yyyy-MM-dd'), value: 4 },
    ],
    category: 'fitness',
  },
  {
    id: 'g2',
    title: 'Read Books',
    description: 'Books read this year',
    period: 'yearly',
    metricType: 'count',
    unit: 'books',
    target: 24,
    current: 3,
    weeklyTarget: 0.5,
    startDate: '2026-01-01',
    status: 'active',
    color: '#3b82f6',
    icon: '📚',
    distributeEvenly: false,
    history: [
      { date: '2026-01-15', value: 1 },
      { date: '2026-02-01', value: 1 },
      { date: '2026-02-20', value: 1 },
    ],
    category: 'learning',
  },
  {
    id: 'g3',
    title: 'Meditate',
    description: 'Daily meditation sessions',
    period: 'daily',
    metricType: 'boolean',
    unit: 'sessions',
    target: 1,
    current: 0,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    status: 'active',
    color: '#f59e0b',
    icon: '🧘',
    distributeEvenly: false,
    history: [],
    category: 'health',
  },
  {
    id: 'g4',
    title: 'Save Money',
    description: 'Annual savings goal',
    period: 'yearly',
    metricType: 'currency',
    unit: 'USD',
    target: 20000,
    current: 3200,
    weeklyTarget: 385,
    startDate: '2026-01-01',
    status: 'active',
    color: '#14b8a6',
    icon: '💰',
    distributeEvenly: true,
    history: [
      { date: '2026-01-31', value: 1600 },
      { date: '2026-02-28', value: 1600 },
    ],
    category: 'finance',
  },
];

const DEFAULT_COACH_PROFILE: CoachProfile = {
  name: '',
  bio: '',
  strengths: [],
  goals: '',
  challenges: '',
  values: '',
  weeklyRoutine: '',
  otherContext: '',
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  googleCalendarConnected: false,
  sharedWithEmails: [],
  defaultView: 'day',
  startHour: 6,
  endHour: 22,
  firstDayOfWeek: 1,
  notificationsEnabled: true,
};

export const useStore = create<NorthStarStore>()(
  persist(
    (set, get) => ({
      goals: DEFAULT_GOALS,
      events: [],
      templates: DEFAULT_TEMPLATES,
      notes: [],
      messages: [],
      coachProfile: DEFAULT_COACH_PROFILE,
      settings: DEFAULT_SETTINGS,

      // ── Goal actions ────────────────────────────────────────────────────────
      addGoal: (goal) =>
        set((s) => ({
          goals: [...s.goals, { ...goal, id: generateId(), current: 0, history: [] }],
        })),

      updateGoal: (id, updates) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        })),

      deleteGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      logGoalProgress: (goalId, value, note) =>
        set((s) => ({
          goals: s.goals.map((g) => {
            if (g.id !== goalId) return g;
            const entry = { date: format(new Date(), 'yyyy-MM-dd'), value, note };
            return { ...g, current: g.current + value, history: [...g.history, entry] };
          }),
        })),

      // ── Event actions ───────────────────────────────────────────────────────
      addEvent: (event) =>
        set((s) => ({
          events: [...s.events, { ...event, id: generateId() }],
        })),

      updateEvent: (id, updates) =>
        set((s) => ({
          events: s.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),

      deleteEvent: (id) =>
        set((s) => ({ events: s.events.filter((e) => e.id !== id) })),

      toggleEventComplete: (id) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === id ? { ...e, completed: !e.completed } : e
          ),
        })),

      // ── Template actions ────────────────────────────────────────────────────
      addTemplate: (template) =>
        set((s) => ({
          templates: [...s.templates, { ...template, id: generateId() }],
        })),

      updateTemplate: (id, updates) =>
        set((s) => ({
          templates: s.templates.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      deleteTemplate: (id) =>
        set((s) => ({ templates: s.templates.filter((t) => t.id !== id) })),

      // ── Note actions ────────────────────────────────────────────────────────
      addNote: (note) =>
        set((s) => ({
          notes: [
            {
              ...note,
              id: generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            ...s.notes,
          ],
        })),

      updateNote: (id, updates) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
          ),
        })),

      deleteNote: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      togglePinNote: (id) =>
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
        })),

      // ── Coach actions ───────────────────────────────────────────────────────
      addMessage: (message) =>
        set((s) => ({
          messages: [
            ...s.messages,
            { ...message, id: generateId(), timestamp: new Date().toISOString() },
          ],
        })),

      updateCoachProfile: (profile) =>
        set((s) => ({ coachProfile: { ...s.coachProfile, ...profile } })),

      // ── Settings actions ────────────────────────────────────────────────────
      updateSettings: (updates) =>
        set((s) => ({ settings: { ...s.settings, ...updates } })),
    }),
    { name: 'north-star-store' }
  )
);
