'use client';

import { useState, useRef } from 'react';
import {
  format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths,
  startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isSameMonth, isToday, parseISO, getHours, getMinutes,
} from 'date-fns';
import {
  ChevronLeft, ChevronRight, Plus, Calendar, LayoutGrid, List,
  Clock, X, Check, Link2, AlertCircle, Layers,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CATEGORY_COLORS, getEventsForDay, formatDuration, generateId } from '@/lib/utils';
import type { CalendarEvent, TemplateBlock, EventCategory } from '@/lib/types';

type ViewMode = 'day' | 'week' | 'month';

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6am - 10pm

// ─── Event Form Modal ─────────────────────────────────────────────────────────

function EventFormModal({
  initial,
  templates,
  onSave,
  onDelete,
  onClose,
}: {
  initial?: Partial<CalendarEvent> & { date?: string };
  templates: TemplateBlock[];
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const defaultDate = initial?.startTime
    ? format(parseISO(initial.startTime), 'yyyy-MM-dd')
    : initial?.date ?? format(new Date(), 'yyyy-MM-dd');
  const defaultStart = initial?.startTime
    ? format(parseISO(initial.startTime), 'HH:mm')
    : '09:00';
  const defaultEnd = initial?.endTime
    ? format(parseISO(initial.endTime), 'HH:mm')
    : '10:00';

  const [title, setTitle] = useState(initial?.title ?? '');
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);
  const [category, setCategory] = useState<EventCategory>(initial?.category ?? 'work');
  const [color, setColor] = useState(initial?.color ?? '#6366f1');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [location, setLocation] = useState(initial?.location ?? '');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const applyTemplate = (t: TemplateBlock) => {
    setTitle(t.defaultTitle);
    setCategory(t.category);
    setColor(t.color);
    setSelectedTemplate(t.id);
    // Set end time = start + duration
    const [h, m] = startTime.split(':').map(Number);
    const totalMin = h * 60 + m + t.defaultDuration;
    const eh = Math.floor(totalMin / 60);
    const em = totalMin % 60;
    setEndTime(`${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description: description || undefined,
      location: location || undefined,
      startTime: `${date}T${startTime}:00`,
      endTime: `${date}T${endTime}:00`,
      category,
      color,
      templateId: selectedTemplate ?? undefined,
    });
    onClose();
  };

  const categoryOptions: EventCategory[] = ['work', 'fitness', 'health', 'personal', 'family', 'learning', 'finance', 'social', 'other'];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Template picker */}
      {templates.length > 0 && (
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Quick Templates</label>
          <div className="flex flex-wrap gap-2">
            {templates.slice(0, 8).map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => applyTemplate(t)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px', borderRadius: 8, fontSize: 12,
                  background: selectedTemplate === t.id ? t.color + '30' : 'var(--bg-secondary)',
                  border: `1px solid ${selectedTemplate === t.id ? t.color : 'var(--border)'}`,
                  color: selectedTemplate === t.id ? t.color : 'var(--text-secondary)',
                }}
              >
                <span>{t.icon}</span> {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Title *</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Event title" required autoFocus />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value as EventCategory)}
            style={{ textTransform: 'capitalize' }}>
            {categoryOptions.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Start</label>
          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>End</label>
          <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
        </div>
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Color</label>
        <div className="flex gap-2 flex-wrap">
          {Object.values(CATEGORY_COLORS).map(c => (
            <button
              key={c} type="button"
              onClick={() => setColor(c)}
              style={{
                width: 26, height: 26, borderRadius: '50%', background: c,
                border: color === c ? '2px solid white' : '2px solid transparent',
                boxShadow: color === c ? `0 0 0 2px ${c}` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Notes</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional notes..." rows={2} style={{ resize: 'vertical' }} />
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Location</label>
        <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Optional location" />
      </div>

      <div className="flex gap-2">
        {onDelete && (
          <Button variant="danger" type="button" onClick={() => { onDelete(); onClose(); }}>Delete</Button>
        )}
        <Button variant="secondary" type="button" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
        <Button variant="primary" type="submit" style={{ flex: 1 }}>
          {initial?.title ? 'Update' : 'Add Event'}
        </Button>
      </div>
    </form>
  );
}

// ─── Day View ─────────────────────────────────────────────────────────────────

function DayView({ date, onNewEvent }: { date: Date; onNewEvent: (hour: number) => void }) {
  const events = useStore(s => s.events);
  const toggleEventComplete = useStore(s => s.toggleEventComplete);
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
  const updateEvent = useStore(s => s.updateEvent);
  const deleteEvent = useStore(s => s.deleteEvent);
  const templates = useStore(s => s.templates);

  const dayEvents = getEventsForDay(events, date);

  return (
    <div style={{ overflowY: 'auto', flex: 1 }}>
      <div style={{ position: 'relative' }}>
        {HOURS.map(hour => {
          const hourEvents = dayEvents.filter(e => {
            const h = getHours(parseISO(e.startTime));
            return h === hour;
          });
          return (
            <div
              key={hour}
              style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', minHeight: 64, position: 'relative' }}
            >
              <div
                style={{
                  width: 50, flexShrink: 0, paddingTop: 6, paddingRight: 8,
                  textAlign: 'right', fontSize: 11, color: 'var(--text-muted)',
                }}
              >
                {format(new Date().setHours(hour, 0), 'h a')}
              </div>
              <div
                style={{ flex: 1, cursor: 'pointer', position: 'relative', minHeight: 64 }}
                onClick={() => onNewEvent(hour)}
              >
                {hourEvents.map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => { e.stopPropagation(); setEditEvent(event); }}
                    style={{
                      margin: '4px 4px',
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: event.color + '25',
                      borderLeft: `3px solid ${event.color}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      opacity: event.completed ? 0.5 : 1,
                      textDecoration: event.completed ? 'line-through' : 'none',
                    }}
                  >
                    <button
                      onClick={e => { e.stopPropagation(); toggleEventComplete(event.id); }}
                      style={{ background: 'none', padding: 0, color: event.color, flexShrink: 0 }}
                    >
                      {event.completed
                        ? <Check size={14} />
                        : <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${event.color}` }} />
                      }
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {event.title}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {format(parseISO(event.startTime), 'h:mm a')} – {format(parseISO(event.endTime), 'h:mm a')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {editEvent && (
        <Modal open onClose={() => setEditEvent(null)} title="Edit Event">
          <EventFormModal
            initial={editEvent}
            templates={templates}
            onSave={(data) => updateEvent(editEvent.id, data)}
            onDelete={() => deleteEvent(editEvent.id)}
            onClose={() => setEditEvent(null)}
          />
        </Modal>
      )}
    </div>
  );
}

// ─── Week View ────────────────────────────────────────────────────────────────

function WeekView({ date, onDayClick }: { date: Date; onDayClick: (d: Date) => void }) {
  const events = useStore(s => s.events);
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div style={{ overflowX: 'auto' }}>
      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '50px repeat(7, 1fr)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div />
        {days.map(d => (
          <div
            key={d.toISOString()}
            onClick={() => onDayClick(d)}
            style={{
              textAlign: 'center', padding: '8px 4px', cursor: 'pointer',
              borderLeft: '1px solid var(--border)',
            }}
          >
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {format(d, 'EEE')}
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '2px auto 0',
              background: isToday(d) ? 'var(--accent)' : 'transparent',
              color: isToday(d) ? 'white' : 'var(--text-primary)',
              fontSize: 13, fontWeight: isToday(d) ? 700 : 400,
            }}>
              {format(d, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      {HOURS.map(hour => (
        <div key={hour} style={{ display: 'grid', gridTemplateColumns: '50px repeat(7, 1fr)', borderBottom: '1px solid rgba(255,255,255,0.06)', minHeight: 50 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', padding: '4px 6px 0 0', textAlign: 'right' }}>
            {format(new Date().setHours(hour, 0), 'h a')}
          </div>
          {days.map(d => {
            const dayHourEvents = events.filter(e => {
              const start = parseISO(e.startTime);
              return isSameDay(start, d) && getHours(start) === hour;
            });
            return (
              <div key={d.toISOString()} style={{ borderLeft: '1px solid var(--border)', padding: 2, minHeight: 50 }}
                onClick={() => onDayClick(d)}>
                {dayHourEvents.map(event => (
                  <div key={event.id} style={{
                    borderRadius: 4, padding: '2px 4px', marginBottom: 1, fontSize: 10, fontWeight: 500,
                    background: event.color + '30', borderLeft: `2px solid ${event.color}`,
                    color: 'var(--text-primary)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                  }}>
                    {event.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Month View ───────────────────────────────────────────────────────────────

function MonthView({ date, onDayClick }: { date: Date; onDayClick: (d: Date) => void }) {
  const events = useStore(s => s.events);
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: addDays(endOfWeek(monthEnd, { weekStartsOn: 1 }), 0) });

  return (
    <div>
      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} style={{ textAlign: 'center', padding: '8px 0', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 0.5 }}>
            {d}
          </div>
        ))}
      </div>
      {/* Day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {days.map(d => {
          const dayEvents = getEventsForDay(events, d);
          const inMonth = isSameMonth(d, date);
          return (
            <div
              key={d.toISOString()}
              onClick={() => onDayClick(d)}
              style={{
                minHeight: 80, padding: 6, cursor: 'pointer',
                borderRight: '1px solid var(--border)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: isToday(d) ? 'rgba(99,102,241,0.08)' : 'transparent',
                opacity: inMonth ? 1 : 0.35,
              }}
            >
              <div style={{
                width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: isToday(d) ? 700 : 400,
                background: isToday(d) ? 'var(--accent)' : 'transparent',
                color: isToday(d) ? 'white' : 'var(--text-secondary)',
                marginBottom: 4,
              }}>
                {format(d, 'd')}
              </div>
              {dayEvents.slice(0, 2).map(e => (
                <div key={e.id} style={{
                  fontSize: 10, padding: '2px 4px', borderRadius: 3, marginBottom: 1,
                  background: e.color + '30', borderLeft: `2px solid ${e.color}`,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  color: 'var(--text-primary)',
                }}>
                  {e.title}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{dayEvents.length - 2} more</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Templates Drawer ─────────────────────────────────────────────────────────

function TemplatesDrawer({ open, onClose, onSelect }: {
  open: boolean;
  onClose: () => void;
  onSelect: (t: TemplateBlock, date: string) => void;
}) {
  const templates = useStore(s => s.templates);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-end" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full animate-slide-up" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderRadius: '16px 16px 0 0', maxHeight: '70dvh', overflowY: 'auto' }}>
        <div style={{ padding: '16px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>Templates</h3>
          <button onClick={onClose} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 8px', color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
          {templates.map(t => (
            <button key={t.id} onClick={() => { onSelect(t, format(new Date(), 'yyyy-MM-dd')); onClose(); }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '12px 8px', borderRadius: 10, background: 'var(--bg-secondary)',
                border: `1px solid ${t.color}40`, cursor: 'pointer', transition: 'background 0.15s',
              }}>
              <span style={{ fontSize: 24 }}>{t.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center' }}>{t.name}</span>
              <span style={{ fontSize: 10, color: t.color }}>
                <Clock size={10} style={{ display: 'inline', marginRight: 2 }} />
                {formatDuration(t.defaultDuration)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Plan Page ────────────────────────────────────────────────────────────────

export default function PlanPage() {
  const [view, setView] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [newEventInitial, setNewEventInitial] = useState<Partial<CalendarEvent> & { date?: string }>({});
  const addEvent = useStore(s => s.addEvent);
  const templates = useStore(s => s.templates);

  const navigate = (dir: 1 | -1) => {
    if (view === 'day') setCurrentDate(d => dir === 1 ? addDays(d, 1) : subDays(d, 1));
    if (view === 'week') setCurrentDate(d => dir === 1 ? addWeeks(d, 1) : subWeeks(d, 1));
    if (view === 'month') setCurrentDate(d => dir === 1 ? addMonths(d, 1) : subMonths(d, 1));
  };

  const headerLabel = () => {
    if (view === 'day') return format(currentDate, 'EEEE, MMMM d, yyyy');
    if (view === 'week') {
      const ws = startOfWeek(currentDate, { weekStartsOn: 1 });
      const we = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(ws, 'MMM d')} – ${format(we, 'MMM d, yyyy')}`;
    }
    return format(currentDate, 'MMMM yyyy');
  };

  const handleNewEvent = (hour: number = 9) => {
    const date = format(currentDate, 'yyyy-MM-dd');
    setNewEventInitial({
      date,
      startTime: `${date}T${String(hour).padStart(2, '0')}:00:00`,
      endTime: `${date}T${String(hour + 1).padStart(2, '0')}:00:00`,
    });
    setShowEventModal(true);
  };

  const handleTemplateSelect = (t: TemplateBlock, date: string) => {
    const now = new Date();
    const startH = now.getHours();
    const start = `${date}T${String(startH).padStart(2, '0')}:00:00`;
    const totalMin = startH * 60 + t.defaultDuration;
    const endH = Math.floor(totalMin / 60);
    const endM = totalMin % 60;
    const end = `${date}T${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;
    setNewEventInitial({ title: t.defaultTitle, category: t.category, color: t.color, templateId: t.id, startTime: start, endTime: end, date });
    setShowEventModal(true);
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="sticky top-0 z-40" style={{ background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {/* View switcher */}
        <div className="flex items-center gap-2 px-4 pt-4 pb-2">
          <Calendar size={18} color="var(--accent)" />
          <h1 style={{ fontSize: 18, fontWeight: 700, flex: 1 }}>Plan</h1>
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {(['day', 'week', 'month'] as ViewMode[]).map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{
                  padding: '5px 12px', fontSize: 12, fontWeight: 500, textTransform: 'capitalize',
                  background: view === v ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: view === v ? 'white' : 'var(--text-muted)',
                  borderRight: v !== 'month' ? '1px solid var(--border)' : 'none',
                }}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Nav row */}
        <div className="flex items-center gap-2 px-4 pb-3">
          <button onClick={() => navigate(-1)} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 8px', color: 'var(--text-secondary)' }}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setCurrentDate(new Date())} style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 600, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 8px', color: 'var(--text-primary)' }}>
            {headerLabel()}
          </button>
          <button onClick={() => navigate(1)} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 8px', color: 'var(--text-secondary)' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Calendar content */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {view === 'day' && <DayView date={currentDate} onNewEvent={handleNewEvent} />}
        {view === 'week' && <WeekView date={currentDate} onDayClick={(d) => { setCurrentDate(d); setView('day'); }} />}
        {view === 'month' && <MonthView date={currentDate} onDayClick={(d) => { setCurrentDate(d); setView('day'); }} />}
      </div>

      {/* FAB */}
      <div style={{ position: 'fixed', bottom: 88, right: 16 }} className="md:bottom-6">
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => setShowTemplates(true)}
            style={{
              width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-card)',
              border: '1px solid var(--border)', color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            <Layers size={18} />
          </button>
          <button
            onClick={() => handleNewEvent()}
            style={{
              width: 52, height: 52, borderRadius: '50%', background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(99,102,241,0.5)',
              color: 'white',
            }}
          >
            <Plus size={22} />
          </button>
        </div>
      </div>

      {/* Google Calendar notice */}
      <div className="px-4 py-2 flex items-center gap-2" style={{ background: 'rgba(66,133,244,0.08)', borderTop: '1px solid rgba(59,130,246,0.2)' }}>
        <Link2 size={13} color="#3b82f6" />
        <span style={{ fontSize: 11, color: 'var(--accent)' }}>
          Connect Google Calendar in Settings to sync events
        </span>
      </div>

      {/* Modals */}
      <Modal open={showEventModal} onClose={() => setShowEventModal(false)} title={newEventInitial.title ? 'Edit Event' : 'New Event'} maxWidth={520}>
        <EventFormModal
          initial={newEventInitial}
          templates={templates}
          onSave={addEvent}
          onClose={() => setShowEventModal(false)}
        />
      </Modal>

      <TemplatesDrawer
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelect={handleTemplateSelect}
      />
    </div>
  );
}
