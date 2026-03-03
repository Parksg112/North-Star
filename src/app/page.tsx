'use client';

import { useState } from 'react';
import { format, startOfWeek, endOfWeek, isToday } from 'date-fns';
import {
  TrendingUp, CheckCircle2, Target, Trophy,
  Flame, Calendar, Star, Zap
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  getGoalProgress, getTodayGoalProgress, getWeekGoalProgress,
  formatMetricValue,
} from '@/lib/utils';
import type { Goal } from '@/lib/types';

function LogProgressModal({ goal, onClose }: { goal: Goal; onClose: () => void }) {
  const logGoalProgress = useStore(s => s.logGoalProgress);
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseFloat(value);
    if (!isNaN(v) && v > 0) {
      logGoalProgress(goal.id, v, note || undefined);
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div style={{ textAlign: 'center', fontSize: 36, marginBottom: 4 }}>{goal.icon}</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 600, fontSize: 16 }}>{goal.title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
          {formatMetricValue(goal.current, goal.unit)} / {formatMetricValue(goal.target, goal.unit)}
        </div>
      </div>
      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
          Amount ({goal.unit})
        </label>
        <input type="number" step="any" min="0" value={value} onChange={e => setValue(e.target.value)} placeholder="e.g. 3" autoFocus required />
      </div>
      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Note (optional)</label>
        <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="How did it go?" />
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" type="button" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
        <Button variant="primary" type="submit" style={{ flex: 1 }}>Log Progress</Button>
      </div>
    </form>
  );
}

function GoalCard({ goal, onLog }: { goal: Goal; onLog: () => void }) {
  const progress = getGoalProgress(goal);
  return (
    <div
      onClick={onLog}
      className="flex items-center gap-3 p-3 rounded-xl cursor-pointer"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', transition: 'background 0.15s' }}
    >
      <ProgressRing progress={progress} size={48} strokeWidth={4} color={goal.color}>
        <span style={{ fontSize: 14 }}>{goal.icon}</span>
      </ProgressRing>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{goal.title}</div>
        <div className="progress-bar" style={{ height: 4 }}>
          <div className="progress-bar-fill" style={{ width: `${progress}%`, background: goal.color, height: '100%' }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
          {formatMetricValue(goal.current, goal.unit)} of {formatMetricValue(goal.target, goal.unit)}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: goal.color }}>{progress}%</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: 4, padding: '1px 5px', marginTop: 2 }}>
          {goal.period}
        </div>
      </div>
    </div>
  );
}

function DailySection() {
  const goals = useStore(s => s.goals);
  const events = useStore(s => s.events);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const dailyGoals = goals.filter(g => g.period === 'daily' && g.status === 'active');
  const todayEvents = events.filter(e => isToday(new Date(e.startTime)));
  const completedEvents = todayEvents.filter(e => e.completed).length;
  const overallProgress = dailyGoals.length
    ? Math.round(dailyGoals.reduce((s, g) => s + getTodayGoalProgress(g), 0) / dailyGoals.length) : 0;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div style={{ background: 'rgba(251,191,36,0.15)', borderRadius: 8, padding: '6px 8px' }}>
          <Flame size={16} color="#f59e0b" />
        </div>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Today</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'var(--accent-muted)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <Zap size={13} color="var(--accent)" />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{overallProgress}%</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Daily Goals', value: dailyGoals.length, icon: Target, color: '#6366f1' },
          { label: 'Events', value: todayEvents.length, icon: Calendar, color: '#3b82f6' },
          { label: 'Done', value: completedEvents, icon: CheckCircle2, color: '#10b981' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex flex-col items-center justify-center p-3 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', gap: 4 }}>
            <Icon size={18} color={color} />
            <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>{label}</div>
          </div>
        ))}
      </div>
      {dailyGoals.length > 0 ? (
        <div className="flex flex-col gap-2">
          {dailyGoals.map(g => <GoalCard key={g.id} goal={g} onLog={() => setSelectedGoal(g)} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center py-8 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <Target size={28} color="var(--text-muted)" style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No daily goals — add them in Settings</p>
        </div>
      )}
      <Modal open={!!selectedGoal} onClose={() => setSelectedGoal(null)} title="Log Progress">
        {selectedGoal && <LogProgressModal goal={selectedGoal} onClose={() => setSelectedGoal(null)} />}
      </Modal>
    </section>
  );
}

