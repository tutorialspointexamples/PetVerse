export type BodyColorId =
  | 'ginger'
  | 'cream'
  | 'slate'
  | 'mint'
  | 'rose'
  | 'charcoal'
  | 'honey'
  | 'sky'
  | 'lilac'
  | 'snow'
  | 'cocoa'
  | 'coral'
  | 'lava'
  | 'matcha'
  | 'blueberry'
  | 'sand'

export type HatId =
  | 'none'
  | 'cap'
  | 'bow'
  | 'crown'
  | 'beanie'
  | 'flower'
  | 'topHat'
  | 'party'
  | 'halo'
  | 'bandana'
  | 'wizard'
  | 'sailor'
  | 'pirate'
  | 'diver'
  | 'visor'
  | 'dragon'
  | 'antenna'
  | 'chef'
  | 'cowboy'
  | 'headphones'
  | 'propeller'
  | 'knight'
  | 'santa'

export type GlassesId =
  | 'none'
  | 'round'
  | 'sun'
  | 'star'
  | 'pixel'
  | 'heart'
  | 'cat'
  | 'monocle'
  | 'swim'
  | 'aviator'

export type ScarfId =
  | 'none'
  | 'red'
  | 'striped'
  | 'green'
  | 'gold'
  | 'winter'
  | 'rainbow'
  | 'spots'
  | 'velvet'
  | 'cape'

export type ShirtId =
  | 'none'
  | 'tee'
  | 'hoodie'
  | 'vest'
  | 'overalls'
  | 'tuxedo'
  | 'raincoat'
  | 'sweater'
  | 'jersey'
  | 'kimono'
  | 'astronaut'

export type ShoesId = 'none' | 'sneakers' | 'boots' | 'sandals' | 'rocket' | 'roller'

export interface BodyColorOption {
  id: BodyColorId
  name: string
  fill: number
  belly: number
  ear: number
  price: number
}

export interface HatOption {
  id: HatId
  name: string
  price: number
  color: number
}

export interface SimpleCosmetic<T extends string> {
  id: T
  name: string
  price: number
  color: number
}

export const BODY_COLORS: BodyColorOption[] = [
  { id: 'ginger', name: 'Ginger', fill: 0xf4a261, belly: 0xffe8c8, ear: 0xe76f51, price: 0 },
  { id: 'cream', name: 'Cream', fill: 0xf6e6c8, belly: 0xfff8ee, ear: 0xe8b4a0, price: 40 },
  { id: 'slate', name: 'Slate', fill: 0x6b7c8a, belly: 0xd5dde3, ear: 0x4a5a66, price: 60 },
  { id: 'mint', name: 'Mint', fill: 0x7bc9a6, belly: 0xe4f7ef, ear: 0x4fa882, price: 80 },
  { id: 'rose', name: 'Rose', fill: 0xe8a0b0, belly: 0xffe8ee, ear: 0xd4788a, price: 100 },
  { id: 'charcoal', name: 'Charcoal', fill: 0x3d4450, belly: 0xb8bec8, ear: 0x2a3038, price: 90 },
  { id: 'honey', name: 'Honey', fill: 0xe8b84a, belly: 0xfff0c8, ear: 0xd49a2e, price: 70 },
  { id: 'sky', name: 'Sky', fill: 0x7eb8d8, belly: 0xe8f4fc, ear: 0x5a9ab8, price: 85 },
  { id: 'lilac', name: 'Lilac', fill: 0xb8a0d8, belly: 0xf0e8fc, ear: 0x9878c0, price: 95 },
  { id: 'snow', name: 'Snow', fill: 0xf2f2f0, belly: 0xffffff, ear: 0xe8d0c8, price: 110 },
  { id: 'cocoa', name: 'Cocoa', fill: 0x8b5e3c, belly: 0xe8d0b0, ear: 0x6b4428, price: 75 },
  { id: 'coral', name: 'Coral', fill: 0xff8a70, belly: 0xffe0d8, ear: 0xe06850, price: 105 },
  { id: 'lava', name: 'Lava', fill: 0xd62828, belly: 0xffb703, ear: 0x9b2226, price: 130 },
  { id: 'matcha', name: 'Matcha', fill: 0xa7c957, belly: 0xf1faee, ear: 0x6a994e, price: 115 },
  { id: 'blueberry', name: 'Blueberry', fill: 0x3a0ca3, belly: 0xcddafd, ear: 0x240046, price: 125 },
  { id: 'sand', name: 'Sand', fill: 0xe9c46a, belly: 0xfefae0, ear: 0xd4a373, price: 95 },
]

export const HATS: HatOption[] = [
  { id: 'none', name: 'No Hat', price: 0, color: 0x000000 },
  { id: 'cap', name: 'Cap', price: 50, color: 0x2a6f97 },
  { id: 'bow', name: 'Bow', price: 45, color: 0xe63946 },
  { id: 'crown', name: 'Crown', price: 120, color: 0xf4d35e },
  { id: 'beanie', name: 'Beanie', price: 70, color: 0x9b5de5 },
  { id: 'flower', name: 'Flower', price: 55, color: 0xff85a1 },
  { id: 'topHat', name: 'Top Hat', price: 130, color: 0x1a1a1a },
  { id: 'party', name: 'Party', price: 65, color: 0xff6b6b },
  { id: 'halo', name: 'Halo', price: 140, color: 0xffe066 },
  { id: 'bandana', name: 'Bandana', price: 48, color: 0x2a9d8f },
  { id: 'wizard', name: 'Wizard', price: 150, color: 0x5a189a },
  { id: 'sailor', name: 'Sailor', price: 80, color: 0x1d3557 },
  { id: 'pirate', name: 'Pirate', price: 110, color: 0x1a1a1a },
  { id: 'diver', name: 'Diver', price: 125, color: 0x0077b6 },
  { id: 'visor', name: 'Cyber Visor', price: 145, color: 0x00f5d4 },
  { id: 'dragon', name: 'Dragon Crest', price: 160, color: 0x9b2226 },
  { id: 'antenna', name: 'Alien Antenna', price: 155, color: 0x80ffdb },
  { id: 'chef', name: 'Chef Hat', price: 90, color: 0xffffff },
  { id: 'cowboy', name: 'Cowboy', price: 105, color: 0xb56b45 },
  { id: 'headphones', name: 'Headphones', price: 120, color: 0x333333 },
  { id: 'propeller', name: 'Propeller', price: 100, color: 0x4cc9f0 },
  { id: 'knight', name: 'Knight Helm', price: 170, color: 0x8d99ae },
  { id: 'santa', name: 'Holiday Cap', price: 95, color: 0xe63946 },
]

