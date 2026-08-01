import type { CompanionId } from './progress'
import { clampNeed } from './needs'

export type CompanionCareNeeds = {
  hunger: number
  happiness: number
}

export type CompanionCareMap = Partial<Record<Exclude<CompanionId, 'none'>, CompanionCareNeeds>>

export const DEFAULT_COMPANION_CARE: CompanionCareNeeds = {
  hunger: 72,
  happiness: 68,
}

/** Decay per second while a companion is equipped. */
export const COMPANION_DECAY = {
  hunger: 0.1,
  happiness: 0.08,
}

export function defaultCompanionCareMap(): CompanionCareMap {
  return {}
}

export function getCompanionCare(
  map: CompanionCareMap,
  id: CompanionId,
): CompanionCareNeeds {
  if (id === 'none') return { ...DEFAULT_COMPANION_CARE }
  return { ...DEFAULT_COMPANION_CARE, ...map[id] }
}

export function decayCompanionCare(
  care: CompanionCareNeeds,
  dtSec: number,
): CompanionCareNeeds {
  return {
    hunger: clampNeed(care.hunger - COMPANION_DECAY.hunger * dtSec),
    happiness: clampNeed(care.happiness - COMPANION_DECAY.happiness * dtSec),
  }
}

export function withCompanionCare(
  map: CompanionCareMap,
  id: CompanionId,
  patch: Partial<CompanionCareNeeds>,
): CompanionCareMap {
  if (id === 'none') return map
  const cur = getCompanionCare(map, id)
  return {
    ...map,
    [id]: {
      hunger: clampNeed(cur.hunger + (patch.hunger ?? 0)),
      happiness: clampNeed(cur.happiness + (patch.happiness ?? 0)),
    },
  }
}
