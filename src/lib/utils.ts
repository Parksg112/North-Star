import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  addMinutes,
  differenceInMinutes,
  startOfDay,
  endOfDay,
} from 'date-fns';
import type { CalendarEvent, Goal } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─── Date helpers ──────────────────────────────────────────────────────────────

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'h:mm a');
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d');
}

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function getMonthDays(date: Date): Date[] {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const days = eachDayOfInterval({ start, end });

  // Pad with previous month days to fill grid
  const startPad = startOfWeek(start, { weekStartsOn: 1 }).getDay() === 0
    ? 0
    : (start.getDay() === 0 ? 6 : start.getDay() - 1);

  const padded: Date[] = [];
  for (let i = startPad; i > 0; i--) {
    const d = new Date(start);
    d.setDate(d.getDate() - i);
    padded.push(d);
  }
  return [...padded, ...days];
}

export function getEventsForDay(events: CalendarEvent[], date: Date): CalendarEvent[] {
  return events.filter(e => isSameDay(parseISO(e.startTime), date));
}

export function getEventsForWeek(events: CalendarEvent[], date: Date): CalendarEvent[] {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return events.filter(e => {
    const d = parseISO(e.startTime);
    return d >= start && d <= end;
  });
}

export function eventTopPercent(event: CalendarEvent, startHour: number, endHour: number): number {
  const start = parseISO(event.startTime);
  const dayStart = new Date(start);
  dayStart.setHours(startHour, 0, 0, 0);
  const totalMinutes = (endHour - startHour) * 60;
  const fromStart = differenceInMinutes(start, dayStart);
  return Math.max(0, (fromStart / totalMinutes) * 100);
}

export function eventHeightPercent(event: CalendarEvent, startHour: number, endHour: number): number {
  const start = parseISO(event.startTime);
  const end = parseISO(event.endTime);
  const totalMinutes = (endHour - startHour) * 60;
  const duration = differenceInMinutes(end, start);
  return Math.max(2, (duration / totalMinutes) * 100);
}

// ─── Goal helpers ──────────────────────────────────────────────────────────────

export function getGoalProgress(goal: Goal): number {
  if (goal.target === 0) return 0;
  return Math.min(100, Math.round((goal.current / goal.target) * 100));
}

export function getTodayGoalProgress(goal: Goal): number {
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayEntries = goal.history.filter(e => e.date === today);
  const todayTotal = todayEntries.reduce((sum, e) => sum + e.value, 0);
  const dailyTarget = goal.period === 'daily'
    ? goal.target
    : goal.weeklyTarget
    ? goal.weeklyTarget / 7
    : goal.target / 365;
  if (dailyTarget === 0) return 0;
  return Math.min(100, Math.round((todayTotal / dailyTarget) * 100));
}

export function getWeekGoalProgress(goal: Goal): number {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const end = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEntries = goal.history.filter(e => {
    const d = parseISO(e.date);
    return d >= start && d <= end;
  });
  const weekTotal = weekEntries.reduce((sum, e) => sum + e.value, 0);
  const weeklyTarget = goal.weeklyTarget ?? (goal.period === 'weekly' ? goal.target : goal.target / 52);
  if (weeklyTarget === 0) return 0;
  return Math.min(100, Math.round((weekTotal / weeklyTarget) * 100));
}

// ─── Color helpers ─────────────────────────────────────────────────────────────

export const CATEGORY_COLORS: Record<string, string> = {
  work: '#6366f1',
  fitness: '#10b981',
  health: '#f59e0b',
  personal: '#8b5cf6',
  family: '#ec4899',
  learning: '#3b82f6',
  finance: '#14b8a6',
  social: '#f97316',
  other: '#6b7280',
};

export const GOAL_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#3b82f6', '#14b8a6', '#f97316',
  '#ef4444', '#84cc16',
];

export const TEMPLATE_ICONS = [
  '🏃', '🏋️', '📚', '💻', '🧘', '🥗', '💰', '🎯',
  '📝', '🤝', '✈️', '🎨', '🎵', '🏊', '🚴', '⚽',
  '🧠', '💊', '🛌', '🍳', '📞', '🎓', '🌿', '🔥',
];

// ─── Smart note parsing ────────────────────────────────────────────────────────

export interface ParsedEventFromNote {
  title: string;
  time?: string; // HH:mm
  date?: string; // yyyy-MM-dd
}

export function parseNoteForEvents(text: string): ParsedEventFromNote | null {
  // Simple patterns: "call john at 3pm", "meeting with sarah at 2:30", "dentist tomorrow at 10am"
  const timeRegex = /at (\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
  const match = text.match(timeRegex);
  if (!match) return null;

  let hour = parseInt(match[1]);
  const minute = match[2] ? parseInt(match[2]) : 0;
  const period = match[3]?.toLowerCase();

  if (period === 'pm' && hour < 12) hour += 12;
  if (period === 'am' && hour === 12) hour = 0;

  const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  // Extract title by removing the "at X" part
  const title = text.replace(timeRegex, '').trim().replace(/[.,!?]$/,'').trim();

  const today = format(new Date(), 'yyyy-MM-dd');
  return { title: title || text, time, date: today };
}

// ─── Format duration ───────────────────────────────────────────────────────────

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function formatMetricValue(value: number, unit: string): string {
  return `${value.toLocaleString()} ${unit}`;
}
