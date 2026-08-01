export type EventActivityKind = 'brush' | 'play' | 'feed' | 'bath'

export interface EventDef {
  id: string
  name: string
  blurb: string
  /** Inclusive local-date range as YYYY-MM-DD */
  start: string
  end: string
  loginBonus: number
  shopColorBonus?: string
  hatBonus?: string
  /** Optional daily seasonal mini-activity beyond login claim. */
  activityKind?: EventActivityKind
  activityBonus?: number
  activityLabel?: string
}

/** Time-boxed seasonal packs (local clock), aligned to live MTT2-style cadence. */
export const EVENTS: EventDef[] = [
  {
    id: 'new-year-sparkle-2026',
    name: 'New Year Sparkle',
    blurb: 'Start the year with shiny coins and a party look.',
    start: '2026-01-01',
    end: '2026-01-10',
    loginBonus: 35,
    shopColorBonus: 'ivory',
    hatBonus: 'party',
    activityKind: 'play',
    activityBonus: 12,
    activityLabel: 'Party play bonus',
  },
  {
    id: 'valentine-paws-2026',
    name: 'Valentine Paws',
    blurb: 'Sweet login coins and a rose coat unlock.',
    start: '2026-02-10',
    end: '2026-02-16',
    loginBonus: 28,
    shopColorBonus: 'rose',
    hatBonus: 'bow',
    activityKind: 'feed',
    activityBonus: 14,
    activityLabel: 'Share a sweet snack',
  },
  {
    id: 'spring-bloom-2026',
    name: 'Spring Bloom',
    blurb: 'Fresh air, fresh coins, mint vibes.',
    start: '2026-03-20',
    end: '2026-04-05',
    loginBonus: 22,
    shopColorBonus: 'mint',
    hatBonus: 'flower',
    activityKind: 'bath',
    activityBonus: 12,
    activityLabel: 'Spring splash bath',
  },
  {
    id: 'summer-splash-2026',
    name: 'Summer Splash',
    blurb: 'Beach vibes and a daily coin splash.',
    start: '2026-06-01',
    end: '2026-08-31',
    loginBonus: 20,
    shopColorBonus: 'sky',
    activityKind: 'play',
    activityBonus: 12,
    activityLabel: 'Beach play bonus',
  },
  {
    id: 'brush-time-2026',
    name: 'Brush Time',
    blurb: 'Daily brush bonus — keep those pearly fangs shining.',
    start: '2026-07-28',
    end: '2026-08-04',
    loginBonus: 25,
    shopColorBonus: 'snow',
    activityKind: 'brush',
    activityBonus: 18,
    activityLabel: 'Brush for bonus coins',
  },
  {
    id: 'enter-if-you-dare-2026',
    name: 'Enter If You Dare',
    blurb: 'Spooky login coins and a charcoal style unlock.',
    start: '2026-08-05',
    end: '2026-08-20',
    loginBonus: 30,
    shopColorBonus: 'charcoal',
    hatBonus: 'wizard',
    activityKind: 'play',
    activityBonus: 16,
    activityLabel: 'Spooky play dare',
  },
  {
    id: 'harvest-howl-2026',
    name: 'Harvest Howl',
    blurb: 'Autumn login coins and amber style.',
    start: '2026-10-01',
    end: '2026-10-20',
    loginBonus: 26,
    shopColorBonus: 'amber',
    hatBonus: 'cowboy',
    activityKind: 'feed',
    activityBonus: 14,
    activityLabel: 'Harvest snack bonus',
  },
  {
    id: 'holiday-hugs-2026',
    name: 'Holiday Hugs',
    blurb: 'Cozy coins and a holiday cap unlock.',
    start: '2026-12-15',
    end: '2026-12-31',
    loginBonus: 40,
    shopColorBonus: 'coral',
    hatBonus: 'santa',
    activityKind: 'play',
    activityBonus: 20,
    activityLabel: 'Holiday hug play',
  },
]

function todayKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function getActiveEvent(now = new Date()): EventDef | null {
  const key = todayKey(now)
  // Prefer the most specific / latest overlapping event
  const active = EVENTS.filter((e) => key >= e.start && key <= e.end)
  return active[active.length - 1] ?? null
}
