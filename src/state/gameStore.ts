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
  ShoesId,
} from '../game/cosmetics'
import {
  getBodyColor,
  getGlasses,
  getHat,
  getScarf,
  getShirt,
  getShoes,
} from '../game/cosmetics'
import { playCompanionVoice } from '../audio/companionVoice'
import type { FurnitureId } from '../game/furniture'
import { getFurniture } from '../game/furniture'
import type { WorldId } from '../game/worlds'
import { getWorld, getWorldSpots } from '../game/worlds'
import type { CompanionId, SkillId } from '../game/progress'
import { getCompanion, getSkill, levelFromXp } from '../game/progress'
import { getActiveEvent } from '../game/events'
import type { RoomId } from '../game/rooms'
import type { FoodId } from '../game/foods'
import { getFood } from '../game/foods'
import { clampNeed } from '../game/needs'
import {
  getCardSet,
  MINIGAME_CARDS,
  setProgress,
  WORLD_CARDS,
  type CardId,
  type CardSetId,
} from '../game/cards'
import {
  emptyMissionProgress,
  missionsForDay,
  todayKey,
  type MissionKind,
} from '../game/missions'
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
  | 'flight'
  | 'food'
  | 'rooms'
  | 'cards'
  | 'rewarded'
  | 'lang'
  | 'photo'
  | 'missions'

const MINIGAME_OVERLAYS: Overlay[] = ['skyDash', 'dunkToss', 'spaceTrails', 'buildPlane']

export interface GameState extends SaveData {
  reaction: Reaction
  cooldowns: Partial<Record<CareAction, number>>
  overlay: Overlay
  micError: string | null
  talking: boolean
  activeWorld: WorldId | null
  /** Spot ids collected during the current world visit (session-only). */
  worldVisitCollected: string[]
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
  buyShoes: (id: ShoesId) => boolean
  buyFurniture: (id: FurnitureId) => boolean
  togglePlaceFurniture: (id: FurnitureId) => void
  addCoins: (n: number) => void
  addFuel: (n: number) => void
  addXp: (n: number) => void
  travelTo: (id: WorldId) => boolean
  finishFlight: () => void
  collectWorldSpot: (spotId: string) => boolean
  clearWorldVisit: () => void
  unlockCompanion: (id: CompanionId) => boolean
  setCompanion: (id: CompanionId) => void
  practiceSkill: (id: SkillId) => boolean
  claimEventBonus: () => boolean
  doEventActivity: () => boolean
  grantMinigameReward: (coins: number, fuel?: number, keepOpen?: boolean) => void
  applyRewardedBoost: () => void
  setRoom: (id: RoomId) => void
  feedFood: (id: FoodId) => boolean
  collectCard: (id: CardId) => boolean
  claimCardSet: (id: CardSetId) => boolean
  playWithCompanion: () => boolean
  trackMission: (kind: MissionKind, amount?: number) => void
  claimMission: (id: string) => boolean
  ensureMissions: () => void
  level: () => number
  mood: () => Mood
  shopOpen: boolean
  toggleShop: () => void
  companionPlayUntil: number
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
    shoes,
    ownedColors,
    ownedHats,
    ownedGlasses,
    ownedScarves,
    ownedShirts,
    ownedShoes,
    ownedFurniture,
    placedFurniture,
    visitedWorlds,
    companion,
    ownedCompanions,
    unlockedSkills,
    eventClaimDate,
    claimedEventIds,
    eventActivityDate,
    sleeping,
    room,
    favoriteFood,
    ownedCards,
    claimedCardSets,
    missionDate,
    missionProgress,
    claimedMissions,
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
    shoes,
    ownedColors,
    ownedHats,
    ownedGlasses,
    ownedScarves,
    ownedShirts,
    ownedShoes,
    ownedFurniture,
    placedFurniture,
    visitedWorlds,
    companion,
    ownedCompanions,
    unlockedSkills,
    eventClaimDate,
    claimedEventIds,
    eventActivityDate,
    sleeping,
    room,
    favoriteFood,
    ownedCards,
    claimedCardSets,
    missionDate,
    missionProgress,
    claimedMissions,
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
  worldVisitCollected: [],
  lastMinigameReward: 0,
  shopOpen: false,
  companionPlayUntil: 0,

  hydrate: () => {
    const data = loadSave()
    set({ ...data, overlay: 'none', reaction: data.sleeping ? 'sleep' : 'idle' })
    get().ensureMissions()
  },

  ensureMissions: () => {
    const today = todayKey()
    const state = get()
    if (state.missionDate === today) return
    set({
      missionDate: today,
      missionProgress: emptyMissionProgress(),
      claimedMissions: [],
    })
    get().save()
  },

  trackMission: (kind, amount = 1) => {
    get().ensureMissions()
    const state = get()
    const today = todayKey()
    const defs = missionsForDay(today)
    const progress = { ...state.missionProgress }
    let changed = false
    for (const m of defs) {
      if (m.kind !== kind) continue
      if (state.claimedMissions.includes(m.id)) continue
      const prev = progress[m.id] ?? 0
      if (prev >= m.target) continue
      progress[m.id] = Math.min(m.target, prev + amount)
      changed = true
    }
    if (!changed) return
    set({ missionProgress: progress })
    get().save()
  },

