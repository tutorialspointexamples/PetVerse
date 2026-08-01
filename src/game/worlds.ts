export type WorldId =
  | 'candy'
  | 'pirate'
  | 'underwater'
  | 'beach'
  | 'forest'
  | 'cyber'
  | 'dragon'
  | 'alien'

export interface WorldDef {
  id: WorldId
  name: string
  blurb: string
  fuelCost: number
  rewardCoins: number
  unlockFurniture?: string
  unlockHat?: string
  wall: number
  floor: number
  accent: number
}

/** Eight destinations mirroring My Talking Tom 2 plane travel. */
export const WORLDS: WorldDef[] = [
  {
    id: 'candy',
    name: 'Candy Kingdom',
    blurb: 'Sugar towers and gumdrop trails.',
    fuelCost: 5,
    rewardCoins: 45,
    unlockFurniture: 'cushion',
    unlockHat: 'party',
    wall: 0xff85a1,
    floor: 0xffc8dd,
    accent: 0xf4d35e,
  },
  {
    id: 'pirate',
    name: 'Pirate Island',
    blurb: 'Buried coins and a salty breeze.',
    fuelCost: 4,
    rewardCoins: 38,
    unlockFurniture: 'treasure_chest',
    unlockHat: 'pirate',
    wall: 0x1d3557,
    floor: 0xc4a574,
    accent: 0xe9b44c,
  },
  {
    id: 'underwater',
    name: 'Underwater Home',
    blurb: 'Bubbles, coral, and soft blue light.',
    fuelCost: 5,
    rewardCoins: 42,
    unlockFurniture: 'coral_reef',
    unlockHat: 'diver',
    wall: 0x0077b6,
    floor: 0x023e8a,
    accent: 0x90e0ef,
  },
  {
    id: 'beach',
    name: 'Adventure Beach',
    blurb: 'Sand, surf, and sunny collectibles.',
    fuelCost: 3,
    rewardCoins: 25,
    unlockFurniture: 'bowl_gold',
    unlockHat: 'sailor',
    wall: 0x4cc9f0,
    floor: 0xf2cc8f,
    accent: 0xffffff,
  },
  {
    id: 'forest',
    name: 'Magic Forest',
    blurb: 'Mossy paths and glowing mushrooms.',
    fuelCost: 4,
    rewardCoins: 35,
    unlockFurniture: 'plant_hang',
    unlockHat: 'wizard',
    wall: 0x2d6a4f,
    floor: 0x52796f,
    accent: 0x95d5b2,
  },
  {
    id: 'cyber',
    name: 'Cyber City',
    blurb: 'Neon grids and humming circuits.',
    fuelCost: 6,
    rewardCoins: 55,
    unlockFurniture: 'neon_console',
    unlockHat: 'visor',
    wall: 0x240046,
    floor: 0x10002b,
    accent: 0x00f5d4,
  },
  {
    id: 'dragon',
    name: 'Dragon Kingdom',
    blurb: 'Ember skies and golden hoards.',
    fuelCost: 6,
    rewardCoins: 58,
    unlockFurniture: 'dragon_egg',
    unlockHat: 'dragon',
    wall: 0x9b2226,
    floor: 0x432818,
    accent: 0xf4d35e,
  },
  {
    id: 'alien',
    name: 'Alien Planet',
    blurb: 'Strange flora and violet moons.',
    fuelCost: 7,
    rewardCoins: 65,
    unlockFurniture: 'alien_pod',
    unlockHat: 'antenna',
    wall: 0x5a189a,
    floor: 0x3c096c,
    accent: 0x80ffdb,
  },
]

export function getWorld(id: WorldId): WorldDef {
  return WORLDS.find((w) => w.id === id) ?? WORLDS[0]
}

export type WorldSpotActivityKind = 'timing' | 'tap' | 'chase'

/** Interactive hotspots while visiting a destination (MTT2 plane-world explore loop). */
export interface WorldSpot {
  id: string
  label: string
  blurb: string
  rewardCoins: number
  happiness: number
  x: number
  y: number
  activity: WorldSpotActivityKind
}

