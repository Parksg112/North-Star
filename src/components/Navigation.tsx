'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  NotebookPen,
  Bot,
  Settings,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/',         icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/plan',     icon: CalendarDays,    label: 'Plan'      },
  { href: '/notes',    icon: NotebookPen,     label: 'Notes'     },
  { href: '/coach',    icon: Bot,             label: 'Coach'     },
  { href: '/settings', icon: Settings,        label: 'Settings'  },
];

/* Gemini-style 4-pointed star SVG */
function GeminiStar({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="gemini-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#4285F4" />
          <stop offset="33%"  stopColor="#0ea5e9" />
          <stop offset="66%"  stopColor="#c084fc" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
      </defs>
      {/* 4-pointed star path */}
      <path
        d="M12 2C12 2 12.8 7.2 15.5 9.5C18.2 11.8 22 12 22 12C22 12 18.2 12.2 15.5 14.5C12.8 16.8 12 22 12 22C12 22 11.2 16.8 8.5 14.5C5.8 12.2 2 12 2 12C2 12 5.8 11.8 8.5 9.5C11.2 7.2 12 2 12 2Z"
        fill="url(#gemini-grad)"
      />
    </svg>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background: 'rgba(10,10,10,0.92)',
        backdropFilter: 'blur(28px) saturate(160%)',
        WebkitBackdropFilter: 'blur(28px) saturate(160%)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around px-1 py-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all"
              style={{
                color: active ? 'var(--accent)' : 'var(--text-muted)',
                minWidth: 52,
                paddingLeft: 10,
                paddingRight: 10,
              }}
            >
              {/* Active indicator pill */}
              {active && (
                <span
                  style={{
                    position: 'absolute',
                    width: 32,
                    height: 2,
                    borderRadius: 9999,
                    background: 'var(--gradient-blue)',
                    top: 0,
                    transform: 'translateY(-1px)',
                  }}
                />
              )}
              <span style={{ position: 'relative' }}>
                <Icon
                  size={20}
                  strokeWidth={active ? 2.5 : 1.6}
                  style={{ opacity: active ? 1 : 0.5 }}
                />
              </span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: active ? 600 : 400,
                  letterSpacing: active ? 0.5 : 0,
                  textTransform: 'uppercase',
                  opacity: active ? 1 : 0.45,
                }}
              >
                {label}
              </span>
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
        background: 'rgba(10,10,10,0.95)',
        backdropFilter: 'blur(28px) saturate(160%)',
        WebkitBackdropFilter: 'blur(28px) saturate(160%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <GeminiStar size={28} />
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: -0.3,
              color: 'var(--text-primary)',
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            North Star
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Accountability
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-0.5 p-3 flex-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
              style={{
                color: active ? '#fff' : 'var(--text-muted)',
                background: active
                  ? 'rgba(66,133,244,0.14)'
                  : 'transparent',
                fontWeight: active ? 500 : 400,
                fontSize: 13,
                letterSpacing: -0.01,
                border: active
                  ? '1px solid rgba(66,133,244,0.22)'
                  : '1px solid transparent',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {active && (
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '20%',
                    bottom: '20%',
                    width: 2.5,
                    borderRadius: 9999,
                    background: 'var(--gradient-blue)',
                  }}
                />
              )}
              <Icon
                size={16}
                strokeWidth={active ? 2.5 : 1.7}
                style={{ color: active ? 'var(--accent)' : 'inherit' }}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="p-4"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          fontSize: 10,
          color: 'var(--text-muted)',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}
      >
        North Star · 2026
      </div>
    </aside>
  );
}
