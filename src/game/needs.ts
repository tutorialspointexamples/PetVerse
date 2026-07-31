export type NeedKey = 'hunger' | 'energy' | 'happiness' | 'cleanliness'

export type Needs = Record<NeedKey, number>

export type CareAction = 'feed' | 'sleep' | 'bath' | 'play' | 'brush' | 'potty'

export const NEED_KEYS: NeedKey[] = ['hunger', 'energy', 'happiness', 'cleanliness']

export const NEED_LABELS: Record<NeedKey, string> = {
  hunger: 'Hunger',
  energy: 'Energy',
  happiness: 'Happiness',
  cleanliness: 'Clean',
}

/** Decay per second while awake (tab open). Tuned for longer play sessions. */
export const DECAY_PER_SEC: Needs = {
  hunger: 0.18,
  energy: 0.12,
  happiness: 0.15,
  cleanliness: 0.1,
}

/** Slower decay while sleeping; energy recovers. */
export const SLEEP_DECAY_PER_SEC: Needs = {
  hunger: 0.12,
  energy: -1.2,
  happiness: 0.05,
  cleanliness: 0.04,
}

export const CARE_EFFECTS: Record<
  CareAction,
  Partial<Needs> & { coins: number; cooldownMs: number }
> = {
  feed: { hunger: 28, happiness: 6, coins: 4, cooldownMs: 2500 },
  sleep: { energy: 0, coins: 2, cooldownMs: 1500 },
  bath: { cleanliness: 35, happiness: 8, coins: 5, cooldownMs: 4000 },
  play: { happiness: 22, energy: -8, hunger: -5, coins: 6, cooldownMs: 2000 },
  brush: { cleanliness: 18, happiness: 10, coins: 4, cooldownMs: 3000 },
  potty: { cleanliness: 22, happiness: 6, hunger: -3, coins: 3, cooldownMs: 3500 },
}

export function clampNeed(value: number): number {
  return Math.max(0, Math.min(100, value))
}

export function applyDecay(needs: Needs, dtSec: number, sleeping: boolean): Needs {
  const rates = sleeping ? SLEEP_DECAY_PER_SEC : DECAY_PER_SEC
  return {
    hunger: clampNeed(needs.hunger - rates.hunger * dtSec),
    energy: clampNeed(needs.energy - rates.energy * dtSec),
    happiness: clampNeed(needs.happiness - rates.happiness * dtSec),
    cleanliness: clampNeed(needs.cleanliness - rates.cleanliness * dtSec),
  }
}

export function applyCare(needs: Needs, action: CareAction): Needs {
  const effect = CARE_EFFECTS[action]
  return {
    hunger: clampNeed(needs.hunger + (effect.hunger ?? 0)),
    energy: clampNeed(needs.energy + (effect.energy ?? 0)),
    happiness: clampNeed(needs.happiness + (effect.happiness ?? 0)),
    cleanliness: clampNeed(needs.cleanliness + (effect.cleanliness ?? 0)),
  }
}

export type Mood = 'happy' | 'okay' | 'hungry' | 'tired' | 'dirty' | 'sad'

export function deriveMood(needs: Needs): Mood {
  if (needs.energy < 25) return 'tired'
  if (needs.hunger < 25) return 'hungry'
  if (needs.cleanliness < 25) return 'dirty'
  if (needs.happiness < 30) return 'sad'
  if (needs.happiness > 70 && needs.hunger > 50 && needs.energy > 50) return 'happy'
  return 'okay'
}

export const DEFAULT_NEEDS: Needs = {
  hunger: 72,
  energy: 80,
  happiness: 68,
  cleanliness: 75,
}
