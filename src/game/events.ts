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

/** Time-boxed seasonal pack (local clock). */
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
]

function todayKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function getActiveEvent(now = new Date()): EventDef | null {
  const key = todayKey(now)
  return EVENTS.find((e) => key >= e.start && key <= e.end) ?? null
}
