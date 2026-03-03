'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: number;
}

export function Modal({ open, onClose, title, children, maxWidth = 480 }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full md:w-auto animate-slide-up"
        style={{
          maxWidth,
          width: '100%',
          background: '#161616',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px 24px 0 0',
          maxHeight: '90dvh',
          overflow: 'auto',
        }}
      >
        {title && (
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: -0.3 }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                padding: '4px 8px',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={15} />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