function WeeklySection() {
  const goals = useStore(s => s.goals);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const weeklyGoals = goals.filter(g => g.period === 'weekly' && g.status === 'active');
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const avgProgress = weeklyGoals.length
    ? Math.round(weeklyGoals.reduce((s, g) => s + getWeekGoalProgress(g), 0) / weeklyGoals.length) : 0;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div style={{ background: 'rgba(99,102,241,0.15)', borderRadius: 8, padding: '6px 8px' }}>
          <TrendingUp size={16} color="var(--accent)" />
        </div>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>This Week</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d')}</p>
        </div>
        <div className="ml-auto" style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>{avgProgress}% avg</div>
      </div>
      {weeklyGoals.length > 0 ? (
        <div className="flex flex-col gap-2">
          {weeklyGoals.map(g => <GoalCard key={g.id} goal={g} onLog={() => setSelectedGoal(g)} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center py-8 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <TrendingUp size={28} color="var(--text-muted)" style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No weekly goals — add them in Settings</p>
        </div>
      )}
      <Modal open={!!selectedGoal} onClose={() => setSelectedGoal(null)} title="Log Progress">
        {selectedGoal && <LogProgressModal goal={selectedGoal} onClose={() => setSelectedGoal(null)} />}
      </Modal>
    </section>
  );
}

function YearlySection() {
  const goals = useStore(s => s.goals);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const yearlyGoals = goals.filter(g => (g.period === 'yearly' || g.period === 'custom') && g.status === 'active');
  const year = new Date().getFullYear();
  const dayOfYear = Math.floor((Date.now() - new Date(`${year}-01-01`).getTime()) / 86400000) + 1;
  const yearProgress = Math.round((dayOfYear / 365) * 100);

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div style={{ background: 'rgba(16,185,129,0.15)', borderRadius: 8, padding: '6px 8px' }}>
          <Trophy size={16} color="#10b981" />
        </div>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>{year} Goals</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Day {dayOfYear} · {yearProgress}% through {year}</p>
        </div>
      </div>
      <div className="p-4 rounded-xl mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex justify-between mb-2">
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Jan 1</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#10b981' }}>Day {dayOfYear}</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Dec 31</span>
        </div>
        <div className="progress-bar" style={{ height: 8 }}>
          <div className="progress-bar-fill" style={{ width: `${yearProgress}%`, background: 'linear-gradient(90deg, #6366f1, #10b981)', height: '100%' }} />
        </div>
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
          {365 - dayOfYear} days remaining
        </div>
      </div>
      {yearlyGoals.length > 0 ? (
        <div className="flex flex-col gap-2">
          {yearlyGoals.map(g => <GoalCard key={g.id} goal={g} onLog={() => setSelectedGoal(g)} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center py-8 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <Trophy size={28} color="var(--text-muted)" style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No yearly goals — add them in Settings</p>
        </div>
      )}
      <Modal open={!!selectedGoal} onClose={() => setSelectedGoal(null)} title="Log Progress">
        {selectedGoal && <LogProgressModal goal={selectedGoal} onClose={() => setSelectedGoal(null)} />}
      </Modal>
    </section>
  );
}

export default function DashboardPage() {
  const goals = useStore(s => s.goals);
  const events = useStore(s => s.events);
  const todayEvents = events.filter(e => isToday(new Date(e.startTime)));
  const completedGoals = goals.filter(g => getGoalProgress(g) >= 100).length;

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-primary)' }}>
      <div className="sticky top-0 z-40 px-4" style={{ background: 'rgba(8,13,26,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', paddingTop: 16, paddingBottom: 12 }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Star size={18} color="var(--accent)" fill="var(--accent)" />
              <h1 style={{ fontSize: 20, fontWeight: 800 }}>North Star</h1>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)' }}>
            <Flame size={14} color="#f59e0b" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>7 day streak</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-8 max-w-2xl mx-auto">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))', border: '1px solid rgba(99,102,241,0.25)' }}>
            <div className="flex items-center gap-2 mb-1"><Target size={16} color="var(--accent)" /><span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>Goals</span></div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{goals.filter(g => g.status === 'active').length}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{completedGoals} fully complete</div>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))', border: '1px solid rgba(16,185,129,0.25)' }}>
            <div className="flex items-center gap-2 mb-1"><Calendar size={16} color="#10b981" /><span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>Today</span></div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{todayEvents.length}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>events scheduled</div>
          </div>
        </div>
        <DailySection />
        <WeeklySection />
        <YearlySection />
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
