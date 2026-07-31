export type WorldId = 'beach' | 'forest' | 'candy'

export interface WorldDef {
  id: WorldId
  name: string
  fuelCost: number
  rewardCoins: number
  unlockFurniture?: string
  unlockHat?: string
  wall: number
  floor: number
  accent: number
}

export const WORLDS: WorldDef[] = [
  {
    id: 'beach',
    name: 'Adventure Beach',
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
    fuelCost: 4,
    rewardCoins: 35,
    unlockFurniture: 'plant_hang',
    unlockHat: 'wizard',
    wall: 0x2d6a4f,
    floor: 0x52796f,
    accent: 0x95d5b2,
  },
  {
    id: 'candy',
    name: 'Candy Kingdom',
    fuelCost: 5,
    rewardCoins: 45,
    unlockFurniture: 'cushion',
    unlockHat: 'party',
    wall: 0xff85a1,
    floor: 0xffc8dd,
    accent: 0xf4d35e,
  },
]

export function getWorld(id: WorldId): WorldDef {
  return WORLDS.find((w) => w.id === id) ?? WORLDS[0]
}
