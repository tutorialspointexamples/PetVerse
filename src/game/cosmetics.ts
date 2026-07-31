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
  | 'peach'
  | 'orchid'
  | 'teal'
  | 'amber'
  | 'ivory'
  | 'grape'
  | 'moss'
  | 'ink'
  | 'sunrise'
  | 'storm'
  | 'cotton'
  | 'ruby'
  | 'seafoam'
  | 'midnight'
  | 'tangerine'
  | 'frost'
  | 'pistachio'
  | 'plum'
  | 'bronze'
  | 'aurora'

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
  | 'beret'
  | 'tiara'
  | 'hardhat'
  | 'mushroom'
  | 'unicorn'
  | 'fedora'
  | 'sombrero'
  | 'viking'
  | 'ninja'
  | 'afro'
  | 'rainbowCap'
  | 'leafCrown'
  | 'spaceHelm'
  | 'detective'
  | 'plunger'
  | 'turban'
  | 'jester'
  | 'firefighter'
  | 'pilot'
  | 'bouquet'
  | 'pancake'
  | 'banana'
  | 'crownFlower'
  | 'robotHelm'
  | 'sheep'
  | 'tophatStripe'
  | 'cake'
  | 'raccoon'
  | 'bee'
  | 'cactusHat'
  | 'commuter'
  | 'pirateBandana'
  | 'iceCrown'

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
  | 'nerd'
  | '3d'
  | 'cyber'
  | 'bug'
  | 'diamond'
  | 'oval'
  | 'steampunk'
  | 'night'
  | 'square'
  | 'flip'
  | 'goggles'
  | 'shutter'
  | 'laser'
  | 'crystal'
  | 'rainbowLens'
  | 'ski'
  | 'vr'
  | 'opera'
  | 'safety'
  | 'spy'

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
  | 'bowtie'
  | 'pearl'
  | 'camo'
  | 'neon'
  | 'plaid'
  | 'fur'
  | 'medal'
  | 'ascot'
  | 'silk'
  | 'bandanaNeck'
  | 'lei'
  | 'chain'
  | 'bell'
  | 'feather'
  | 'scarfDots'
  | 'lanyard'
  | 'shawl'
  | 'choker'
  | 'tie'
  | 'hoodieStrings'

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
  | 'polo'
  | 'dress'
  | 'armor'
  | 'labcoat'
  | 'hawaiian'
  | 'superhero'
  | 'pajama'
  | 'pirateCoat'
  | 'tank'
  | 'blazer'
  | 'onesie'
  | 'apron'
  | 'tracksuit'
  | 'poncho'
  | 'wetsuit'
  | 'cardigan'
  | 'denim'
  | 'toga'
  | 'raincoatClear'
  | 'scout'
  | 'ballet'
  | 'mechanic'
  | 'karate'
  | 'chefCoat'
  | 'hoodieCrop'
  | 'letterman'
  | 'puffer'
  | 'sari'
  | 'soccer'
  | 'varsity'

