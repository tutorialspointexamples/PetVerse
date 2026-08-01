/** Daily goals mirroring MTT2-style care / play loops. */

export type MissionKind =
  | 'feed'
  | 'bath'
  | 'brush'
  | 'play'
  | 'minigame'
  | 'travel'
  | 'skill'
  | 'poke'
  | 'cure'

export interface MissionDef {
  id: string
  kind: MissionKind
  target: number
  rewardCoins: number
  rewardFuel: number
  label: string
}

const POOL: MissionDef[] = [
  { id: 'feed3', kind: 'feed', target: 3, rewardCoins: 25, rewardFuel: 1, label: 'Feed your pet 3 times' },
  { id: 'bath2', kind: 'bath', target: 2, rewardCoins: 20, rewardFuel: 1, label: 'Give 2 baths' },
  { id: 'brush2', kind: 'brush', target: 2, rewardCoins: 18, rewardFuel: 0, label: 'Brush teeth twice' },
  { id: 'play3', kind: 'play', target: 3, rewardCoins: 22, rewardFuel: 1, label: 'Play together 3 times' },
  { id: 'cure1', kind: 'cure', target: 1, rewardCoins: 24, rewardFuel: 1, label: 'Use the medicine cabinet once' },
  { id: 'game1', kind: 'minigame', target: 1, rewardCoins: 30, rewardFuel: 2, label: 'Finish 1 mini-game' },
  { id: 'game2', kind: 'minigame', target: 2, rewardCoins: 45, rewardFuel: 2, label: 'Win 2 mini-games' },
  { id: 'travel1', kind: 'travel', target: 1, rewardCoins: 35, rewardFuel: 0, label: 'Fly to any world' },
  { id: 'skill1', kind: 'skill', target: 1, rewardCoins: 28, rewardFuel: 1, label: 'Practice a skill' },
  { id: 'poke5', kind: 'poke', target: 5, rewardCoins: 15, rewardFuel: 0, label: 'Poke your pet 5 times' },
]

/** Local calendar day key (avoids UTC midnight drift vs seasonal events). */
export function localDayKey(now = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Deterministic 3-mission set for a calendar day. */
export function missionsForDay(date = localDayKey()): MissionDef[] {
  let hash = 0
  for (let i = 0; i < date.length; i++) hash = (hash * 31 + date.charCodeAt(i)) >>> 0
  const picks: MissionDef[] = []
  const used = new Set<number>()
  let cursor = hash
  while (picks.length < 3 && used.size < POOL.length) {
    const idx = cursor % POOL.length
    cursor = (cursor * 1103515245 + 12345) >>> 0
    if (used.has(idx)) continue
    used.add(idx)
    picks.push(POOL[idx])
  }
  return picks
}

export function todayKey(): string {
  return localDayKey()
}

export function emptyMissionProgress(): Record<string, number> {
  return {}
}
