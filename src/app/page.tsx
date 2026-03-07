'use client';

import { useState } from 'react';
import { format, startOfWeek, endOfWeek, isToday } from 'date-fns';
import { TrendingUp, CheckCircle2, Target, Trophy, Flame, Calendar, Star, Zap } from 'lucide-react';
import { useStore } from '@/lib/store';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { getGoalProgress, getTodayGoalProgress, getWeekGoalProgress, formatMetricValue } from '@/lib/utils';
import type { Goal } from '@/lib/types';

/* ─── Gemini star mark ─────────────────────────────────────────────────────── */
function GeminiMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="gm-hd" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#4285F4" />
          <stop offset="50%"  stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
      </defs>
      <path
        d="M12 2C12 2 12.8 7.2 15.5 9.5C18.2 11.8 22 12 22 12C22 12 18.2 12.2 15.5 14.5C12.8 16.8 12 22 12 22C12 22 11.2 16.8 8.5 14.5C5.8 12.2 2 12 2 12C2 12 5.8 11.8 8.5 9.5C11.2 7.2 12 2 12 2Z"
        fill="url(#gm-hd)"
      />
    </svg>
  );
}

/* ─── Log Progress Modal ─────────────────────────────────────────────────────── */
function LogProgressModal({ goal, onClose }: { goal: Goal; onClose: () => void }) {
  const logGoalProgress = useStore(s => s.logGoalProgress);
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseFloat(value);
    if (!isNaN(v) && v > 0) { logGoalProgress(goal.id, v, note || undefined); onClose(); }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div style={{ textAlign: 'center', fontSize: 40, marginBottom: 2 }}>{goal.icon}</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: -0.4 }}>{goal.title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
          {formatMetricValue(goal.current, goal.unit)} / {formatMetricValue(goal.target, goal.unit)}
        </div>
      </div>
      <div>
        <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Amount ({goal.unit})
        </label>
        <input type="number" step="any" min="0" value={value} onChange={e => setValue(e.target.value)} placeholder="0" autoFocus required />
      </div>
      <div>
        <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>Note (optional)</label>
        <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="How did it go?" />
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" type="button" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
        <Button variant="primary" type="submit" style={{ flex: 1 }}>Log Progress</Button>
      </div>
    </form>
  );
}

/* ─── Goal Card ──────────────────────────────────────────────────────────────── */
function GoalCard({ goal, onLog }: { goal: Goal; onLog: () => void }) {
  const progress = getGoalProgress(goal);
  return (
    <div
      onClick={onLog}
      className="flex items-center gap-3 p-3 rounded-xl cursor-pointer"
      style={{
        background: '#161616',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        transition: 'background 0.18s, border-color 0.18s',
      }}
    >
      <ProgressRing progress={progress} size={46} strokeWidth={4} color={goal.color}>
        <span style={{ fontSize: 13 }}>{goal.icon}</span>
      </ProgressRing>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 5, letterSpacing: -0.2, color: 'var(--text-primary)' }}>
          {goal.title}
        </div>
        <div className="progress-bar" style={{ height: 3 }}>
          <div className="progress-bar-fill" style={{ width: `${progress}%`, background: goal.color, height: '100%' }} />
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
          {formatMetricValue(goal.current, goal.unit)} of {formatMetricValue(goal.target, goal.unit)}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: goal.color, letterSpacing: -0.5 }}>{progress}%</div>
        <div style={{
          fontSize: 9, color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase',
          letterSpacing: 0.4, background: 'rgba(255,255,255,0.05)', borderRadius: 4, padding: '1px 5px',
        }}>
          {goal.period}
        </div>
      </div>
    </div>
  );
}

/* ─── Section header ─────────────────────────────────────────────────────────── */
function SectionHeader({ icon, color, title, sub, right }: {
  icon: React.ReactNode; color: string; title: string; sub: string; right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div style={{ background: color + '18', borderRadius: 10, padding: '7px 9px', display: 'flex' }}>
        {icon}
      </div>
      <div>
        <h2 style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.3 }}>{title}</h2>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{sub}</p>
      </div>
      {right && <div className="ml-auto">{right}</div>}
    </div>
  );
}

/* ─── Daily Section ──────────────────────────────────────────────────────────── */
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
      <SectionHeader
        icon={<Flame size={15} color="#F4B400" />}
        color="#F4B400"
        title="Today"
        sub={format(new Date(), 'EEEE, MMMM d')}
        right={
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(66,133,244,0.1)', border: '1px solid rgba(66,133,244,0.2)' }}>
            <Zap size={12} color="var(--accent)" />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)' }}>{overallProgress}%</span>
          </div>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Daily Goals', value: dailyGoals.length,     color: '#4285F4' },
          { label: 'Events',      value: todayEvents.length,    color: '#0F9D58' },
          { label: 'Done',        value: completedEvents,       color: '#DB4437' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: '#161616', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16, padding: '14px 8px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 24, fontWeight: 700, color, letterSpacing: -1 }}>{value}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
          </div>
        ))}
      </div>

      {dailyGoals.length > 0 ? (
        <div className="flex flex-col gap-2">
          {dailyGoals.map(g => <GoalCard key={g.id} goal={g} onLog={() => setSelectedGoal(g)} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center py-10 rounded-2xl"
          style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.07)' }}>
          <Target size={26} color="var(--text-muted)" style={{ marginBottom: 8, opacity: 0.5 }} />
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No daily goals — add them in Settings</p>
        </div>
      )}

      <Modal open={!!selectedGoal} onClose={() => setSelectedGoal(null)} title="Log Progress">
        {selectedGoal && <LogProgressModal goal={selectedGoal} onClose={() => setSelectedGoal(null)} />}
      </Modal>
    </section>
  );
}