export type ShoesId =
  | 'none'
  | 'sneakers'
  | 'boots'
  | 'sandals'
  | 'rocket'
  | 'roller'
  | 'slippers'
  | 'cleats'
  | 'heels'
  | 'flippers'
  | 'iceSkates'
  | 'hiking'
  | 'socks'
  | 'cloud'
  | 'ballet'
  | 'cowboyBoots'
  | 'moonBoots'
  | 'rainBoots'
  | 'tap'
  | 'furry'
  | 'glow'
  | 'crocs'
  | 'wings'
  | 'spats'
  | 'platform'
  | 'moccasin'
  | 'skiBoots'

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
  /** Draw style reused by PetScene */
  style?:
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
  { id: 'peach', name: 'Peach', fill: 0xffc4a3, belly: 0xfff1e6, ear: 0xf4a261, price: 88 },
  { id: 'orchid', name: 'Orchid', fill: 0xd0a5ff, belly: 0xf3e8ff, ear: 0xb388eb, price: 118 },
  { id: 'teal', name: 'Teal', fill: 0x2a9d8f, belly: 0xd8f3dc, ear: 0x1d7874, price: 102 },
  { id: 'amber', name: 'Amber', fill: 0xff9f1c, belly: 0xffe5b4, ear: 0xe85d04, price: 108 },
  { id: 'ivory', name: 'Ivory', fill: 0xfff3e0, belly: 0xffffff, ear: 0xffd6a5, price: 112 },
  { id: 'grape', name: 'Grape', fill: 0x7b2cbf, belly: 0xe0aaff, ear: 0x5a189a, price: 122 },
  { id: 'moss', name: 'Moss', fill: 0x606c38, belly: 0xdda15e, ear: 0x283618, price: 98 },
  { id: 'ink', name: 'Ink', fill: 0x14213d, belly: 0x8d99ae, ear: 0x0d1b2a, price: 135 },
  { id: 'sunrise', name: 'Sunrise', fill: 0xff7b54, belly: 0xffe5d9, ear: 0xe85d04, price: 128 },
  { id: 'storm', name: 'Storm', fill: 0x4a5568, belly: 0xcbd5e0, ear: 0x2d3748, price: 132 },
  { id: 'cotton', name: 'Cotton', fill: 0xfaf0e6, belly: 0xffffff, ear: 0xf5d0c5, price: 120 },
  { id: 'ruby', name: 'Ruby', fill: 0x9b2226, belly: 0xffc2c2, ear: 0x660708, price: 145 },
  { id: 'seafoam', name: 'Seafoam', fill: 0x80ed99, belly: 0xd8f3dc, ear: 0x38a3a5, price: 126 },
  { id: 'midnight', name: 'Midnight', fill: 0x10002b, belly: 0x7b2cbf, ear: 0x240046, price: 150 },
  { id: 'tangerine', name: 'Tangerine', fill: 0xff8c42, belly: 0xffe5d0, ear: 0xe76f51, price: 118 },
  { id: 'frost', name: 'Frost', fill: 0xd0e8f2, belly: 0xffffff, ear: 0xa8cad8, price: 124 },
  { id: 'pistachio', name: 'Pistachio', fill: 0xb5d99c, belly: 0xf1faee, ear: 0x8fb879, price: 116 },
  { id: 'plum', name: 'Plum', fill: 0x6a4c93, belly: 0xe0cffc, ear: 0x4a306d, price: 134 },
  { id: 'bronze', name: 'Bronze', fill: 0xcd7f32, belly: 0xffe8c8, ear: 0xa65e1d, price: 140 },
  { id: 'aurora', name: 'Aurora', fill: 0x56cfe1, belly: 0xf72585, ear: 0x4cc9f0, price: 155 },
]

