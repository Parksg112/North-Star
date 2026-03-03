'use client';

import { useState } from 'react';
import {
  Settings, Target, Layers, Bot, Calendar, User, Plus, Trash2,
  ChevronRight, Link2, Check, Bell, Users, X, Edit3, Save,
  Trophy, TrendingUp, Flame, Hash,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { GOAL_COLORS, TEMPLATE_ICONS, CATEGORY_COLORS } from '@/lib/utils';
import type { Goal, TemplateBlock, GoalPeriod, MetricType, EventCategory } from '@/lib/types';

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'goals' | 'templates' | 'coach' | 'integrations' | 'account';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'templates', label: 'Templates', icon: Layers },
  { id: 'coach', label: 'Coach', icon: Bot },
  { id: 'integrations', label: 'Integrations', icon: Link2 },
  { id: 'account', label: 'Account', icon: User },
];

// ─── Goal Form ────────────────────────────────────────────────────────────────

function GoalForm({
  initial,
  onSave,
  onClose,
}: {
  initial?: Goal;
  onSave: (data: Omit<Goal, 'id' | 'history' | 'current'>) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [period, setPeriod] = useState<GoalPeriod>(initial?.period ?? 'weekly');
  const [metricType, setMetricType] = useState<MetricType>(initial?.metricType ?? 'count');
  const [unit, setUnit] = useState(initial?.unit ?? '');
  const [target, setTarget] = useState(initial?.target?.toString() ?? '');
  const [weeklyTarget, setWeeklyTarget] = useState(initial?.weeklyTarget?.toString() ?? '');
  const [deadline, setDeadline] = useState(initial?.deadline ?? '');
  const [color, setColor] = useState(initial?.color ?? GOAL_COLORS[0]);
  const [icon, setIcon] = useState(initial?.icon ?? '🎯');
  const [distributeEvenly, setDistributeEvenly] = useState(initial?.distributeEvenly ?? false);
  const [category, setCategory] = useState(initial?.category ?? 'personal');

  const metricUnits: Record<MetricType, string> = {
    count: 'times',
    duration: 'minutes',
    boolean: 'sessions',
    distance: 'miles',
    weight: 'lbs',
    currency: 'USD',
    percentage: '%',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description: description || undefined,
      period,
      metricType,
      unit: unit || metricUnits[metricType],
      target: parseFloat(target) || 1,
      weeklyTarget: weeklyTarget ? parseFloat(weeklyTarget) : undefined,
      deadline: deadline || undefined,
      startDate: new Date().toISOString().slice(0, 10),
      status: 'active',
      color,
      icon,
      distributeEvenly,
      category,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Icon & color */}
      <div className="flex items-center gap-3">
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Icon</label>
          <div className="flex flex-wrap gap-1.5" style={{ maxWidth: 200 }}>
            {TEMPLATE_ICONS.slice(0, 12).map(ic => (
              <button key={ic} type="button" onClick={() => setIcon(ic)}
                style={{ fontSize: 18, padding: 4, borderRadius: 6, background: icon === ic ? 'var(--accent-muted)' : 'transparent', border: `1px solid ${icon === ic ? 'var(--accent)' : 'transparent'}` }}>
                {ic}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Color</label>
          <div className="flex flex-wrap gap-1.5">
            {GOAL_COLORS.map(c => (
              <button key={c} type="button" onClick={() => setColor(c)}
                style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: color === c ? '2px solid white' : '2px solid transparent', boxShadow: color === c ? `0 0 0 2px ${c}` : 'none' }} />
            ))}
          </div>
        </div>
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Goal Title *</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Run miles, Read books..." required autoFocus />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Period</label>
          <select value={period} onChange={e => setPeriod(e.target.value as GoalPeriod)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Metric Type</label>
          <select value={metricType} onChange={e => setMetricType(e.target.value as MetricType)}>
            <option value="count">Count</option>
            <option value="duration">Duration</option>
            <option value="distance">Distance</option>
            <option value="weight">Weight</option>
            <option value="currency">Currency</option>
            <option value="percentage">Percentage</option>
            <option value="boolean">Done/Not Done</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Target Amount *</label>
          <input type="number" step="any" min="0" value={target} onChange={e => setTarget(e.target.value)} placeholder="e.g. 20" required />
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Unit</label>
          <input value={unit} onChange={e => setUnit(e.target.value)} placeholder={metricUnits[metricType]} />
        </div>
      </div>

      {(period === 'yearly' || period === 'custom') && (
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Weekly Target (optional)</label>
          <input type="number" step="any" min="0" value={weeklyTarget} onChange={e => setWeeklyTarget(e.target.value)} placeholder="e.g. 2" />
        </div>
      )}

      {period === 'custom' && (
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Deadline</label>
          <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
        </div>
      )}

      <label className="flex items-center gap-3 cursor-pointer">
        <div
          onClick={() => setDistributeEvenly(v => !v)}
          style={{
            width: 40, height: 22, borderRadius: 11,
            background: distributeEvenly ? 'var(--accent)' : 'var(--border)',
            position: 'relative', transition: 'background 0.2s', flexShrink: 0,
          }}
        >
          <div style={{
            width: 16, height: 16, borderRadius: '50%', background: 'white',
            position: 'absolute', top: 3, left: distributeEvenly ? 21 : 3,
            transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Distribute evenly</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Automatically split target across time period</div>
        </div>
      </label>

      <div className="flex gap-2">
        <Button variant="secondary" type="button" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
        <Button variant="primary" type="submit" style={{ flex: 1 }}>{initial ? 'Update Goal' : 'Add Goal'}</Button>
      </div>
    </form>
  );
}

// ─── Template Form ────────────────────────────────────────────────────────────

function TemplateForm({
  initial,
  onSave,
  onClose,
}: {
  initial?: TemplateBlock;
  onSave: (data: Omit<TemplateBlock, 'id'>) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [defaultTitle, setDefaultTitle] = useState(initial?.defaultTitle ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [category, setCategory] = useState<EventCategory>(initial?.category ?? 'work');
  const [defaultDuration, setDefaultDuration] = useState(initial?.defaultDuration?.toString() ?? '60');
  const [color, setColor] = useState(initial?.color ?? '#6366f1');
  const [icon, setIcon] = useState(initial?.icon ?? '📅');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      defaultTitle: defaultTitle || name,
      description: description || undefined,
      category,
      defaultDuration: parseInt(defaultDuration) || 60,
      color,
      icon,
    });
    onClose();
  };

  const categoryOptions: EventCategory[] = ['work', 'fitness', 'health', 'personal', 'family', 'learning', 'finance', 'social', 'other'];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Icon */}
      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Icon</label>
        <div className="flex flex-wrap gap-1.5">
          {TEMPLATE_ICONS.map(ic => (
            <button key={ic} type="button" onClick={() => setIcon(ic)}
              style={{ fontSize: 20, padding: 4, borderRadius: 6, background: icon === ic ? 'var(--accent-muted)' : 'transparent', border: `1px solid ${icon === ic ? 'var(--accent)' : 'transparent'}` }}>
              {ic}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Template Name *</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Morning Run" required autoFocus />
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Default Event Title</label>
        <input value={defaultTitle} onChange={e => setDefaultTitle(e.target.value)} placeholder="Same as template name if empty" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value as EventCategory)} style={{ textTransform: 'capitalize' }}>
            {categoryOptions.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Duration (min)</label>
          <input type="number" min="5" step="5" value={defaultDuration} onChange={e => setDefaultDuration(e.target.value)} />
        </div>
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Color</label>
        <div className="flex gap-2 flex-wrap">
          {Object.values(CATEGORY_COLORS).map(c => (
            <button key={c} type="button" onClick={() => setColor(c)}
              style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: color === c ? '2px solid white' : '2px solid transparent', boxShadow: color === c ? `0 0 0 2px ${c}` : 'none' }} />
          ))}
        </div>
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description..." rows={2} style={{ resize: 'none' }} />
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" type="button" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
        <Button variant="primary" type="submit" style={{ flex: 1 }}>{initial ? 'Update' : 'Create Template'}</Button>
      </div>
    </form>
  );
}

// ─── Section: Goals ───────────────────────────────────────────────────────────

function GoalsSection() {
  const goals = useStore(s => s.goals);
  const addGoal = useStore(s => s.addGoal);
  const updateGoal = useStore(s => s.updateGoal);
  const deleteGoal = useStore(s => s.deleteGoal);
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);

  const periodGroups: { period: GoalPeriod; label: string; icon: React.ElementType; color: string }[] = [
    { period: 'daily', label: 'Daily Goals', icon: Flame, color: '#f59e0b' },
    { period: 'weekly', label: 'Weekly Goals', icon: TrendingUp, color: '#6366f1' },
    { period: 'yearly', label: 'Yearly Goals', icon: Trophy, color: '#10b981' },
    { period: 'custom', label: 'Custom Goals', icon: Target, color: '#ec4899' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Track progress toward your goals. Click a goal to log progress from the Dashboard.
        </p>
        <Button variant="primary" size="sm" onClick={() => { setEditGoal(null); setShowForm(true); }}>
          <Plus size={14} /> Add Goal
        </Button>
      </div>

      {periodGroups.map(({ period, label, icon: Icon, color }) => {
        const pg = goals.filter(g => g.period === period);
        if (pg.length === 0) return null;
        return (
          <div key={period}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} color={color} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
            </div>
            <div className="flex flex-col gap-2">
              {pg.map(g => (
                <div key={g.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, background: g.color + '20',
                    border: `1px solid ${g.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
                  }}>
                    {g.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{g.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Target: {g.target} {g.unit}
                      {g.weeklyTarget ? ` · ${g.weeklyTarget}/wk` : ''}
                      {g.deadline ? ` · Due ${g.deadline}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => { setEditGoal(g); setShowForm(true); }}
                      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 8px', color: 'var(--text-muted)' }}>
                      <Edit3 size={13} />
                    </button>
                    <button onClick={() => deleteGoal(g.id)}
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '5px 8px', color: '#ef4444' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {goals.length === 0 && (
        <div className="flex flex-col items-center py-8 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <Target size={32} color="var(--text-muted)" style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No goals yet — add your first one!</p>
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editGoal ? 'Edit Goal' : 'New Goal'} maxWidth={520}>
        <GoalForm
          initial={editGoal ?? undefined}
          onSave={(data) => {
            if (editGoal) updateGoal(editGoal.id, data);
            else addGoal(data);
          }}
          onClose={() => { setShowForm(false); setEditGoal(null); }}
        />
      </Modal>
    </div>
  );
}

// ─── Section: Templates ───────────────────────────────────────────────────────

function TemplatesSection() {
  const templates = useStore(s => s.templates);
  const addTemplate = useStore(s => s.addTemplate);
  const updateTemplate = useStore(s => s.updateTemplate);
  const deleteTemplate = useStore(s => s.deleteTemplate);
  const [showForm, setShowForm] = useState(false);
  const [editTemplate, setEditTemplate] = useState<TemplateBlock | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Create reusable blocks for your calendar. Drag them into any time slot.
        </p>
        <Button variant="primary" size="sm" onClick={() => { setEditTemplate(null); setShowForm(true); }}>
          <Plus size={14} /> New
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
        {templates.map(t => (
          <div key={t.id} style={{ background: 'var(--bg-card)', border: `1px solid ${t.color}40`, borderRadius: 10, padding: 12, position: 'relative' }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{t.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{t.name}</div>
            <div style={{ fontSize: 11, color: t.color }}>{t.defaultDuration}m · {t.category}</div>
            <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
              <button onClick={() => { setEditTemplate(t); setShowForm(true); }}
                style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 0', fontSize: 11, color: 'var(--text-muted)' }}>
                Edit
              </button>
              <button onClick={() => deleteTemplate(t.id)}
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '4px 8px', color: '#ef4444' }}>
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="flex flex-col items-center py-8 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <Layers size={32} color="var(--text-muted)" style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No templates yet</p>
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editTemplate ? 'Edit Template' : 'New Template'} maxWidth={480}>
        <TemplateForm
          initial={editTemplate ?? undefined}
          onSave={(data) => {
            if (editTemplate) updateTemplate(editTemplate.id, data);
            else addTemplate(data);
          }}
          onClose={() => { setShowForm(false); setEditTemplate(null); }}
        />
      </Modal>
    </div>
  );
}

// ─── Section: AI Coach Profile ────────────────────────────────────────────────

function CoachSection() {
  const coachProfile = useStore(s => s.coachProfile);
  const updateCoachProfile = useStore(s => s.updateCoachProfile);

  const [form, setForm] = useState({ ...coachProfile });
  const [strengthInput, setStrengthInput] = useState('');
  const [saved, setSaved] = useState(false);

  const addStrength = () => {
    const s = strengthInput.trim();
    if (s && !form.strengths.includes(s)) {
      setForm(f => ({ ...f, strengths: [...f.strengths, s] }));
    }
    setStrengthInput('');
  };

  const handleSave = () => {
    updateCoachProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const GALLUP_STRENGTHS = [
    'Achiever', 'Activator', 'Adaptability', 'Analytical', 'Arranger',
    'Belief', 'Command', 'Communication', 'Competition', 'Connectedness',
    'Consistency', 'Context', 'Deliberative', 'Developer', 'Discipline',
    'Empathy', 'Focus', 'Futuristic', 'Harmony', 'Ideation',
    'Includer', 'Individualization', 'Input', 'Intellection', 'Learner',
    'Maximizer', 'Positivity', 'Relator', 'Responsibility', 'Restorative',
    'Self-Assurance', 'Significance', 'Strategic', 'Woo',
  ];

  return (
    <div className="flex flex-col gap-4">
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
        Train your AI coach with background about your life, goals, and strengths for personalized guidance.
      </p>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Your Name</label>
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" />
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Bio / Background</label>
        <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
          placeholder="Where you're at in life, your career, family situation..." rows={3} style={{ resize: 'vertical' }} />
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Gallup Strengths</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {form.strengths.map(s => (
            <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 8, background: 'var(--accent-muted)', border: '1px solid rgba(99,102,241,0.3)', fontSize: 12, color: 'var(--accent)' }}>
              {s}
              <button type="button" onClick={() => setForm(f => ({ ...f, strengths: f.strengths.filter(x => x !== s) }))}
                style={{ color: 'inherit', lineHeight: 1 }}><X size={11} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2 mb-2">
          <input value={strengthInput} onChange={e => setStrengthInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addStrength(); } }}
            placeholder="Type strength name..." style={{ flex: 1 }} list="gallup-strengths" />
          <Button variant="secondary" size="sm" onClick={addStrength}>Add</Button>
          <datalist id="gallup-strengths">
            {GALLUP_STRENGTHS.map(s => <option key={s} value={s} />)}
          </datalist>
        </div>
        <div className="flex flex-wrap gap-1">
          {GALLUP_STRENGTHS.filter(s => !form.strengths.includes(s)).map(s => (
            <button key={s} onClick={() => setForm(f => ({ ...f, strengths: [...f.strengths, s] }))}
              style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              + {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Goals & Aspirations</label>
        <textarea value={form.goals} onChange={e => setForm(f => ({ ...f, goals: e.target.value }))}
          placeholder="What are you working toward? What does success look like?" rows={3} style={{ resize: 'vertical' }} />
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Challenges & Obstacles</label>
        <textarea value={form.challenges} onChange={e => setForm(f => ({ ...f, challenges: e.target.value }))}
          placeholder="What's standing in your way? What do you struggle with?" rows={3} style={{ resize: 'vertical' }} />
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Core Values</label>
        <textarea value={form.values} onChange={e => setForm(f => ({ ...f, values: e.target.value }))}
          placeholder="What matters most to you? Faith, family, health, achievement..." rows={2} style={{ resize: 'vertical' }} />
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Weekly Routine</label>
        <textarea value={form.weeklyRoutine} onChange={e => setForm(f => ({ ...f, weeklyRoutine: e.target.value }))}
          placeholder="Describe your typical week — work hours, commitments, preferences..." rows={3} style={{ resize: 'vertical' }} />
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Other Context</label>
        <textarea value={form.otherContext} onChange={e => setForm(f => ({ ...f, otherContext: e.target.value }))}
          placeholder="Anything else your coach should know about you..." rows={2} style={{ resize: 'vertical' }} />
      </div>

      <Button variant="primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save Profile</>}
      </Button>
    </div>
  );
}

// ─── Section: Integrations ────────────────────────────────────────────────────

function IntegrationsSection() {
  const settings = useStore(s => s.settings);
  const updateSettings = useStore(s => s.updateSettings);
  const [sharedEmail, setSharedEmail] = useState('');

  const addSharedEmail = () => {
    const e = sharedEmail.trim().toLowerCase();
    if (e && !settings.sharedWithEmails.includes(e)) {
      updateSettings({ sharedWithEmails: [...settings.sharedWithEmails, e] });
    }
    setSharedEmail('');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Google Calendar */}
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={16} color="var(--accent)" /> Google Calendar
        </h3>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Sync with Google Calendar</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                Changes sync automatically in both directions
              </div>
            </div>
            <div style={{
              padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: settings.googleCalendarConnected ? 'rgba(16,185,129,0.15)' : 'var(--bg-secondary)',
              border: `1px solid ${settings.googleCalendarConnected ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
              color: settings.googleCalendarConnected ? '#10b981' : 'var(--text-muted)',
            }}>
              {settings.googleCalendarConnected ? '● Connected' : 'Disconnected'}
            </div>
          </div>
          <Button variant={settings.googleCalendarConnected ? 'danger' : 'primary'}
            onClick={() => updateSettings({ googleCalendarConnected: !settings.googleCalendarConnected })}
            style={{ width: '100%', justifyContent: 'center' }}>
            {settings.googleCalendarConnected ? 'Disconnect' : 'Connect Google Calendar'}
          </Button>
          {!settings.googleCalendarConnected && (
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
              Requires OAuth setup — configure GOOGLE_CLIENT_ID in environment
            </p>
          )}
        </div>
      </div>

      {/* Accountability Partner */}
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Users size={16} color="#ec4899" /> Accountability Partners
        </h3>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
            Share your progress with a partner (e.g., your spouse) so they can help keep you accountable.
          </p>
          {settings.sharedWithEmails.map(email => (
            <div key={email} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                {email[0].toUpperCase()}
              </div>
              <span style={{ flex: 1, fontSize: 13 }}>{email}</span>
              <button onClick={() => updateSettings({ sharedWithEmails: settings.sharedWithEmails.filter(e => e !== email) })}
                style={{ background: 'none', color: 'var(--text-muted)' }}>
                <X size={15} />
              </button>
            </div>
          ))}
          <div className="flex gap-2 mt-3">
            <input
              value={sharedEmail}
              onChange={e => setSharedEmail(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSharedEmail(); } }}
              placeholder="partner@email.com"
              type="email"
              style={{ flex: 1 }}
            />
            <Button variant="secondary" size="sm" onClick={addSharedEmail}>
              <Plus size={14} /> Add
            </Button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Bell size={16} color="#f59e0b" /> Notifications
        </h3>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Enable Notifications</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Goal reminders and event alerts</div>
            </div>
            <div
              onClick={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
              style={{
                width: 44, height: 24, borderRadius: 12,
                background: settings.notificationsEnabled ? 'var(--accent)' : 'var(--border)',
                position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0,
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: '50%', background: 'white',
                position: 'absolute', top: 3, left: settings.notificationsEnabled ? 23 : 3,
                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('goals');

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 px-4" style={{ background: 'rgba(8,13,26,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', paddingTop: 16, paddingBottom: 0 }}>
        <div className="flex items-center gap-2 mb-3">
          <Settings size={18} color="var(--accent)" />
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>Settings</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 overflow-x-auto" style={{ scrollbarWidth: 'none', borderBottom: '1px solid var(--border)', marginLeft: -16, marginRight: -16, paddingLeft: 16 }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '10px 14px', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
                color: activeTab === id ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: activeTab === id ? '2px solid var(--accent)' : '2px solid transparent',
                background: 'none', marginBottom: -1,
                transition: 'color 0.15s',
              }}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-4 py-4 max-w-2xl mx-auto animate-fade-in">
        {activeTab === 'goals' && <GoalsSection />}
        {activeTab === 'templates' && <TemplatesSection />}
        {activeTab === 'coach' && <CoachSection />}
        {activeTab === 'integrations' && <IntegrationsSection />}
        {activeTab === 'account' && (
          <div className="flex flex-col items-center py-12 gap-3">
            <User size={40} color="var(--text-muted)" style={{ opacity: 0.4 }} />
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Account management coming soon</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', opacity: 0.6 }}>Sign in to sync across devices</p>
          </div>
        )}
      </div>
    </div>
  );
}
