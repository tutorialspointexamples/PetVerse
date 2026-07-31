export interface EventDef {
  id: string
  name: string
  blurb: string
  /** Inclusive local-date range as YYYY-MM-DD */
  start: string
  end: string
  loginBonus: number
  shopColorBonus?: string
}

/** Time-boxed seasonal packs (local clock), aligned to live MTT2-style cadence. */
export const EVENTS: EventDef[] = [
  {
    id: 'summer-splash-2026',
    name: 'Summer Splash',
    blurb: 'Beach vibes and a daily coin splash.',
    start: '2026-06-01',
    end: '2026-08-31',
    loginBonus: 20,
    shopColorBonus: 'sky',
  },
  {
    id: 'brush-time-2026',
    name: 'Brush Time',
    blurb: 'Daily brush bonus — keep those pearly fangs shining.',
    start: '2026-07-28',
    end: '2026-08-04',
    loginBonus: 25,
    shopColorBonus: 'snow',
  },
  {
    id: 'enter-if-you-dare-2026',
    name: 'Enter If You Dare',
    blurb: 'Spooky login coins and a charcoal style unlock.',
    start: '2026-08-05',
    end: '2026-08-20',
    loginBonus: 30,
    shopColorBonus: 'charcoal',
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
