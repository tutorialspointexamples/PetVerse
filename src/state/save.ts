import type { Needs } from '../game/needs'
import type {
  BodyColorId,
  GlassesId,
  HatId,
  ScarfId,
  ShirtId,
} from '../game/cosmetics'
import type { FurnitureId } from '../game/furniture'
import type { WorldId } from '../game/worlds'
import type { CompanionId, SkillId } from '../game/progress'
import type { RoomId } from '../game/rooms'
import type { FoodId } from '../game/foods'
import { DEFAULT_NEEDS } from '../game/needs'

const SAVE_KEY = 'petverse-save-v3'

export interface SaveData {
  petName: string
  named: boolean
  needs: Needs
  coins: number
  stars: number
  fuel: number
  xp: number
  bodyColor: BodyColorId
  hat: HatId
  glasses: GlassesId
  scarf: ScarfId
  shirt: ShirtId
  ownedColors: BodyColorId[]
  ownedHats: HatId[]
  ownedGlasses: GlassesId[]
  ownedScarves: ScarfId[]
  ownedShirts: ShirtId[]
  ownedFurniture: FurnitureId[]
  placedFurniture: FurnitureId[]
  visitedWorlds: WorldId[]
  companion: CompanionId
  ownedCompanions: CompanionId[]
  unlockedSkills: SkillId[]
  eventClaimDate: string | null
  claimedEventIds: string[]
  sleeping: boolean
  room: RoomId
  favoriteFood: FoodId
  lastSavedAt: number
}

export function defaultSave(): SaveData {
  return {
    petName: '',
    named: false,
    needs: { ...DEFAULT_NEEDS },
    coins: 80,
    stars: 0,
    fuel: 5,
    xp: 0,
    bodyColor: 'ginger',
    hat: 'none',
    glasses: 'none',
    scarf: 'none',
    shirt: 'none',
    ownedColors: ['ginger'],
    ownedHats: ['none'],
    ownedGlasses: ['none'],
    ownedScarves: ['none'],
    ownedShirts: ['none'],
    ownedFurniture: ['rug_basic'],
    placedFurniture: ['rug_basic'],
    visitedWorlds: [],
    companion: 'none',
    ownedCompanions: ['none'],
    unlockedSkills: ['drums'],
    eventClaimDate: null,
    claimedEventIds: [],
    sleeping: false,
    room: 'living',
    favoriteFood: 'kibble',
    lastSavedAt: Date.now(),
  }
}

export function loadSave(): SaveData {
  try {
    const raw =
      localStorage.getItem(SAVE_KEY) ??
      localStorage.getItem('petverse-save-v2') ??
      localStorage.getItem('petverse-save-v1')
    if (!raw) return defaultSave()
    const parsed = JSON.parse(raw) as Partial<SaveData>
    const base = defaultSave()
    return {
      ...base,
      ...parsed,
      needs: { ...base.needs, ...parsed.needs },
      ownedColors: parsed.ownedColors?.length ? parsed.ownedColors : base.ownedColors,
      ownedHats: parsed.ownedHats?.length ? parsed.ownedHats : base.ownedHats,
      ownedGlasses: parsed.ownedGlasses?.length ? parsed.ownedGlasses : base.ownedGlasses,
      ownedScarves: parsed.ownedScarves?.length ? parsed.ownedScarves : base.ownedScarves,
      ownedShirts: parsed.ownedShirts?.length ? parsed.ownedShirts : base.ownedShirts,
      ownedFurniture: parsed.ownedFurniture?.length ? parsed.ownedFurniture : base.ownedFurniture,
      placedFurniture: parsed.placedFurniture?.length ? parsed.placedFurniture : base.placedFurniture,
      visitedWorlds: parsed.visitedWorlds ?? base.visitedWorlds,
      ownedCompanions: parsed.ownedCompanions?.length ? parsed.ownedCompanions : base.ownedCompanions,
      unlockedSkills: parsed.unlockedSkills?.length ? parsed.unlockedSkills : base.unlockedSkills,
      claimedEventIds: parsed.claimedEventIds ?? base.claimedEventIds,
      room: parsed.room ?? base.room,
      favoriteFood: parsed.favoriteFood ?? base.favoriteFood,
    }
  } catch {
    return defaultSave()
  }
}

export function writeSave(data: SaveData): void {
  const payload: SaveData = { ...data, lastSavedAt: Date.now() }
  localStorage.setItem(SAVE_KEY, JSON.stringify(payload))
}