/* ─── Weekly Section ─────────────────────────────────────────────────────────── */
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
      <SectionHeader
        icon={<TrendingUp size={15} color="#4285F4" />}
        color="#4285F4"
        title="This Week"
        sub={`${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d')}`}
        right={<span style={{ fontSize: 12, fontWeight: 600, color: '#4285F4' }}>{avgProgress}% avg</span>}
      />
      {weeklyGoals.length > 0 ? (
        <div className="flex flex-col gap-2">
          {weeklyGoals.map(g => <GoalCard key={g.id} goal={g} onLog={() => setSelectedGoal(g)} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center py-10 rounded-2xl"
          style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.07)' }}>
          <TrendingUp size={26} color="var(--text-muted)" style={{ marginBottom: 8, opacity: 0.5 }} />
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No weekly goals — add them in Settings</p>
        </div>
      )}
      <Modal open={!!selectedGoal} onClose={() => setSelectedGoal(null)} title="Log Progress">
        {selectedGoal && <LogProgressModal goal={selectedGoal} onClose={() => setSelectedGoal(null)} />}
      </Modal>
    </section>
  );
}

/* ─── Yearly Section ─────────────────────────────────────────────────────────── */
function YearlySection() {
  const goals = useStore(s => s.goals);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const yearlyGoals = goals.filter(g => (g.period === 'yearly' || g.period === 'custom') && g.status === 'active');
  const year = new Date().getFullYear();
  const dayOfYear = Math.floor((new Date().getTime() - new Date(`${year}-01-01`).getTime()) / 86400000) + 1;
  const yearProgress = Math.round((dayOfYear / 365) * 100);

  return (
    <section>
      <SectionHeader
        icon={<Trophy size={15} color="#0F9D58" />}
        color="#0F9D58"
        title={`${year} Goals`}
        sub={`Day ${dayOfYear} · ${yearProgress}% through the year`}
      />

      {/* Year progress card — hero gradient */}
      <div style={{
        background: 'linear-gradient(135deg, #1a56db 0%, #1a1560 100%)',
        border: '1px solid rgba(66,133,244,0.25)',
        borderRadius: 20,
        padding: '18px 20px',
        marginBottom: 16,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Shimmer overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div className="flex justify-between mb-3">
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Jan 1</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#7aadff', letterSpacing: 0.5 }}>Day {dayOfYear}</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Dec 31</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 9999, height: 6, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 9999,
            width: `${yearProgress}%`,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))',
            transition: 'width 0.65s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>
        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
          {365 - dayOfYear} days remaining in {year}
        </div>
      </div>

      {yearlyGoals.length > 0 ? (
        <div className="flex flex-col gap-2">
          {yearlyGoals.map(g => <GoalCard key={g.id} goal={g} onLog={() => setSelectedGoal(g)} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center py-10 rounded-2xl"
          style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.07)' }}>
          <Trophy size={26} color="var(--text-muted)" style={{ marginBottom: 8, opacity: 0.5 }} />
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No yearly goals — add them in Settings</p>
        </div>
      )}
      <Modal open={!!selectedGoal} onClose={() => setSelectedGoal(null)} title="Log Progress">
        {selectedGoal && <LogProgressModal goal={selectedGoal} onClose={() => setSelectedGoal(null)} />}
      </Modal>
    </section>
  );
}

/* ─── Dashboard Page ─────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const goals = useStore(s => s.goals);
  const events = useStore(s => s.events);
  const todayEvents = events.filter(e => isToday(new Date(e.startTime)));
  const completedGoals = goals.filter(g => getGoalProgress(g) >= 100).length;

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-primary)' }}>
      {/* Sticky header */}
      <div className="sticky top-0 z-40 px-4 glass" style={{ paddingTop: 16, paddingBottom: 14 }}>
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div>
            <div className="flex items-center gap-2.5">
              <GeminiMark size={22} />
              <h1 style={{ fontSize: 19, fontWeight: 700, letterSpacing: -0.6 }}>North Star</h1>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, letterSpacing: 0.1 }}>
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(244,180,0,0.1)', border: '1px solid rgba(244,180,0,0.22)' }}>
            <Flame size={13} color="#F4B400" />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#F4B400' }}>7 day streak</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 flex flex-col gap-8 max-w-2xl mx-auto">

        {/* Hero stat cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Goals card — blue gradient */}
          <div style={{
            background: 'linear-gradient(135deg, #1a56db 0%, #1a1560 100%)',
            border: '1px solid rgba(66,133,244,0.25)',
            borderRadius: 20, padding: '18px 16px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
            <div className="flex items-center gap-2 mb-2">
              <Target size={14} color="rgba(255,255,255,0.7)" />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>Goals</span>
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: -2, lineHeight: 1 }}>
              {goals.filter(g => g.status === 'active').length}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
              {completedGoals} fully complete
            </div>
          </div>

          {/* Events card — green tint */}
          <div style={{
            background: 'linear-gradient(135deg, #0d3d2e 0%, #111111 100%)',
            border: '1px solid rgba(15,157,88,0.2)',
            borderRadius: 20, padding: '18px 16px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(15,157,88,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} color="rgba(15,157,88,0.8)" />
              <span style={{ fontSize: 11, color: 'rgba(15,157,88,0.7)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>Today</span>
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: -2, lineHeight: 1 }}>
              {todayEvents.length}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
              events scheduled
            </div>
          </div>
        </div>

        <DailySection />
        <WeeklySection />
        <YearlySection />
        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}
