export type FurnitureId =
  | 'rug_basic'
  | 'rug_star'
  | 'rug_wave'
  | 'rug_heart'
  | 'rug_check'
  | 'bed_cozy'
  | 'bed_bunk'
  | 'bed_castle'
  | 'bed_race'
  | 'bowl_wood'
  | 'bowl_gold'
  | 'bowl_crystal'
  | 'toybox'
  | 'ball_pile'
  | 'robot_toy'
  | 'lamp_floor'
  | 'lamp_neon'
  | 'lamp_lava'
  | 'poster_sun'
  | 'poster_moon'
  | 'poster_star'
  | 'poster_band'
  | 'plant_tall'
  | 'plant_hang'
  | 'plant_cactus'
  | 'shelf_books'
  | 'shelf_games'
  | 'cushion'
  | 'beanbag_xl'
  | 'aquarium'
  | 'jukebox'
  | 'treasure_chest'
  | 'coral_reef'
  | 'neon_console'
  | 'dragon_egg'
  | 'alien_pod'
  | 'mirror_vanity'
  | 'bathtub_prop'
  | 'fridge'
  | 'stove'
  | 'tv_wall'
  | 'clock_cuckoo'
  | 'hammock'
  | 'fountain'
  | 'candy_machine'
  | 'pirate_flag'
  | 'swing_set'
  | 'sandbox'
  | 'grill'
  | 'trampoline'
  | 'birdhouse'
  | 'mailbox'
  | 'snowglobe'
  | 'piano'
  | 'telescope'
  | 'disco_ball'
  | 'bean_stalk'
  | 'trophy_shelf'

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
  { id: 'rug_wave', name: 'Wave Rug', price: 95, slot: 'floor', color: 0x4cc9f0, accent: 0xffffff },
  { id: 'rug_heart', name: 'Heart Rug', price: 100, slot: 'floor', color: 0xff85a1, accent: 0xffffff },
  { id: 'rug_check', name: 'Check Rug', price: 90, slot: 'floor', color: 0x264653, accent: 0xf4d35e },
  { id: 'bed_cozy', name: 'Cozy Bed', price: 120, slot: 'side', color: 0x4a90a4, accent: 0xffe8c8 },
  { id: 'bed_bunk', name: 'Cloud Bed', price: 180, slot: 'side', color: 0x7eb8d8, accent: 0xffffff },
  { id: 'bed_castle', name: 'Castle Bed', price: 220, slot: 'side', color: 0x9b5de5, accent: 0xf4d35e },
  { id: 'bed_race', name: 'Race Car Bed', price: 240, slot: 'side', color: 0xe63946, accent: 0xf4d35e },
  { id: 'bowl_wood', name: 'Wood Bowl', price: 35, slot: 'floor', color: 0xb56b45, accent: 0xe8d5b5 },
  { id: 'bowl_gold', name: 'Gold Bowl', price: 90, slot: 'floor', color: 0xf4d35e, accent: 0xe9b44c },
  { id: 'bowl_crystal', name: 'Crystal Bowl', price: 120, slot: 'floor', color: 0x90e0ef, accent: 0xffffff },
  { id: 'toybox', name: 'Toy Box', price: 70, slot: 'side', color: 0xe76f51, accent: 0xf4a261 },
  { id: 'ball_pile', name: 'Ball Pile', price: 45, slot: 'floor', color: 0x4cc9f0, accent: 0xff85a1 },
  { id: 'robot_toy', name: 'Robot Buddy', price: 150, slot: 'floor', color: 0x8d99ae, accent: 0x00f5d4 },
  { id: 'lamp_floor', name: 'Floor Lamp', price: 65, slot: 'side', color: 0xf2e8d5, accent: 0xffe066 },
  { id: 'lamp_neon', name: 'Neon Lamp', price: 110, slot: 'side', color: 0xff006e, accent: 0x00f5d4 },
  { id: 'lamp_lava', name: 'Lava Lamp', price: 125, slot: 'side', color: 0x9b2226, accent: 0xffbe0b },
  { id: 'poster_sun', name: 'Sun Poster', price: 40, slot: 'wall', color: 0xffbe0b, accent: 0xff006e },
  { id: 'poster_moon', name: 'Moon Poster', price: 40, slot: 'wall', color: 0x3a86ff, accent: 0xffe066 },
  { id: 'poster_star', name: 'Star Poster', price: 45, slot: 'wall', color: 0x240046, accent: 0xf4d35e },
  { id: 'poster_band', name: 'Band Poster', price: 55, slot: 'wall', color: 0xe63946, accent: 0x1a1a1a },
  { id: 'plant_tall', name: 'Tall Plant', price: 55, slot: 'side', color: 0x4caf7a, accent: 0xb56b45 },
  { id: 'plant_hang', name: 'Hanging Plant', price: 50, slot: 'wall', color: 0x3d9a68, accent: 0x8b5e3c },
  { id: 'plant_cactus', name: 'Cactus Pal', price: 60, slot: 'side', color: 0x2a9d8f, accent: 0xe9c46a },
  { id: 'shelf_books', name: 'Book Shelf', price: 95, slot: 'wall', color: 0x8b5e3c, accent: 0xe63946 },
  { id: 'shelf_games', name: 'Game Shelf', price: 110, slot: 'wall', color: 0x457b9d, accent: 0xffbe0b },
  { id: 'cushion', name: 'Bean Cushion', price: 60, slot: 'floor', color: 0xff85a1, accent: 0xffe066 },
  { id: 'beanbag_xl', name: 'XL Beanbag', price: 130, slot: 'floor', color: 0x9b5de5, accent: 0xff85a1 },
  { id: 'aquarium', name: 'Aquarium', price: 150, slot: 'side', color: 0x4cc9f0, accent: 0x90e0ef },
  { id: 'jukebox', name: 'Jukebox', price: 200, slot: 'side', color: 0xe63946, accent: 0xf4d35e },
  { id: 'treasure_chest', name: 'Treasure Chest', price: 140, slot: 'side', color: 0xb56b45, accent: 0xf4d35e },
  { id: 'coral_reef', name: 'Coral Reef', price: 130, slot: 'floor', color: 0xff85a1, accent: 0x4cc9f0 },
  { id: 'neon_console', name: 'Neon Console', price: 180, slot: 'side', color: 0x240046, accent: 0x00f5d4 },
  { id: 'dragon_egg', name: 'Dragon Egg', price: 170, slot: 'floor', color: 0x9b2226, accent: 0xf4d35e },
  { id: 'alien_pod', name: 'Alien Pod', price: 190, slot: 'side', color: 0x5a189a, accent: 0x80ffdb },
  { id: 'mirror_vanity', name: 'Vanity Mirror', price: 125, slot: 'side', color: 0xf8edeb, accent: 0xff85a1 },
  { id: 'bathtub_prop', name: 'Bubble Tub', price: 160, slot: 'side', color: 0x90e0ef, accent: 0xffffff },
  { id: 'fridge', name: 'Snack Fridge', price: 145, slot: 'side', color: 0xd8e2dc, accent: 0x4cc9f0 },
  { id: 'stove', name: 'Little Stove', price: 135, slot: 'side', color: 0x6c757d, accent: 0xe63946 },
  { id: 'tv_wall', name: 'Wall TV', price: 155, slot: 'wall', color: 0x1a1a1a, accent: 0x4cc9f0 },
  { id: 'clock_cuckoo', name: 'Cuckoo Clock', price: 110, slot: 'wall', color: 0xb56b45, accent: 0xf4d35e },
  { id: 'hammock', name: 'Hammock', price: 100, slot: 'side', color: 0xffbe0b, accent: 0x2a9d8f },
  { id: 'fountain', name: 'Yard Fountain', price: 175, slot: 'floor', color: 0x4cc9f0, accent: 0xffffff },
  { id: 'candy_machine', name: 'Candy Machine', price: 165, slot: 'side', color: 0xff006e, accent: 0xffe066 },
  { id: 'pirate_flag', name: 'Pirate Flag', price: 85, slot: 'wall', color: 0x1a1a1a, accent: 0xffffff },
  { id: 'swing_set', name: 'Swing Set', price: 160, slot: 'side', color: 0xe76f51, accent: 0x4cc9f0 },
  { id: 'sandbox', name: 'Sandbox', price: 90, slot: 'floor', color: 0xe9c46a, accent: 0xb56b45 },
  { id: 'grill', name: 'BBQ Grill', price: 140, slot: 'side', color: 0x333333, accent: 0xe63946 },
  { id: 'trampoline', name: 'Trampoline', price: 180, slot: 'floor', color: 0x4cc9f0, accent: 0x1a1a1a },
  { id: 'birdhouse', name: 'Birdhouse', price: 70, slot: 'wall', color: 0xb56b45, accent: 0xe63946 },
  { id: 'mailbox', name: 'Mailbox', price: 65, slot: 'side', color: 0x457b9d, accent: 0xe63946 },
  { id: 'snowglobe', name: 'Snow Globe', price: 115, slot: 'side', color: 0x90e0ef, accent: 0xffffff },
  { id: 'piano', name: 'Mini Piano', price: 210, slot: 'side', color: 0x1a1a1a, accent: 0xffffff },
  { id: 'telescope', name: 'Telescope', price: 155, slot: 'side', color: 0x6c757d, accent: 0xf4d35e },
  { id: 'disco_ball', name: 'Disco Ball', price: 145, slot: 'wall', color: 0xcaf0f8, accent: 0xff006e },
  { id: 'bean_stalk', name: 'Bean Stalk', price: 100, slot: 'side', color: 0x4caf7a, accent: 0x3d9a68 },
  { id: 'trophy_shelf', name: 'Trophy Shelf', price: 170, slot: 'wall', color: 0x8b5e3c, accent: 0xf4d35e },
]

export function getFurniture(id: FurnitureId): FurnitureItem {
  return FURNITURE.find((f) => f.id === id) ?? FURNITURE[0]
}

export const FURNITURE_COUNT = FURNITURE.length
