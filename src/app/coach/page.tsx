'use client';

import { useState, useRef, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import {
  Bot, Send, User, Sparkles, RefreshCw, Lightbulb, Target,
  TrendingUp, Clock, ChevronRight, AlertCircle, Loader2,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { getGoalProgress, formatMetricValue } from '@/lib/utils';
import type { ChatMessage } from '@/lib/types';

const PROMPT_SUGGESTIONS = [
  "How can I better achieve my running goal this week?",
  "What patterns do you see in my progress?",
  "Help me optimize my daily schedule",
  "What's my biggest opportunity for improvement?",
  "How can I use my Gallup strengths more effectively?",
  "Create a plan to help me reach my yearly goals",
];

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-slide-up`}>
      {/* Avatar */}
      <div
        style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isUser ? 'var(--accent)' : 'var(--bg-card)',
          border: isUser ? 'none' : '1px solid var(--border)',
        }}
      >
        {isUser ? <User size={15} color="white" /> : <Bot size={15} color="var(--accent)" />}
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: '80%' }}>
        <div
          className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}
          style={{ padding: '10px 14px', fontSize: 14, lineHeight: 1.6, color: 'var(--text-primary)' }}
        >
          {message.content.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < message.content.split('\n').length - 1 && <br />}
            </span>
          ))}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, textAlign: isUser ? 'right' : 'left', paddingLeft: isUser ? 0 : 4, paddingRight: isUser ? 4 : 0 }}>
          {format(parseISO(message.timestamp), 'h:mm a')}
        </div>
      </div>
    </div>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Bot size={15} color="var(--accent)" />
      </div>
      <div className="chat-bubble-ai" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)',
              animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
        <style>{`@keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }`}</style>
      </div>
    </div>
  );
}

// ─── Coach Page ───────────────────────────────────────────────────────────────

export default function CoachPage() {
  const messages = useStore(s => s.messages);
  const addMessage = useStore(s => s.addMessage);
  const goals = useStore(s => s.goals);
  const coachProfile = useStore(s => s.coachProfile);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const buildSystemContext = () => {
    const goalSummary = goals
      .filter(g => g.status === 'active')
      .map(g => `- ${g.title}: ${formatMetricValue(g.current, g.unit)}/${formatMetricValue(g.target, g.unit)} (${getGoalProgress(g)}% complete, ${g.period} goal)`)
      .join('\n');

    return `You are an AI accountability coach for the North Star app. You help users achieve their goals and be more productive.

USER PROFILE:
Name: ${coachProfile.name || 'User'}
Bio: ${coachProfile.bio || 'Not provided'}
Gallup Strengths: ${coachProfile.strengths.join(', ') || 'Not provided'}
Goals & Aspirations: ${coachProfile.goals || 'Not provided'}
Challenges: ${coachProfile.challenges || 'Not provided'}
Core Values: ${coachProfile.values || 'Not provided'}
Weekly Routine: ${coachProfile.weeklyRoutine || 'Not provided'}
${coachProfile.otherContext ? `Additional Context: ${coachProfile.otherContext}` : ''}

CURRENT GOALS PROGRESS:
${goalSummary || 'No active goals'}

Be encouraging, specific, and actionable. Use their strengths to give personalized advice. Keep responses concise but insightful.`;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setError(null);

    addMessage({ role: 'user', content: text.trim() });
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: text.trim() },
          ],
          systemContext: buildSystemContext(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to get response');
      }

      const data = await res.json();
      addMessage({ role: 'assistant', content: data.content });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const isProfileSetup = coachProfile.name || coachProfile.bio || coachProfile.goals;

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}
      className="md:h-screen">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-muted)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bot size={20} color="var(--accent)" />
        </div>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700 }}>AI Coach</h1>
          <div className="flex items-center gap-1.5">
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Online · Powered by Claude</span>
          </div>
        </div>
        <button
          onClick={() => {/* TODO: clear chat */}}
          style={{ marginLeft: 'auto', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
        >
          <RefreshCw size={13} /> New Chat
        </button>
      </div>

      {/* Profile setup banner */}
      {!isProfileSetup && (
        <div
          className="flex items-center gap-2 px-4 py-2.5"
          style={{ background: 'rgba(244,180,0,0.08)', borderBottom: '1px solid rgba(244,180,0,0.18)' }}
        >
          <Sparkles size={14} color="#f59e0b" />
          <span style={{ fontSize: 12, color: 'var(--warning)', flex: 1 }}>
            Set up your profile in Settings for personalized coaching
          </span>
          <a href="/settings" style={{ fontSize: 11, color: 'var(--warning)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
            Setup <ChevronRight size={12} />
          </a>
        </div>
      )}

      {/* Messages area */}
      <div
        ref={scrollRef}
        style={{ flex: 1, overflowY: 'auto', padding: '16px 16px' }}
        className="max-w-2xl mx-auto w-full"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center" style={{ minHeight: 300 }}>
            <div
              style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'var(--accent-muted)', border: '1px solid rgba(99,102,241,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              }}
            >
              <Bot size={32} color="var(--accent)" />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Your AI Coach</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 280, lineHeight: 1.6, marginBottom: 24 }}>
              I&apos;m here to help you stay accountable, find insights, and achieve your goals. Ask me anything!
            </p>

            {/* Goal summary cards */}
            {goals.filter(g => g.status === 'active').length > 0 && (
              <div className="w-full mb-6" style={{ maxWidth: 340 }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textAlign: 'center' }}>Your active goals</p>
                <div className="flex flex-col gap-2">
                  {goals.filter(g => g.status === 'active').slice(0, 3).map(g => (
                    <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                      <span>{g.icon}</span>
                      <span style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)' }}>{g.title}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: g.color }}>{getGoalProgress(g)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prompt suggestions */}
            <div style={{ maxWidth: 400, width: '100%' }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textAlign: 'center' }}>Try asking:</p>
              <div className="flex flex-col gap-2">
                {PROMPT_SUGGESTIONS.slice(0, 4).map(s => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    style={{
                      textAlign: 'left', padding: '10px 14px', borderRadius: 10, fontSize: 13,
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8,
                      transition: 'background 0.15s, border-color 0.15s',
                    }}
                  >
                    <Lightbulb size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map(m => <MessageBubble key={m.id} message={m} />)}
            {isLoading && <TypingIndicator />}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <AlertCircle size={14} color="#ef4444" />
                <span style={{ fontSize: 12, color: '#ef4444' }}>{error}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input area */}
      <div
        className="flex-shrink-0 px-4 py-3 max-w-2xl mx-auto w-full"
        style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-primary)' }}
      >
        {/* Quick suggestions (when there are messages) */}
        {messages.length > 0 && !isLoading && (
          <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {PROMPT_SUGGESTIONS.slice(0, 3).map(s => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                style={{
                  flexShrink: 0, padding: '4px 10px', borderRadius: 8, fontSize: 11,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', whiteSpace: 'nowrap',
                }}
              >
                {s.slice(0, 35)}{s.length > 35 ? '…' : ''}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message your coach... (Enter to send)"
            rows={1}
            style={{
              flex: 1, resize: 'none', borderRadius: 12, padding: '10px 14px',
              fontSize: 14, lineHeight: 1.5, maxHeight: 120, overflowY: 'auto',
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            style={{
              width: 42, height: 42, borderRadius: '50%', background: input.trim() && !isLoading ? 'var(--accent)' : 'var(--bg-secondary)',
              border: '1px solid var(--border)', color: input.trim() && !isLoading ? 'white' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              transition: 'all 0.15s',
            }}
          >
            {isLoading ? <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={17} />}
          </button>
        </form>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', marginTop: 6 }}>
          AI responses may not always be accurate. Powered by Anthropic Claude.
        </p>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