export const GLASSES: SimpleCosmetic<GlassesId>[] = [
  { id: 'none', name: 'No Glasses', price: 0, color: 0x000000 },
  { id: 'round', name: 'Round', price: 55, color: 0x333333 },
  { id: 'sun', name: 'Sunnies', price: 70, color: 0x1a1a1a },
  { id: 'star', name: 'Star', price: 90, color: 0xf4d35e },
  { id: 'pixel', name: 'Pixel', price: 85, color: 0x00ff88 },
  { id: 'heart', name: 'Heart', price: 95, color: 0xff6b9d },
  { id: 'cat', name: 'Cat Eye', price: 100, color: 0x5a189a },
  { id: 'monocle', name: 'Monocle', price: 110, color: 0xf4d35e },
  { id: 'swim', name: 'Swim Goggles', price: 80, color: 0x00b4d8 },
  { id: 'aviator', name: 'Aviator', price: 115, color: 0x264653 },
]

export const SCARVES: SimpleCosmetic<ScarfId>[] = [
  { id: 'none', name: 'No Scarf', price: 0, color: 0x000000 },
  { id: 'red', name: 'Red', price: 40, color: 0xe63946 },
  { id: 'striped', name: 'Striped', price: 55, color: 0x457b9d },
  { id: 'green', name: 'Forest', price: 45, color: 0x2a9d8f },
  { id: 'gold', name: 'Gold', price: 100, color: 0xf4d35e },
  { id: 'winter', name: 'Winter', price: 60, color: 0xe8f1f8 },
  { id: 'rainbow', name: 'Rainbow', price: 120, color: 0xff006e },
  { id: 'spots', name: 'Spots', price: 75, color: 0xffbe0b },
  { id: 'velvet', name: 'Velvet', price: 90, color: 0x6a040f },
  { id: 'cape', name: 'Hero Cape', price: 140, color: 0xe63946 },
]

export const SHIRTS: SimpleCosmetic<ShirtId>[] = [
  { id: 'none', name: 'No Shirt', price: 0, color: 0x000000 },
  { id: 'tee', name: 'Tee', price: 50, color: 0x4cc9f0 },
  { id: 'hoodie', name: 'Hoodie', price: 80, color: 0xe76f51 },
  { id: 'vest', name: 'Vest', price: 70, color: 0x264653 },
  { id: 'overalls', name: 'Overalls', price: 90, color: 0x457b9d },
  { id: 'tuxedo', name: 'Tuxedo', price: 160, color: 0x1a1a1a },
  { id: 'raincoat', name: 'Raincoat', price: 95, color: 0xffbe0b },
  { id: 'sweater', name: 'Sweater', price: 85, color: 0xe63946 },
  { id: 'jersey', name: 'Jersey', price: 100, color: 0x1d3557 },
  { id: 'kimono', name: 'Kimono', price: 150, color: 0xff85a1 },
  { id: 'astronaut', name: 'Astro Suit', price: 180, color: 0xd8e2dc },
]

export const SHOES: SimpleCosmetic<ShoesId>[] = [
  { id: 'none', name: 'Bare Paws', price: 0, color: 0x000000 },
  { id: 'sneakers', name: 'Sneakers', price: 60, color: 0xffffff },
  { id: 'boots', name: 'Boots', price: 85, color: 0x6b4428 },
  { id: 'sandals', name: 'Sandals', price: 45, color: 0xf4a261 },
  { id: 'rocket', name: 'Rocket Shoes', price: 160, color: 0xe63946 },
  { id: 'roller', name: 'Roller Skates', price: 130, color: 0x9b5de5 },
]

export function getBodyColor(id: BodyColorId): BodyColorOption {
  return BODY_COLORS.find((c) => c.id === id) ?? BODY_COLORS[0]
}

export function getHat(id: HatId): HatOption {
  return HATS.find((h) => h.id === id) ?? HATS[0]
}

export function getGlasses(id: GlassesId): SimpleCosmetic<GlassesId> {
  return GLASSES.find((g) => g.id === id) ?? GLASSES[0]
}

export function getScarf(id: ScarfId): SimpleCosmetic<ScarfId> {
  return SCARVES.find((s) => s.id === id) ?? SCARVES[0]
}

export function getShirt(id: ShirtId): SimpleCosmetic<ShirtId> {
  return SHIRTS.find((s) => s.id === id) ?? SHIRTS[0]
}

export function getShoes(id: ShoesId): SimpleCosmetic<ShoesId> {
  return SHOES.find((s) => s.id === id) ?? SHOES[0]
}

/** Wearable SKU count across all style categories. */
export const WEARABLE_COUNT =
  BODY_COLORS.length +
  HATS.length +
  GLASSES.length +
  SCARVES.length +
  SHIRTS.length +
  SHOES.length