  claimMission: (id) => {
    get().ensureMissions()
    const state = get()
    const today = todayKey()
    const def = missionsForDay(today).find((m) => m.id === id)
    if (!def) return false
    if (state.claimedMissions.includes(id)) return false
    const progress = state.missionProgress[id] ?? 0
    if (progress < def.target) return false
    const claimedMissions = [...state.claimedMissions, id]
    const ownedCards = state.ownedCards.includes('mission_ribbon')
      ? state.ownedCards
      : [...state.ownedCards, 'mission_ribbon' as CardId]
    set({
      coins: state.coins + def.rewardCoins,
      fuel: Math.min(20, state.fuel + def.rewardFuel),
      xp: state.xp + 8,
      claimedMissions,
      ownedCards,
    })
    get().save()
    return true
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

    const nextXp = state.xp + 3
    let ownedCards = state.ownedCards
    if (action === 'brush' && !ownedCards.includes('brush_sparkle')) {
      ownedCards = [...ownedCards, 'brush_sparkle']
    }
    if (nextXp >= 120 && !ownedCards.includes('golden_paw')) {
      ownedCards = [...ownedCards, 'golden_paw']
    }
    if (nextXp >= 200 && !ownedCards.includes('midnight_star')) {
      ownedCards = [...ownedCards, 'midnight_star']
    }
    set({
      needs: applyCare(state.needs, action),
      coins: state.coins + effect.coins,
      fuel: Math.min(20, state.fuel + (action === 'play' ? 1 : 0)),
      xp: nextXp,
      reaction: reactionMap[action],
      cooldowns: { ...state.cooldowns, [action]: now + effect.cooldownMs },
      sleeping: false,
      ownedCards,
    })
    get().save()
    if (action === 'feed' || action === 'bath' || action === 'play' || action === 'brush') {
      get().trackMission(action)
    }
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
    get().trackMission('poke')
    window.setTimeout(() => {
      if (get().reaction === 'laugh' || get().reaction === 'annoyed') {
        set({ reaction: get().sleeping ? 'sleep' : 'idle' })
      }
    }, 1600)
  },

  pokeCompanion: () => {
    const state = get()
    if (state.companion === 'none') return
    playCompanionVoice(state.companion)
    set({
      needs: {
        ...state.needs,
        happiness: Math.min(100, state.needs.happiness + 8),
      },
      coins: state.coins + 2,
    })
    get().save()
  },

  playWithCompanion: () => {
    const state = get()
    if (state.companion === 'none') return false
    const now = Date.now()
    if (state.companionPlayUntil > now) return false
    playCompanionVoice(state.companion)
    set({
      companionPlayUntil: now + 8000,
      sleeping: false,
      reaction: 'play',
      needs: {
        ...state.needs,
        happiness: Math.min(100, state.needs.happiness + 16),
        energy: Math.max(0, state.needs.energy - 4),
      },
      coins: state.coins + 6,
      xp: state.xp + 4,
      fuel: Math.min(20, state.fuel + 1),
    })
    get().save()
    get().trackMission('play')
    window.setTimeout(() => {
      if (get().reaction === 'play') set({ reaction: 'idle' })
    }, 1600)
    return true
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
  buyShoes: (id) => buyOwned(get, set, 'ownedShoes', 'shoes', id, getShoes(id).price),

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
    const cardId = WORLD_CARDS[id]
    const ownedCards =
      cardId && !state.ownedCards.includes(cardId)
        ? [...state.ownedCards, cardId]
        : state.ownedCards
    set({
      fuel: state.fuel - world.fuelCost,
      coins: state.coins + world.rewardCoins,
      stars: state.stars + 1,
      xp: state.xp + 15,
      visitedWorlds: visited,
      ownedFurniture,
      ownedHats,
      ownedCards,
      activeWorld: id,
      worldVisitCollected: [],
      overlay: 'flight',
    })
    get().save()
    get().trackMission('travel')
    return true
  },

  finishFlight: () => {
    if (!get().activeWorld) {
      set({ overlay: 'none' })
      return
    }
    set({ overlay: 'worldVisit', worldVisitCollected: [] })
  },

  collectWorldSpot: (spotId) => {
    const state = get()
    const worldId = state.activeWorld
    if (!worldId || state.overlay !== 'worldVisit') return false
    if (state.worldVisitCollected.includes(spotId)) return false
    const spot = getWorldSpots(worldId).find((s) => s.id === spotId)
    if (!spot) return false
    const collected = [...state.worldVisitCollected, spotId]
    const allSpots = getWorldSpots(worldId)
    const cleared = collected.length >= allSpots.length
    const bonus = cleared ? 15 : 0
    set({
      worldVisitCollected: collected,
      coins: state.coins + spot.rewardCoins + bonus,
      stars: state.stars + (cleared ? 1 : 0),
      xp: state.xp + (cleared ? 8 : 3),
      needs: {
        ...state.needs,
        happiness: clampNeed(state.needs.happiness + spot.happiness + (cleared ? 6 : 0)),
        energy: clampNeed(state.needs.energy - 2),
      },
      reaction: 'play',
    })
    window.setTimeout(() => {
      if (get().reaction === 'play') get().setReaction('idle')
    }, 900)
    get().save()
    get().trackMission('play')
    return true
  },

