# North Star — Project Guide for Claude

## What this app is

North Star is a personal accountability and calendaring app for a single user (and his wife as an accountability partner). It lives at `http://localhost:3000` during development. The app has 5 pages accessible via bottom nav (mobile) and sidebar (desktop).

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, `src/app/`) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 + inline `style={}` via CSS variables |
| State | Zustand with `persist` middleware (localStorage key: `north-star-store`) |
| Icons | `lucide-react` |
| Dates | `date-fns` |
| AI Coach | Anthropic Claude via `@anthropic-ai/sdk` — route at `src/app/api/coach/route.ts` |
| Utilities | `clsx` + `tailwind-merge` (via `cn()` in `src/lib/utils.ts`) |

## Directory structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout — SideNav + BottomNav + <main>
│   ├── page.tsx            # Dashboard (daily / weekly / yearly goal overview)
│   ├── plan/page.tsx       # Calendar — day / week / month views + templates
│   ├── notes/page.tsx      # Smart notes with tagging + calendar event detection
│   ├── coach/page.tsx      # AI Coach chat (calls /api/coach)
│   ├── settings/page.tsx   # Goals, Templates, Coach profile, Integrations
│   ├── globals.css         # CSS variables + global resets (dark navy theme)
│   └── api/
│       └── coach/route.ts  # POST — proxies to Anthropic, uses system context
├── components/
│   ├── Navigation.tsx      # SideNav (md+) and BottomNav (mobile)
│   └── ui/
│       ├── Button.tsx      # variant: primary | secondary | ghost | danger
│       ├── Modal.tsx       # Bottom sheet on mobile, centered on desktop
│       └── ProgressRing.tsx # SVG circular progress indicator
└── lib/
    ├── types.ts            # All TypeScript types (Goal, CalendarEvent, Note, etc.)
    ├── store.ts            # Zustand store — all state + actions
    └── utils.ts            # Helpers: cn(), date utils, goal progress, parseNoteForEvents()
```

## CSS design system (variables in globals.css)

```css
--bg-primary:    #080d1a   /* page background */
--bg-secondary:  #0e1628   /* inputs, chips */
--bg-card:       #111d33   /* cards */
--bg-card-hover: #172240
--border:        #1e2d4a
--text-primary:  #f1f5f9
--text-secondary:#94a3b8
--text-muted:    #475569
--accent:        #6366f1   /* indigo — primary CTA */
--accent-muted:  rgba(99,102,241,0.15)
--success:       #10b981
--warning:       #f59e0b
--danger:        #ef4444
```

Never use Tailwind color classes like `bg-gray-900` — always use the CSS variables via `style={}` or the named classes (`progress-bar`, `chat-bubble-user`, etc.) defined in globals.css.

## State management rules

- All state lives in `src/lib/store.ts` — do not create separate state files.
- The Zustand store is persisted to localStorage automatically.
- Default seed data (4 goals, 8 templates) is in the store initializer — update it there if defaults need to change.
- Never fetch data in page components — read from `useStore()` selectors.

## Key types (src/lib/types.ts)

- `Goal` — has `period` (daily | weekly | yearly | custom), `metricType`, `history: GoalEntry[]`, `current` (running total), `target`
- `CalendarEvent` — has `startTime`/`endTime` as ISO strings, `category: EventCategory`, `color`, `completed`
- `TemplateBlock` — reusable calendar block with `defaultDuration` (minutes), `icon`, `color`
- `Note` — has `tags: string[]`, smart detection via `parseNoteForEvents()` in utils.ts
- `ChatMessage` — `role: 'user' | 'assistant'`, stored in Zustand
- `CoachProfile` — free-text fields + `strengths: string[]` (Gallup)

## Navigation layout

- **Mobile**: `BottomNav` fixed at bottom, `<main>` has `paddingBottom: 72px`
- **Desktop (md+)**: `SideNav` fixed at left (220px wide), `<main>` has `md:pl-[220px]`
- Routes: `/` `/plan` `/notes` `/coach` `/settings`

## AI Coach API (src/app/api/coach/route.ts)

- Model: `claude-opus-4-6`
- Requires `ANTHROPIC_API_KEY` in `.env.local`
- Falls back to a helpful demo message when the key is missing (don't break the UI)
- System context is built in `coach/page.tsx` → `buildSystemContext()` and passed in the POST body
- Max tokens: 1024

## Environment variables

Copy `.env.example` → `.env.local` and fill in:

```
ANTHROPIC_API_KEY=          # Required for AI Coach
GOOGLE_CLIENT_ID=           # Future: Google Calendar OAuth
GOOGLE_CLIENT_SECRET=       # Future: Google Calendar OAuth
NEXTAUTH_SECRET=            # Future: auth
NEXTAUTH_URL=http://localhost:3000
```

## Development commands

```bash
npm run dev     # start dev server on :3000
npm run build   # production build (run this to verify no TS/compile errors)
npm run lint    # ESLint check
```

Always run `npm run build` before committing to verify zero errors.

## Planned / not yet wired

- **Google Calendar OAuth**: UI toggle exists in Settings → Integrations. Needs `next-auth` + Google provider + googleapis calls in an API route.
- **Accountability partner sharing**: Email list stored in settings. Needs auth + Supabase or similar backend.
- **Real streak calculation**: Currently hardcoded to 7. Should derive from `goal.history` dates.
- **Recurring events**: `RecurringRule` type defined, not yet rendered in calendar.
- **Drag-and-drop calendar blocks**: Intentionally deferred; use `@dnd-kit/core` when adding.
- **PWA manifest**: Referenced in layout metadata but `/public/manifest.json` not yet created.

## Coding conventions

- All page files are `'use client'` (heavy interactivity throughout)
- Component names are PascalCase; helper functions are camelCase
- No external UI component libraries — build with native elements + CSS variables
- Modals use the shared `<Modal>` component (bottom-sheet on mobile)
- Forms are plain `<form onSubmit>` — no form libraries
- Date formatting always uses `date-fns` — never `new Date().toLocaleDateString()`
- Progress calculation helpers live in `utils.ts` (`getGoalProgress`, `getTodayGoalProgress`, `getWeekGoalProgress`)
