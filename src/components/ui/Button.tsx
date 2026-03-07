'use client';

import { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'primary', size = 'md', children, style, ...props }: ButtonProps) {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
    letterSpacing: '-0.01em',
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: '#4285F4',
      color: '#ffffff',
      borderRadius: 12,
      boxShadow: '0 1px 3px rgba(66,133,244,0.4)',
    },
    secondary: {
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: 'var(--text-secondary)',
      borderRadius: 12,
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-muted)',
      borderRadius: 10,
    },
    danger: {
      background: 'rgba(219,68,55,0.12)',
      border: '1px solid rgba(219,68,55,0.28)',
      color: '#DB4437',
      borderRadius: 12,
    },
  };

  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: '6px 12px', fontSize: 12 },
    md: { padding: '9px 18px', fontSize: 13 },
    lg: { padding: '12px 24px', fontSize: 14 },
  };

  return (
    <button style={{ ...base, ...variants[variant], ...sizes[size], ...style }} {...props}>
      {children}
    </button>
  );
}