export const HATS: HatOption[] = [
  { id: 'none', name: 'No Hat', price: 0, color: 0x000000 },
  { id: 'cap', name: 'Cap', price: 50, color: 0x2a6f97, style: 'cap' },
  { id: 'bow', name: 'Bow', price: 45, color: 0xe63946, style: 'bow' },
  { id: 'crown', name: 'Crown', price: 120, color: 0xf4d35e, style: 'crown' },
  { id: 'beanie', name: 'Beanie', price: 70, color: 0x9b5de5, style: 'beanie' },
  { id: 'flower', name: 'Flower', price: 55, color: 0xff85a1, style: 'flower' },
  { id: 'topHat', name: 'Top Hat', price: 130, color: 0x1a1a1a, style: 'topHat' },
  { id: 'party', name: 'Party', price: 65, color: 0xff6b6b, style: 'party' },
  { id: 'halo', name: 'Halo', price: 140, color: 0xffe066, style: 'halo' },
  { id: 'bandana', name: 'Bandana', price: 48, color: 0x2a9d8f, style: 'bandana' },
  { id: 'wizard', name: 'Wizard', price: 150, color: 0x5a189a, style: 'wizard' },
  { id: 'sailor', name: 'Sailor', price: 80, color: 0x1d3557, style: 'cap' },
  { id: 'pirate', name: 'Pirate', price: 110, color: 0x1a1a1a, style: 'pirate' },
  { id: 'diver', name: 'Diver', price: 125, color: 0x0077b6, style: 'diver' },
  { id: 'visor', name: 'Cyber Visor', price: 145, color: 0x00f5d4, style: 'visor' },
  { id: 'dragon', name: 'Dragon Crest', price: 160, color: 0x9b2226, style: 'dragon' },
  { id: 'antenna', name: 'Alien Antenna', price: 155, color: 0x80ffdb, style: 'antenna' },
  { id: 'chef', name: 'Chef Hat', price: 90, color: 0xffffff, style: 'chef' },
  { id: 'cowboy', name: 'Cowboy', price: 105, color: 0xb56b45, style: 'cowboy' },
  { id: 'headphones', name: 'Headphones', price: 120, color: 0x333333, style: 'headphones' },
  { id: 'propeller', name: 'Propeller', price: 100, color: 0x4cc9f0, style: 'propeller' },
  { id: 'knight', name: 'Knight Helm', price: 170, color: 0x8d99ae, style: 'knight' },
  { id: 'santa', name: 'Holiday Cap', price: 95, color: 0xe63946, style: 'santa' },
  { id: 'beret', name: 'Beret', price: 75, color: 0xe63946, style: 'beanie' },
  { id: 'tiara', name: 'Tiara', price: 155, color: 0xf8f9fa, style: 'crown' },
  { id: 'hardhat', name: 'Hard Hat', price: 85, color: 0xffbe0b, style: 'cap' },
  { id: 'mushroom', name: 'Mushroom Cap', price: 110, color: 0xe63946, style: 'beanie' },
  { id: 'unicorn', name: 'Unicorn Horn', price: 165, color: 0xff85a1, style: 'party' },
  { id: 'fedora', name: 'Fedora', price: 115, color: 0x6b4428, style: 'cowboy' },
  { id: 'sombrero', name: 'Sombrero', price: 125, color: 0xf4d35e, style: 'cowboy' },
  { id: 'viking', name: 'Viking Helm', price: 175, color: 0x8d99ae, style: 'knight' },
  { id: 'ninja', name: 'Ninja Hood', price: 140, color: 0x1a1a1a, style: 'bandana' },
  { id: 'afro', name: 'Afro', price: 130, color: 0x3d2914, style: 'beanie' },
  { id: 'rainbowCap', name: 'Rainbow Cap', price: 135, color: 0xff006e, style: 'cap' },
  { id: 'leafCrown', name: 'Leaf Crown', price: 100, color: 0x4caf7a, style: 'crown' },
  { id: 'spaceHelm', name: 'Space Helm', price: 180, color: 0xd8e2dc, style: 'diver' },
  { id: 'detective', name: 'Detective Hat', price: 120, color: 0x6b4428, style: 'cowboy' },
  { id: 'plunger', name: 'Plunger Hat', price: 70, color: 0xe63946, style: 'party' },
  { id: 'turban', name: 'Turban', price: 125, color: 0xffbe0b, style: 'beanie' },
  { id: 'jester', name: 'Jester Cap', price: 140, color: 0x9b5de5, style: 'party' },
  { id: 'firefighter', name: 'Fire Helm', price: 155, color: 0xe63946, style: 'knight' },
  { id: 'pilot', name: 'Pilot Cap', price: 135, color: 0x1d3557, style: 'cap' },
  { id: 'bouquet', name: 'Flower Bouquet', price: 110, color: 0xff85a1, style: 'flower' },
  { id: 'pancake', name: 'Pancake Stack', price: 95, color: 0xe9c46a, style: 'beanie' },
  { id: 'banana', name: 'Banana Hat', price: 85, color: 0xffe066, style: 'party' },
  { id: 'crownFlower', name: 'Flower Crown', price: 130, color: 0xff006e, style: 'crown' },
  { id: 'robotHelm', name: 'Robot Helm', price: 185, color: 0x8d99ae, style: 'diver' },
  { id: 'sheep', name: 'Sheep Hood', price: 145, color: 0xf8f9fa, style: 'beanie' },
  { id: 'tophatStripe', name: 'Stripe Top Hat', price: 145, color: 0x1a1a1a, style: 'topHat' },
  { id: 'cake', name: 'Birthday Cake', price: 120, color: 0xff85a1, style: 'party' },
  { id: 'raccoon', name: 'Raccoon Hood', price: 150, color: 0x6b7c8a, style: 'beanie' },
  { id: 'bee', name: 'Bee Antenna', price: 110, color: 0xffbe0b, style: 'antenna' },
  { id: 'cactusHat', name: 'Cactus Hat', price: 105, color: 0x2a9d8f, style: 'beanie' },
  { id: 'commuter', name: 'Commuter Cap', price: 90, color: 0x457b9d, style: 'cap' },
  { id: 'pirateBandana', name: 'Pirate Bandana', price: 95, color: 0xe63946, style: 'bandana' },
  { id: 'iceCrown', name: 'Ice Crown', price: 170, color: 0xcaf0f8, style: 'crown' },
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
  { id: 'nerd', name: 'Nerd', price: 65, color: 0x457b9d },
  { id: '3d', name: '3D Specs', price: 88, color: 0xe63946 },
  { id: 'cyber', name: 'Cyber Lens', price: 140, color: 0x00f5d4 },
  { id: 'bug', name: 'Bug Eyes', price: 105, color: 0x90e0ef },
  { id: 'diamond', name: 'Diamond', price: 150, color: 0xcaf0f8 },
  { id: 'oval', name: 'Oval', price: 72, color: 0x6c757d },
  { id: 'steampunk', name: 'Steampunk', price: 135, color: 0xb56b45 },
  { id: 'night', name: 'Night Vision', price: 145, color: 0x2a9d8f },
  { id: 'square', name: 'Square Specs', price: 78, color: 0x264653 },
  { id: 'flip', name: 'Flip Shades', price: 98, color: 0x1a1a1a },
  { id: 'goggles', name: 'Lab Goggles', price: 112, color: 0x4cc9f0 },
  { id: 'shutter', name: 'Shutter Shades', price: 105, color: 0xe63946 },
  { id: 'laser', name: 'Laser Visor', price: 155, color: 0xff006e },
  { id: 'crystal', name: 'Crystal Specs', price: 160, color: 0xcaf0f8 },
  { id: 'rainbowLens', name: 'Rainbow Lens', price: 148, color: 0xff006e },
  { id: 'ski', name: 'Ski Goggles', price: 118, color: 0xffbe0b },
  { id: 'vr', name: 'VR Headset', price: 165, color: 0x1a1a1a },
  { id: 'opera', name: 'Opera Glasses', price: 140, color: 0xf4d35e },
  { id: 'safety', name: 'Safety Glasses', price: 88, color: 0x4cc9f0 },
  { id: 'spy', name: 'Spy Specs', price: 132, color: 0x264653 },
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
  { id: 'bowtie', name: 'Bow Tie', price: 70, color: 0x1d3557 },
  { id: 'pearl', name: 'Pearl Strand', price: 125, color: 0xf8edeb },
  { id: 'camo', name: 'Camo Wrap', price: 80, color: 0x606c38 },
  { id: 'neon', name: 'Neon Glow', price: 130, color: 0x00f5d4 },
  { id: 'plaid', name: 'Plaid', price: 85, color: 0xe76f51 },
  { id: 'fur', name: 'Fluffy Collar', price: 110, color: 0xf2e8d5 },
  { id: 'medal', name: 'Medal Ribbon', price: 95, color: 0xf4d35e },
  { id: 'ascot', name: 'Ascot', price: 100, color: 0x9b5de5 },
  { id: 'silk', name: 'Silk Scarf', price: 115, color: 0xff85a1 },
  { id: 'bandanaNeck', name: 'Neck Bandana', price: 55, color: 0x457b9d },
  { id: 'lei', name: 'Flower Lei', price: 90, color: 0xffbe0b },
  { id: 'chain', name: 'Gold Chain', price: 150, color: 0xf4d35e },
  { id: 'bell', name: 'Collar Bell', price: 70, color: 0xf4d35e },
  { id: 'feather', name: 'Feather Boa', price: 135, color: 0xff006e },
  { id: 'scarfDots', name: 'Polka Scarf', price: 78, color: 0xff85a1 },
  { id: 'lanyard', name: 'Event Lanyard', price: 65, color: 0x3a86ff },
  { id: 'shawl', name: 'Cozy Shawl', price: 108, color: 0xb8a0d8 },
  { id: 'choker', name: 'Sparkle Choker', price: 95, color: 0x1a1a1a },
  { id: 'tie', name: 'Necktie', price: 85, color: 0xe63946 },
  { id: 'hoodieStrings', name: 'Hoodie Strings', price: 55, color: 0x4cc9f0 },
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
  { id: 'polo', name: 'Polo', price: 65, color: 0x2a9d8f },
  { id: 'dress', name: 'Party Dress', price: 140, color: 0xff006e },
  { id: 'armor', name: 'Knight Armor', price: 175, color: 0x8d99ae },
  { id: 'labcoat', name: 'Lab Coat', price: 110, color: 0xf8f9fa },
  { id: 'hawaiian', name: 'Hawaiian', price: 95, color: 0xffbe0b },
  { id: 'superhero', name: 'Hero Suit', price: 165, color: 0xe63946 },
  { id: 'pajama', name: 'Pajamas', price: 75, color: 0xb8a0d8 },
  { id: 'pirateCoat', name: 'Pirate Coat', price: 155, color: 0x6a040f },
  { id: 'tank', name: 'Tank Top', price: 45, color: 0x4cc9f0 },
  { id: 'blazer', name: 'Blazer', price: 130, color: 0x1d3557 },
  { id: 'onesie', name: 'Bunny Onesie', price: 120, color: 0xffc8dd },
  { id: 'apron', name: 'Chef Apron', price: 70, color: 0xffffff },
  { id: 'tracksuit', name: 'Tracksuit', price: 105, color: 0x3a86ff },
  { id: 'poncho', name: 'Poncho', price: 115, color: 0xe76f51 },
  { id: 'wetsuit', name: 'Wetsuit', price: 145, color: 0x1a1a1a },
  { id: 'cardigan', name: 'Cardigan', price: 95, color: 0xb8a0d8 },
  { id: 'denim', name: 'Denim Jacket', price: 125, color: 0x457b9d },
  { id: 'toga', name: 'Toga', price: 130, color: 0xffffff },
  { id: 'raincoatClear', name: 'Clear Raincoat', price: 100, color: 0x90e0ef },
  { id: 'scout', name: 'Scout Shirt', price: 85, color: 0x2a9d8f },
  { id: 'ballet', name: 'Ballet Tutu', price: 140, color: 0xffc8dd },
  { id: 'mechanic', name: 'Mechanic Overalls', price: 110, color: 0x6c757d },
  { id: 'karate', name: 'Karate Gi', price: 120, color: 0xffffff },
  { id: 'chefCoat', name: 'Chef Coat', price: 115, color: 0xf8f9fa },
  { id: 'hoodieCrop', name: 'Crop Hoodie', price: 100, color: 0xff85a1 },
  { id: 'letterman', name: 'Letterman', price: 145, color: 0xe63946 },
  { id: 'puffer', name: 'Puffer Jacket', price: 135, color: 0x3a86ff },
  { id: 'sari', name: 'Sari Wrap', price: 150, color: 0xff006e },
  { id: 'soccer', name: 'Soccer Kit', price: 110, color: 0x2a9d8f },
  { id: 'varsity', name: 'Varsity Jacket', price: 140, color: 0x1d3557 },
]