export const WORLD_SPOTS: Record<WorldId, WorldSpot[]> = {
  candy: [
    { id: 'gumdrop', label: 'Gumdrop Trail', blurb: 'Bounce along sugary paths.', rewardCoins: 8, happiness: 6, x: 18, y: 62, activity: 'tap' },
    { id: 'sugar_tower', label: 'Sugar Tower', blurb: 'Peek from a candy spire.', rewardCoins: 10, happiness: 8, x: 52, y: 28, activity: 'timing' },
    { id: 'candy_cart', label: 'Candy Cart', blurb: 'Snack from a rolling cart.', rewardCoins: 12, happiness: 10, x: 78, y: 58, activity: 'chase' },
  ],
  pirate: [
    { id: 'treasure', label: 'Buried Chest', blurb: 'Dig where X marks the spot.', rewardCoins: 10, happiness: 8, x: 22, y: 68, activity: 'chase' },
    { id: 'cannon', label: 'Deck Cannon', blurb: 'Fire a confetti blast.', rewardCoins: 9, happiness: 7, x: 70, y: 36, activity: 'timing' },
    { id: 'parrot', label: 'Parrot Perch', blurb: 'Chat with a salty bird.', rewardCoins: 11, happiness: 9, x: 48, y: 22, activity: 'tap' },
  ],
  underwater: [
    { id: 'coral', label: 'Coral Garden', blurb: 'Swim through glowing reefs.', rewardCoins: 9, happiness: 8, x: 20, y: 55, activity: 'chase' },
    { id: 'bubble', label: 'Bubble Ring', blurb: 'Pop a shimmering ring.', rewardCoins: 8, happiness: 6, x: 55, y: 30, activity: 'tap' },
    { id: 'chest_sea', label: 'Sea Chest', blurb: 'Open a barnacled stash.', rewardCoins: 12, happiness: 10, x: 78, y: 64, activity: 'timing' },
  ],
  beach: [
    { id: 'shells', label: 'Shell Shore', blurb: 'Collect shiny shells.', rewardCoins: 7, happiness: 6, x: 16, y: 70, activity: 'tap' },
    { id: 'surf', label: 'Surfboard', blurb: 'Ride a tiny wave.', rewardCoins: 10, happiness: 9, x: 50, y: 40, activity: 'timing' },
    { id: 'sandcastle', label: 'Sandcastle', blurb: 'Build a crumbly fort.', rewardCoins: 9, happiness: 8, x: 82, y: 60, activity: 'chase' },
  ],
  forest: [
    { id: 'mushroom', label: 'Glow Mushroom', blurb: 'Tap a mossy lantern.', rewardCoins: 8, happiness: 7, x: 24, y: 58, activity: 'tap' },
    { id: 'firefly', label: 'Firefly Grove', blurb: 'Chase soft lights.', rewardCoins: 10, happiness: 9, x: 58, y: 26, activity: 'chase' },
    { id: 'hollow', label: 'Tree Hollow', blurb: 'Peek into a cozy nook.', rewardCoins: 11, happiness: 8, x: 80, y: 52, activity: 'timing' },
  ],
  cyber: [
    { id: 'terminal', label: 'Neon Terminal', blurb: 'Hack a friendly kiosk.', rewardCoins: 12, happiness: 8, x: 20, y: 42, activity: 'timing' },
    { id: 'drone', label: 'Hover Drone', blurb: 'Race a buzzing scout.', rewardCoins: 11, happiness: 9, x: 55, y: 22, activity: 'chase' },
    { id: 'grid', label: 'Grid Pad', blurb: 'Dance on light tiles.', rewardCoins: 10, happiness: 7, x: 78, y: 60, activity: 'tap' },
  ],
  dragon: [
    { id: 'egg', label: 'Warm Egg', blurb: 'Guard a glowing egg.', rewardCoins: 12, happiness: 9, x: 28, y: 64, activity: 'tap' },
    { id: 'hoard', label: 'Gold Hoard', blurb: 'Count shiny coins.', rewardCoins: 14, happiness: 8, x: 62, y: 34, activity: 'chase' },
    { id: 'ember', label: 'Ember Pit', blurb: 'Toast marshmallows safely.', rewardCoins: 11, happiness: 10, x: 82, y: 58, activity: 'timing' },
  ],
  alien: [
    { id: 'crystal', label: 'Moon Crystal', blurb: 'Tune a violet crystal.', rewardCoins: 13, happiness: 9, x: 22, y: 48, activity: 'timing' },
    { id: 'flora', label: 'Strange Flora', blurb: 'Pet a wiggly plant.', rewardCoins: 10, happiness: 8, x: 50, y: 24, activity: 'tap' },
    { id: 'pod', label: 'Landing Pod', blurb: 'Scan a humming pod.', rewardCoins: 12, happiness: 10, x: 78, y: 62, activity: 'chase' },
  ],
}

export function getWorldSpots(id: WorldId): WorldSpot[] {
  return WORLD_SPOTS[id] ?? []
}
