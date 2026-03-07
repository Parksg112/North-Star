'use client';

import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import {
  Search, Plus, Tag, Pin, PinOff, Trash2, Calendar, Sparkles,
  NotebookPen, X, ChevronRight, Hash, Filter,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { parseNoteForEvents } from '@/lib/utils';
import type { Note } from '@/lib/types';

const NOTE_COLORS = [
  undefined, '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#14b8a6',
];

// ─── Note Editor Modal ────────────────────────────────────────────────────────

function NoteEditorModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: Note;
  onSave: (data: { content: string; title?: string; tags: string[]; color?: string }) => void;
  onClose: () => void;
}) {
  const [content, setContent] = useState(initial?.content ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [color, setColor] = useState(initial?.color);
  const [detectedEvent, setDetectedEvent] = useState(() => {
    if (initial?.content) return parseNoteForEvents(initial.content);
    return null;
  });

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(prev => prev.filter(t => t !== tag));

  const handleContentChange = (val: string) => {
    setContent(val);
    setDetectedEvent(parseNoteForEvents(val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSave({ content: content.trim(), title: title.trim() || undefined, tags, color });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Title (optional)</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Note title..." />
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Note *</label>
        <textarea
          value={content}
          onChange={e => handleContentChange(e.target.value)}
          placeholder="Write your note... Try 'call John at 3pm' to auto-create a reminder"
          rows={5}
          style={{ resize: 'vertical' }}
          autoFocus
          required
        />
      </div>

      {/* Smart event detection */}
      {detectedEvent && (
        <div
          className="flex items-center gap-2 p-3 rounded-xl"
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}
        >
          <Sparkles size={16} color="var(--accent)" />
          <div style={{ flex: 1, fontSize: 12, color: 'var(--text-primary)' }}>
            <span style={{ fontWeight: 600, color: 'var(--accent)' }}>Smart detect: </span>
            &quot;{detectedEvent.title}&quot; at {detectedEvent.time}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>→ Calendar</span>
        </div>
      )}

      {/* Tags */}
      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Tags</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'var(--accent-muted)', border: '1px solid rgba(99,102,241,0.3)', fontSize: 11, color: 'var(--accent)' }}>
              <Hash size={10} />
              {tag}
              <button type="button" onClick={() => removeTag(tag)} style={{ color: 'inherit', marginLeft: 2, lineHeight: 1 }}>
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
            placeholder="Add tag (press Enter)"
            style={{ flex: 1 }}
          />
          <Button variant="secondary" type="button" size="sm" onClick={addTag}>Add</Button>
        </div>
      </div>

      {/* Color */}
      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Color</label>
        <div className="flex gap-2">
          {NOTE_COLORS.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setColor(c)}
              style={{
                width: 26, height: 26, borderRadius: '50%',
                background: c ?? 'var(--bg-secondary)',
                border: color === c ? '2px solid white' : '2px solid var(--border)',
                boxShadow: color === c ? `0 0 0 2px ${c ?? 'var(--accent)'}` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" type="button" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
        <Button variant="primary" type="submit" style={{ flex: 1 }}>
          {initial ? 'Update' : 'Save Note'}
        </Button>
      </div>
    </form>
  );
}

// ─── Note Card ────────────────────────────────────────────────────────────────

function NoteCard({
  note,
  onEdit,
  onDelete,
  onPin,
}: {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
  onPin: () => void;
}) {
  const accent = note.color ?? 'var(--border)';
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${note.color ? note.color + '40' : 'var(--border)'}`,
        borderLeft: `3px solid ${note.color ?? 'var(--text-muted)'}`,
        borderRadius: 12,
        padding: 14,
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
      onClick={onEdit}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div style={{ flex: 1, minWidth: 0 }}>
          {note.title && (
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
              {note.title}
            </div>
          )}
          <p style={{
            fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {note.content}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onPin(); }}
            style={{ background: 'none', padding: 3, color: note.pinned ? '#f59e0b' : 'var(--text-muted)' }}
          >
            {note.pinned ? <Pin size={14} fill="#f59e0b" /> : <PinOff size={14} />}
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            style={{ background: 'none', padding: 3, color: 'var(--text-muted)' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {note.tags.map(tag => (
            <span key={tag} className="flex items-center gap-0.5 px-2 py-0.5 rounded-full"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontSize: 10, color: 'var(--text-muted)' }}>
              <Hash size={8} />{tag}
            </span>
          ))}
        </div>
      )}

      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
        {format(parseISO(note.updatedAt), 'MMM d, yyyy · h:mm a')}
      </div>
    </div>
  );
}

// ─── Notes Page ───────────────────────────────────────────────────────────────

export default function NotesPage() {
  const notes = useStore(s => s.notes);
  const addNote = useStore(s => s.addNote);
  const updateNote = useStore(s => s.updateNote);
  const deleteNote = useStore(s => s.deleteNote);
  const togglePinNote = useStore(s => s.togglePinNote);
  const addEvent = useStore(s => s.addEvent);

  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const allTags = useMemo(() => {
    const tagMap = new Map<string, number>();
    notes.forEach(n => n.tags.forEach(t => tagMap.set(t, (tagMap.get(t) ?? 0) + 1)));
    return Array.from(tagMap.entries()).sort((a, b) => b[1] - a[1]);
  }, [notes]);

  const filtered = useMemo(() => {
    let result = [...notes];
    if (activeTag) result = result.filter(n => n.tags.includes(activeTag));
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(n =>
        n.content.toLowerCase().includes(q) ||
        n.title?.toLowerCase().includes(q) ||
        n.tags.some(t => t.includes(q))
      );
    }
    return result.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, search, activeTag]);

  const handleSaveNote = (data: { content: string; title?: string; tags: string[]; color?: string }, detected?: ReturnType<typeof parseNoteForEvents>) => {
    if (editingNote) {
      updateNote(editingNote.id, data);
    } else {
      addNote(data);
      // Smart calendar event creation
      const parsed = parseNoteForEvents(data.content);
      if (parsed?.time) {
        const today = new Date();
        const [h, m] = parsed.time.split(':').map(Number);
        const start = new Date(today);
        start.setHours(h, m, 0, 0);
        const end = new Date(start.getTime() + 30 * 60000);
        addEvent({
          title: parsed.title,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          category: 'personal',
          color: '#6366f1',
        });
      }
    }
    setEditingNote(null);
    setShowEditor(false);
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 px-4" style={{ background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, paddingBottom: 12 }}>
        <div className="flex items-center gap-2 mb-3">
          <NotebookPen size={18} color="var(--accent)" />
          <h1 style={{ fontSize: 18, fontWeight: 700, flex: 1 }}>Notes</h1>
          <button
            onClick={() => { setEditingNote(null); setShowEditor(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, background: 'var(--accent)', color: 'white', fontWeight: 600, fontSize: 13 }}
          >
            <Plus size={15} /> New
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes..."
            style={{ paddingLeft: 32 }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Tags filter */}
        {allTags.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pt-2" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setActiveTag(null)}
              style={{
                flexShrink: 0, padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 500,
                background: !activeTag ? 'var(--accent)' : 'var(--bg-secondary)',
                border: `1px solid ${!activeTag ? 'var(--accent)' : 'var(--border)'}`,
                color: !activeTag ? 'white' : 'var(--text-muted)',
              }}
            >
              All
            </button>
            {allTags.map(([tag, count]) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                style={{
                  flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 500,
                  background: activeTag === tag ? 'var(--accent-muted)' : 'var(--bg-secondary)',
                  border: `1px solid ${activeTag === tag ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`,
                  color: activeTag === tag ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                <Hash size={9} /> {tag} <span style={{ opacity: 0.6 }}>({count})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes list */}
      <div className="px-4 py-4 flex flex-col gap-3 max-w-2xl mx-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <NotebookPen size={40} color="var(--text-muted)" style={{ marginBottom: 12, opacity: 0.5 }} />
            <p style={{ fontSize: 15, color: 'var(--text-muted)', fontWeight: 500 }}>
              {search || activeTag ? 'No notes match your search' : 'No notes yet'}
            </p>
            {!search && !activeTag && (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', opacity: 0.6, marginTop: 4 }}>
                Try &quot;call John at 3pm&quot; — it&apos;ll create a calendar reminder!
              </p>
            )}
          </div>
        ) : (
          filtered.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={() => { setEditingNote(note); setShowEditor(true); }}
              onDelete={() => deleteNote(note.id)}
              onPin={() => togglePinNote(note.id)}
            />
          ))
        )}
      </div>

      {/* Smart note hint */}
      {notes.length === 0 && (
        <div className="px-4 pb-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <Sparkles size={14} color="var(--accent)" />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Smart notes detect calendar events. Try writing &quot;dentist at 2pm&quot; and it&apos;ll appear in your calendar!
            </span>
          </div>
        </div>
      )}

      {/* Note editor modal */}
      <Modal open={showEditor} onClose={() => { setShowEditor(false); setEditingNote(null); }} title={editingNote ? 'Edit Note' : 'New Note'} maxWidth={520}>
        <NoteEditorModal
          initial={editingNote ?? undefined}
          onSave={(data) => handleSaveNote(data)}
          onClose={() => { setShowEditor(false); setEditingNote(null); }}
        />
      </Modal>
    </div>
  );
}
