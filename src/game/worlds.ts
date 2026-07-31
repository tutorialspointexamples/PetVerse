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