export const SHOES: SimpleCosmetic<ShoesId>[] = [
  { id: 'none', name: 'Bare Paws', price: 0, color: 0x000000 },
  { id: 'sneakers', name: 'Sneakers', price: 60, color: 0xffffff },
  { id: 'boots', name: 'Boots', price: 85, color: 0x6b4428 },
  { id: 'sandals', name: 'Sandals', price: 45, color: 0xf4a261 },
  { id: 'rocket', name: 'Rocket Shoes', price: 160, color: 0xe63946 },
  { id: 'roller', name: 'Roller Skates', price: 130, color: 0x9b5de5 },
  { id: 'slippers', name: 'Slippers', price: 50, color: 0xff85a1 },
  { id: 'cleats', name: 'Cleats', price: 90, color: 0x1a1a1a },
  { id: 'heels', name: 'Fancy Heels', price: 120, color: 0xe63946 },
  { id: 'flippers', name: 'Flippers', price: 100, color: 0x00b4d8 },
  { id: 'iceSkates', name: 'Ice Skates', price: 140, color: 0x90e0ef },
  { id: 'hiking', name: 'Hiking Boots', price: 95, color: 0x606c38 },
  { id: 'socks', name: 'Cozy Socks', price: 40, color: 0xf8edeb },
  { id: 'cloud', name: 'Cloud Shoes', price: 150, color: 0xffffff },
  { id: 'ballet', name: 'Ballet Slippers', price: 110, color: 0xffc8dd },
  { id: 'cowboyBoots', name: 'Cowboy Boots', price: 125, color: 0xb56b45 },
  { id: 'moonBoots', name: 'Moon Boots', price: 155, color: 0xd8e2dc },
  { id: 'rainBoots', name: 'Rain Boots', price: 80, color: 0xffbe0b },
  { id: 'tap', name: 'Tap Shoes', price: 120, color: 0x1a1a1a },
  { id: 'furry', name: 'Furry Boots', price: 135, color: 0xf2e8d5 },
  { id: 'glow', name: 'Glow Sneakers', price: 160, color: 0x00f5d4 },
  { id: 'crocs', name: 'Comfy Clogs', price: 70, color: 0x4cc9f0 },
  { id: 'wings', name: 'Wing Shoes', price: 150, color: 0xffffff },
  { id: 'spats', name: 'Fancy Spats', price: 125, color: 0xf8f9fa },
  { id: 'platform', name: 'Platforms', price: 130, color: 0xff006e },
  { id: 'moccasin', name: 'Moccasins', price: 95, color: 0xb56b45 },
  { id: 'skiBoots', name: 'Ski Boots', price: 145, color: 0xe63946 },
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