  clearWorldVisit: () => set({ activeWorld: null, worldVisitCollected: [], overlay: 'none' }),

  setRoom: (id) => {
    const state = get()
    const ownedCards =
      id === 'yard' && !state.ownedCards.includes('yard_balloon')
        ? [...state.ownedCards, 'yard_balloon' as CardId]
        : state.ownedCards
    set({ room: id, overlay: 'none', ownedCards })
    get().save()
  },

  feedFood: (id) => {
    const state = get()
    if (state.sleeping) return false
    const now = Date.now()
    const until = state.cooldowns.feed
    if (until && until > now) return false
    const food = getFood(id)
    if (food.price > 0 && state.coins < food.price) return false
    const happyBonus = state.favoriteFood === id ? 6 : 0
    set({
      coins: state.coins - food.price + food.coins,
      needs: {
        ...state.needs,
        hunger: clampNeed(state.needs.hunger + food.hunger),
        happiness: clampNeed(state.needs.happiness + food.happiness + happyBonus),
      },
      xp: state.xp + 3,
      reaction: 'eat',
      favoriteFood: id,
      cooldowns: { ...state.cooldowns, feed: now + CARE_EFFECTS.feed.cooldownMs },
      overlay: 'none',
      sleeping: false,
    })
    get().save()
    get().trackMission('feed')
    window.setTimeout(() => {
      if (get().reaction === 'eat') set({ reaction: 'idle' })
    }, 1200)
    return true
  },

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
    get().trackMission('skill')
    window.setTimeout(() => {
      if (get().reaction === reactionMap[id]) set({ reaction: 'idle' })
    }, 1400)
    return true
  },

  claimEventBonus: () => {
    const event = getActiveEvent()
    if (!event) return false
    const today = todayKey()
    const state = get()
    if (state.eventClaimDate === today) return false
    const claimed = state.claimedEventIds.includes(event.id)
      ? state.claimedEventIds
      : [...state.claimedEventIds, event.id]
    let ownedColors = state.ownedColors
    let ownedHats = state.ownedHats
    if (event.shopColorBonus && !ownedColors.includes(event.shopColorBonus as BodyColorId)) {
      ownedColors = [...ownedColors, event.shopColorBonus as BodyColorId]
    }
    if (event.hatBonus && !ownedHats.includes(event.hatBonus as HatId)) {
      ownedHats = [...ownedHats, event.hatBonus as HatId]
    }
    const ownedCards = state.ownedCards.includes('event_badge')
      ? state.ownedCards
      : [...state.ownedCards, 'event_badge' as CardId]
    set({
      coins: state.coins + event.loginBonus,
      eventClaimDate: today,
      claimedEventIds: claimed,
      ownedColors,
      ownedHats,
      ownedCards,
      // Keep event panel open so daily activity can still be played.
      overlay: 'event',
    })
    get().save()
    return true
  },

  doEventActivity: () => {
    const event = getActiveEvent()
    if (!event?.activityKind) return false
    const today = todayKey()
    if (get().eventActivityDate === today) return false
    if (!get().doCare(event.activityKind)) return false
    const bonus = event.activityBonus ?? 10
    set({
      coins: get().coins + bonus,
      xp: get().xp + 5,
      eventActivityDate: today,
      overlay: 'event',
    })
    get().save()
    return true
  },

  grantMinigameReward: (coins, fuel = 1, keepOpen = false) => {
    const state = get()
    const cardId = MINIGAME_CARDS[state.overlay]
    const ownedCards =
      cardId && !state.ownedCards.includes(cardId)
        ? [...state.ownedCards, cardId]
        : state.ownedCards
    set({
      coins: state.coins + coins,
      fuel: Math.min(20, state.fuel + fuel),
      stars: state.stars + (coins >= 15 ? 1 : 0),
      xp: state.xp + Math.max(5, Math.floor(coins / 2)),
      lastMinigameReward: coins,
      ownedCards,
      overlay: keepOpen ? state.overlay : 'none',
    })
    get().save()
    get().trackMission('minigame')
  },

  collectCard: (id) => {
    const state = get()
    if (state.ownedCards.includes(id)) return false
    set({ ownedCards: [...state.ownedCards, id] })
    get().save()
    return true
  },

  claimCardSet: (id) => {
    const state = get()
    if (state.claimedCardSets.includes(id)) return false
    const cardSet = getCardSet(id)
    const progress = setProgress(state.ownedCards, cardSet)
    if (!progress.complete) return false
    set({
      claimedCardSets: [...state.claimedCardSets, id],
      coins: state.coins + cardSet.rewardCoins,
      stars: state.stars + cardSet.rewardStars,
      fuel: Math.min(20, state.fuel + cardSet.rewardFuel),
      xp: state.xp + 12,
    })
    get().save()
    return true
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
