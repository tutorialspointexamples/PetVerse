import { create } from 'zustand'
import {
  applyCare,
  applyDecay,
  CARE_EFFECTS,
  deriveMood,
  type CareAction,
  type Mood,
} from '../game/needs'
import type {
  BodyColorId,
  GlassesId,
  HatId,
  ScarfId,
  ShirtId,
} from '../game/cosmetics'
import {
  getBodyColor,
  getGlasses,
  getHat,
  getScarf,
  getShirt,
} from '../game/cosmetics'
import type { FurnitureId } from '../game/furniture'
import { getFurniture } from '../game/furniture'
import type { WorldId } from '../game/worlds'
import { getWorld } from '../game/worlds'
import type { CompanionId, SkillId } from '../game/progress'
import { getCompanion, getSkill, levelFromXp } from '../game/progress'
import { getActiveEvent } from '../game/events'
import { defaultSave, loadSave, writeSave, type SaveData } from './save'

export type Reaction =
  | 'idle'
  | 'laugh'
  | 'annoyed'
  | 'eat'
  | 'bath'
  | 'brush'
  | 'potty'
  | 'sleep'
  | 'talk'
  | 'play'
  | 'skill_drums'
  | 'skill_hoop'
  | 'skill_boxing'

export type Overlay =
  | 'none'
  | 'shop'
  | 'games'
  | 'travel'
  | 'skills'
  | 'companions'
  | 'event'
  | 'skyDash'
  | 'dunkToss'
  | 'spaceTrails'
  | 'buildPlane'
  | 'worldVisit'
  | 'rewarded'

const MINIGAME_OVERLAYS: Overlay[] = ['skyDash', 'dunkToss', 'spaceTrails', 'buildPlane']

export interface GameState extends SaveData {
  reaction: Reaction
  cooldowns: Partial<Record<CareAction, number>>
  overlay: Overlay
  micError: string | null
  talking: boolean
  activeWorld: WorldId | null
  lastMinigameReward: number
  hydrate: () => void
  save: () => void
  setPetName: (name: string) => void
  tick: (dtSec: number) => void
  doCare: (action: CareAction) => boolean
  setReaction: (reaction: Reaction) => void
  poke: (zone: 'head' | 'belly') => void
  pokeCompanion: () => void
  setTalking: (talking: boolean) => void
  setMicError: (error: string | null) => void
  setOverlay: (overlay: Overlay) => void
  buyColor: (id: BodyColorId) => boolean
  buyHat: (id: HatId) => boolean
  buyGlasses: (id: GlassesId) => boolean
  buyScarf: (id: ScarfId) => boolean
  buyShirt: (id: ShirtId) => boolean
  buyFurniture: (id: FurnitureId) => boolean
  togglePlaceFurniture: (id: FurnitureId) => void
  addCoins: (n: number) => void
  addFuel: (n: number) => void
  addXp: (n: number) => void
  travelTo: (id: WorldId) => boolean
  clearWorldVisit: () => void
  unlockCompanion: (id: CompanionId) => boolean
  setCompanion: (id: CompanionId) => void
  practiceSkill: (id: SkillId) => boolean
  claimEventBonus: () => boolean
  grantMinigameReward: (coins: number, fuel?: number) => void
  applyRewardedBoost: () => void
  level: () => number
  mood: () => Mood
  shopOpen: boolean
  toggleShop: () => void
}

function sliceSave(state: GameState): SaveData {
  const {
    petName,
    named,
    needs,
    coins,
    stars,
    fuel,
    xp,
    bodyColor,
    hat,
    glasses,
    scarf,
    shirt,
    ownedColors,
    ownedHats,
    ownedGlasses,
    ownedScarves,
    ownedShirts,
    ownedFurniture,
    placedFurniture,
    visitedWorlds,
    companion,
    ownedCompanions,
    unlockedSkills,
    eventClaimDate,
    claimedEventIds,
    sleeping,
  } = state
  return {
    petName,
    named,
    needs,
    coins,
    stars,
    fuel,
    xp,
    bodyColor,
    hat,
    glasses,
    scarf,
    shirt,
    ownedColors,
    ownedHats,
    ownedGlasses,
    ownedScarves,
    ownedShirts,
    ownedFurniture,
    placedFurniture,
    visitedWorlds,
    companion,
    ownedCompanions,
    unlockedSkills,
    eventClaimDate,
    claimedEventIds,
    sleeping,
    lastSavedAt: Date.now(),
  }
}

function buyOwned<T extends string>(
  get: () => GameState,
  set: (p: Partial<GameState>) => void,
  ownedKey: keyof SaveData,
  equipKey: keyof SaveData,
  id: T,
  price: number,
): boolean {
  const state = get()
  const owned = state[ownedKey] as T[]
  if (owned.includes(id)) {
    set({ [equipKey]: id } as Partial<GameState>)
    get().save()
    return true
  }
  if (state.coins < price) return false
  set({
    coins: state.coins - price,
    [ownedKey]: [...owned, id],
    [equipKey]: id,
  } as Partial<GameState>)
  get().save()
  return true
}

