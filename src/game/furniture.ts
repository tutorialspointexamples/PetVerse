export type FurnitureId =
  | 'rug_basic'
  | 'rug_star'
  | 'bed_cozy'
  | 'bed_bunk'
  | 'bowl_wood'
  | 'bowl_gold'
  | 'toybox'
  | 'ball_pile'
  | 'lamp_floor'
  | 'lamp_neon'
  | 'poster_sun'
  | 'poster_moon'
  | 'plant_tall'
  | 'plant_hang'
  | 'shelf_books'
  | 'cushion'
  | 'aquarium'
  | 'jukebox'

export type FurnitureSlot = 'floor' | 'wall' | 'side'

export interface FurnitureItem {
  id: FurnitureId
  name: string
  price: number
  slot: FurnitureSlot
  color: number
  accent: number
}

export const FURNITURE: FurnitureItem[] = [
  { id: 'rug_basic', name: 'Coral Rug', price: 0, slot: 'floor', color: 0xe07a5f, accent: 0xf2cc8f },
  { id: 'rug_star', name: 'Star Rug', price: 80, slot: 'floor', color: 0x9b5de5, accent: 0xf4d35e },
  { id: 'bed_cozy', name: 'Cozy Bed', price: 120, slot: 'side', color: 0x4a90a4, accent: 0xffe8c8 },
  { id: 'bed_bunk', name: 'Cloud Bed', price: 180, slot: 'side', color: 0x7eb8d8, accent: 0xffffff },
  { id: 'bowl_wood', name: 'Wood Bowl', price: 35, slot: 'floor', color: 0xb56b45, accent: 0xe8d5b5 },
  { id: 'bowl_gold', name: 'Gold Bowl', price: 90, slot: 'floor', color: 0xf4d35e, accent: 0xe9b44c },
  { id: 'toybox', name: 'Toy Box', price: 70, slot: 'side', color: 0xe76f51, accent: 0xf4a261 },
  { id: 'ball_pile', name: 'Ball Pile', price: 45, slot: 'floor', color: 0x4cc9f0, accent: 0xff85a1 },
  { id: 'lamp_floor', name: 'Floor Lamp', price: 65, slot: 'side', color: 0xf2e8d5, accent: 0xffe066 },
  { id: 'lamp_neon', name: 'Neon Lamp', price: 110, slot: 'side', color: 0xff006e, accent: 0x00f5d4 },
  { id: 'poster_sun', name: 'Sun Poster', price: 40, slot: 'wall', color: 0xffbe0b, accent: 0xff006e },
  { id: 'poster_moon', name: 'Moon Poster', price: 40, slot: 'wall', color: 0x3a86ff, accent: 0xffe066 },
  { id: 'plant_tall', name: 'Tall Plant', price: 55, slot: 'side', color: 0x4caf7a, accent: 0xb56b45 },
  { id: 'plant_hang', name: 'Hanging Plant', price: 50, slot: 'wall', color: 0x3d9a68, accent: 0x8b5e3c },
  { id: 'shelf_books', name: 'Book Shelf', price: 95, slot: 'wall', color: 0x8b5e3c, accent: 0xe63946 },
  { id: 'cushion', name: 'Bean Cushion', price: 60, slot: 'floor', color: 0xff85a1, accent: 0xffe066 },
  { id: 'aquarium', name: 'Aquarium', price: 150, slot: 'side', color: 0x4cc9f0, accent: 0x90e0ef },
  { id: 'jukebox', name: 'Jukebox', price: 200, slot: 'side', color: 0xe63946, accent: 0xf4d35e },
]

export function getFurniture(id: FurnitureId): FurnitureItem {
  return FURNITURE.find((f) => f.id === id) ?? FURNITURE[0]
}
