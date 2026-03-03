'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  NotebookPen,
  Bot,
  Settings,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/plan', icon: CalendarDays, label: 'Plan' },
  { href: '/notes', icon: NotebookPen, label: 'Notes' },
  { href: '/coach', icon: Bot, label: 'Coach' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background: 'rgba(8, 13, 26, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all"
              style={{
                color: active ? 'var(--accent)' : 'var(--text-muted)',
                background: active ? 'var(--accent-muted)' : 'transparent',
                minWidth: 52,
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function SideNav() {
  const pathname = usePathname();
  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-50"
      style={{
        width: 220,
        background: 'rgba(8, 13, 26, 0.98)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div
          className="flex items-center justify-center rounded-xl"
          style={{ width: 36, height: 36, background: 'var(--accent)', boxShadow: '0 0 16px rgba(99,102,241,0.5)' }}
        >
          <Star size={18} fill="white" color="white" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>North Star</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Accountability App</div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
              style={{
                color: active ? 'var(--accent-hover)' : 'var(--text-secondary)',
                background: active ? 'var(--accent-muted)' : 'transparent',
                fontWeight: active ? 600 : 400,
                fontSize: 14,
                border: active ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
              }}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom info */}
      <div className="p-4" style={{ borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)' }}>
        <div>2026 · North Star</div>
      </div>
    </aside>
  );
}