export const useGameStore = create<GameState>((set, get) => ({
  ...defaultSave(),
  reaction: 'idle',
  cooldowns: {},
  overlay: 'none',
  micError: null,
  talking: false,
  activeWorld: null,
  lastMinigameReward: 0,
  shopOpen: false,

  hydrate: () => {
    const data = loadSave()
    set({ ...data, overlay: 'none', reaction: data.sleeping ? 'sleep' : 'idle' })
  },

  save: () => writeSave(sliceSave(get())),

  setPetName: (name) => {
    const trimmed = name.trim().slice(0, 16)
    if (!trimmed) return
    set({ petName: trimmed, named: true })
    get().save()
  },

  tick: (dtSec) => {
    const { needs, sleeping, cooldowns, overlay } = get()
    if (MINIGAME_OVERLAYS.includes(overlay)) return
    const nextNeeds = applyDecay(needs, dtSec, sleeping)
    const now = Date.now()
    const nextCooldowns: Partial<Record<CareAction, number>> = {}
    for (const [key, until] of Object.entries(cooldowns)) {
      if (until && until > now) nextCooldowns[key as CareAction] = until
    }
    set({ needs: nextNeeds, cooldowns: nextCooldowns })
  },

  doCare: (action) => {
    const state = get()
    const now = Date.now()
    const until = state.cooldowns[action]
    if (until && until > now) return false
    const effect = CARE_EFFECTS[action]

    if (action === 'sleep') {
      const sleeping = !state.sleeping
      set({
        sleeping,
        reaction: sleeping ? 'sleep' : 'idle',
        coins: state.coins + effect.coins,
        fuel: state.fuel + (sleeping ? 0 : 1),
        xp: state.xp + 2,
        cooldowns: { ...state.cooldowns, sleep: now + effect.cooldownMs },
      })
      get().save()
      return true
    }

    const reactionMap: Record<Exclude<CareAction, 'sleep'>, Reaction> = {
      feed: 'eat',
      bath: 'bath',
      play: 'play',
      brush: 'brush',
      potty: 'potty',
    }

    set({
      needs: applyCare(state.needs, action),
      coins: state.coins + effect.coins,
      fuel: Math.min(20, state.fuel + (action === 'play' ? 1 : 0)),
      xp: state.xp + 3,
      reaction: reactionMap[action],
      cooldowns: { ...state.cooldowns, [action]: now + effect.cooldownMs },
      sleeping: false,
    })
    get().save()
    window.setTimeout(() => {
      if (get().reaction === reactionMap[action]) set({ reaction: 'idle' })
    }, 1200)
    return true
  },

  setReaction: (reaction) => set({ reaction }),

  poke: (zone) => {
    const state = get()
    const reaction: Reaction = state.sleeping || zone === 'belly' ? 'annoyed' : 'laugh'
    set({
      sleeping: false,
      reaction,
      needs: applyCare(state.needs, 'play'),
      coins: state.coins + 1,
      xp: state.xp + 1,
    })
    get().save()
    window.setTimeout(() => {
      if (get().reaction === 'laugh' || get().reaction === 'annoyed') {
        set({ reaction: get().sleeping ? 'sleep' : 'idle' })
      }
    }, 900)
  },

  pokeCompanion: () => {
    const state = get()
    if (state.companion === 'none') return
    set({
      needs: {
        ...state.needs,
        happiness: Math.min(100, state.needs.happiness + 8),
      },
      coins: state.coins + 2,
    })
    get().save()
  },

  setTalking: (talking) => {
    set({ talking, reaction: talking ? 'talk' : get().sleeping ? 'sleep' : 'idle' })
  },

  setMicError: (error) => set({ micError: error }),

  setOverlay: (overlay) => set({ overlay, shopOpen: overlay === 'shop' }),

  toggleShop: () => {
    const open = get().overlay !== 'shop'
    set({ overlay: open ? 'shop' : 'none', shopOpen: open })
  },

  buyColor: (id) => buyOwned(get, set, 'ownedColors', 'bodyColor', id, getBodyColor(id).price),
  buyHat: (id) => buyOwned(get, set, 'ownedHats', 'hat', id, getHat(id).price),
  buyGlasses: (id) => buyOwned(get, set, 'ownedGlasses', 'glasses', id, getGlasses(id).price),
  buyScarf: (id) => buyOwned(get, set, 'ownedScarves', 'scarf', id, getScarf(id).price),
  buyShirt: (id) => buyOwned(get, set, 'ownedShirts', 'shirt', id, getShirt(id).price),

  buyFurniture: (id) => {
    const state = get()
    if (state.ownedFurniture.includes(id)) {
      get().togglePlaceFurniture(id)
      return true
    }
    const item = getFurniture(id)
    if (state.coins < item.price) return false
    set({
      coins: state.coins - item.price,
      ownedFurniture: [...state.ownedFurniture, id],
      placedFurniture: [...state.placedFurniture, id],
    })
    get().save()
    return true
  },

  togglePlaceFurniture: (id) => {
    const state = get()
    if (!state.ownedFurniture.includes(id)) return
    const placed = state.placedFurniture.includes(id)
      ? state.placedFurniture.filter((f) => f !== id)
      : [...state.placedFurniture, id]
    set({ placedFurniture: placed })
    get().save()
  },

  addCoins: (n) => {
    set({ coins: get().coins + n })
    get().save()
  },

  addFuel: (n) => {
    set({ fuel: Math.min(20, get().fuel + n) })
    get().save()
  },

  addXp: (n) => {
    set({ xp: get().xp + n })
    get().save()
  },

  travelTo: (id) => {
    const state = get()
    const world = getWorld(id)
    if (state.fuel < world.fuelCost) return false
    const visited = state.visitedWorlds.includes(id)
      ? state.visitedWorlds
      : [...state.visitedWorlds, id]
    let ownedFurniture = state.ownedFurniture
    let ownedHats = state.ownedHats
    if (world.unlockFurniture && !ownedFurniture.includes(world.unlockFurniture as FurnitureId)) {
      ownedFurniture = [...ownedFurniture, world.unlockFurniture as FurnitureId]
    }
    if (world.unlockHat && !ownedHats.includes(world.unlockHat as HatId)) {
      ownedHats = [...ownedHats, world.unlockHat as HatId]
    }
    set({
      fuel: state.fuel - world.fuelCost,
      coins: state.coins + world.rewardCoins,
      stars: state.stars + 1,
      xp: state.xp + 15,
      visitedWorlds: visited,
      ownedFurniture,
      ownedHats,
      activeWorld: id,
      overlay: 'worldVisit',
    })
    get().save()
    return true
  },

  clearWorldVisit: () => set({ activeWorld: null, overlay: 'none' }),

  unlockCompanion: (id) => {
    const state = get()
    if (state.ownedCompanions.includes(id)) {
      set({ companion: id })
      get().save()
      return true
    }
    const def = getCompanion(id)
    if (state.coins < def.unlockCost) return false
    set({
      coins: state.coins - def.unlockCost,
      ownedCompanions: [...state.ownedCompanions, id],
      companion: id,
    })
    get().save()
    return true
  },

  setCompanion: (id) => {
    if (!get().ownedCompanions.includes(id)) return
    set({ companion: id })
    get().save()
  },

  practiceSkill: (id) => {
    const state = get()
    const level = levelFromXp(state.xp)
    const skill = getSkill(id)
    if (level < skill.unlockLevel) return false
    const unlocked = state.unlockedSkills.includes(id)
      ? state.unlockedSkills
      : [...state.unlockedSkills, id]
    const reactionMap: Record<SkillId, Reaction> = {
      drums: 'skill_drums',
      hoop: 'skill_hoop',
      boxing: 'skill_boxing',
    }
    set({
      unlockedSkills: unlocked,
      coins: state.coins + skill.coinReward,
      xp: state.xp + skill.xpReward,
      reaction: reactionMap[id],
      needs: {
        ...state.needs,
        happiness: Math.min(100, state.needs.happiness + 10),
        energy: Math.max(0, state.needs.energy - 5),
      },
    })
    get().save()
    window.setTimeout(() => {
      if (get().reaction === reactionMap[id]) set({ reaction: 'idle' })
    }, 1400)
    return true
  },

  claimEventBonus: () => {
    const event = getActiveEvent()
    if (!event) return false
    const today = new Date().toISOString().slice(0, 10)
    const state = get()
    if (state.eventClaimDate === today) return false
    const claimed = state.claimedEventIds.includes(event.id)
      ? state.claimedEventIds
      : [...state.claimedEventIds, event.id]
    let ownedColors = state.ownedColors
    if (event.shopColorBonus && !ownedColors.includes(event.shopColorBonus as BodyColorId)) {
      ownedColors = [...ownedColors, event.shopColorBonus as BodyColorId]
    }
    set({
      coins: state.coins + event.loginBonus,
      eventClaimDate: today,
      claimedEventIds: claimed,
      ownedColors,
      overlay: 'none',
    })
    get().save()
    return true
  },

  grantMinigameReward: (coins, fuel = 1) => {
    const state = get()
    set({
      coins: state.coins + coins,
      fuel: Math.min(20, state.fuel + fuel),
      stars: state.stars + (coins >= 15 ? 1 : 0),
      xp: state.xp + Math.max(5, Math.floor(coins / 2)),
      lastMinigameReward: coins,
      overlay: 'none',
    })
    get().save()
  },

  applyRewardedBoost: () => {
    set({
      coins: get().coins + 15,
      fuel: Math.min(20, get().fuel + 2),
      overlay: 'none',
    })
    get().save()
  },

  level: () => levelFromXp(get().xp),
  mood: () => deriveMood(get().needs),
}))
