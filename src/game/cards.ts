export type CardId =
  | 'beach_shell'
  | 'forest_leaf'
  | 'candy_swirl'
  | 'pirate_map'
  | 'coral_gem'
  | 'cyber_chip'
  | 'dragon_scale'
  | 'alien_orb'
  | 'sky_medal'
  | 'dunk_star'
  | 'trail_comet'
  | 'plane_blueprint'
  | 'yard_balloon'
  | 'photo_flash'
  | 'brush_sparkle'
  | 'event_badge'
  | 'golden_paw'
  | 'midnight_star'
  | 'sofa_cushion'
  | 'stove_spark'
  | 'lamp_glow'
  | 'swing_ticket'
  | 'comet_core'
  | 'mission_ribbon'
  | 'fountain_splash'
  | 'cinema_ticket'
  | 'popcorn_box'
  | 'sandbox_gem'
  | 'slide_whistle'

export interface CardDef {
  id: CardId
  name: string
  rarity: 'common' | 'rare' | 'epic'
  blurb: string
  color: number
}

export const CARDS: CardDef[] = [
  { id: 'beach_shell', name: 'Beach Shell', rarity: 'common', blurb: 'Found on Adventure Beach.', color: 0xf2cc8f },
  { id: 'forest_leaf', name: 'Magic Leaf', rarity: 'common', blurb: 'Glows in Magic Forest.', color: 0x95d5b2 },
  { id: 'candy_swirl', name: 'Candy Swirl', rarity: 'rare', blurb: 'Sweet souvenir from Candy Kingdom.', color: 0xff85a1 },
  { id: 'pirate_map', name: 'Pirate Map', rarity: 'rare', blurb: 'X marks Pirate Island loot.', color: 0xe9b44c },
  { id: 'coral_gem', name: 'Coral Gem', rarity: 'rare', blurb: 'From Underwater Home reefs.', color: 0x4cc9f0 },
  { id: 'cyber_chip', name: 'Cyber Chip', rarity: 'epic', blurb: 'Pulsing circuit from Cyber City.', color: 0x00f5d4 },
  { id: 'dragon_scale', name: 'Dragon Scale', rarity: 'epic', blurb: 'Warm relic of Dragon Kingdom.', color: 0x9b2226 },
  { id: 'alien_orb', name: 'Alien Orb', rarity: 'epic', blurb: 'Humming souvenir from Alien Planet.', color: 0x80ffdb },
  { id: 'sky_medal', name: 'Sky Medal', rarity: 'common', blurb: 'Earned in Sky Race.', color: 0x4cc9f0 },
  { id: 'dunk_star', name: 'Dunk Star', rarity: 'common', blurb: 'Swish prize from Dunk-a-Pet.', color: 0xf4d35e },
  { id: 'trail_comet', name: 'Trail Comet', rarity: 'rare', blurb: 'Caught on Space Trails.', color: 0xf4a261 },
  { id: 'plane_blueprint', name: 'Plane Blueprint', rarity: 'rare', blurb: 'From Build Your Plane.', color: 0xe76f51 },
  { id: 'yard_balloon', name: 'Yard Balloon', rarity: 'common', blurb: 'Popped up in the backyard.', color: 0xff85a1 },
  { id: 'photo_flash', name: 'Photo Flash', rarity: 'common', blurb: 'Snapped in the photo booth.', color: 0xffffff },
  { id: 'brush_sparkle', name: 'Brush Sparkle', rarity: 'rare', blurb: 'Shiny smile after brushing.', color: 0xcaf0f8 },
  { id: 'event_badge', name: 'Event Badge', rarity: 'rare', blurb: 'Seasonal login keepsake.', color: 0x9b5de5 },
  { id: 'golden_paw', name: 'Golden Paw', rarity: 'epic', blurb: 'Legendary care streak trophy.', color: 0xf4d35e },
  { id: 'midnight_star', name: 'Midnight Star', rarity: 'epic', blurb: 'Rare night-sky collectible.', color: 0x3a0ca3 },
  { id: 'sofa_cushion', name: 'Sofa Cushion', rarity: 'common', blurb: 'Lounged on the living sofa.', color: 0xe07a5f },
  { id: 'stove_spark', name: 'Stove Spark', rarity: 'common', blurb: 'Cooked a quick kitchen snack.', color: 0xffbe0b },
  { id: 'lamp_glow', name: 'Lamp Glow', rarity: 'common', blurb: 'Clicked the bedroom night light.', color: 0xffe066 },
  { id: 'swing_ticket', name: 'Swing Ticket', rarity: 'rare', blurb: 'Soared on the backyard swing.', color: 0xe76f51 },
  { id: 'comet_core', name: 'Comet Core', rarity: 'epic', blurb: 'Caught a Space Trails comet.', color: 0x00f5d4 },
  { id: 'mission_ribbon', name: 'Mission Ribbon', rarity: 'rare', blurb: 'Cleared a daily mission streak.', color: 0x9b5de5 },
  { id: 'fountain_splash', name: 'Fountain Splash', rarity: 'common', blurb: 'Splashed the backyard fountain.', color: 0x4cc9f0 },
  { id: 'cinema_ticket', name: 'Cinema Ticket', rarity: 'rare', blurb: 'First seat in the chill cinema lounge.', color: 0xe63946 },
  { id: 'popcorn_box', name: 'Popcorn Box', rarity: 'common', blurb: 'Crunched snacks during movie night.', color: 0xffbe0b },
  { id: 'sandbox_gem', name: 'Sandbox Gem', rarity: 'common', blurb: 'Dug up treasure in the backyard sandbox.', color: 0xe9c46a },
  { id: 'slide_whistle', name: 'Slide Whistle', rarity: 'rare', blurb: 'Whooshed down the backyard slide.', color: 0xffbe0b },
]

export function getCard(id: CardId): CardDef {
  return CARDS.find((c) => c.id === id) ?? CARDS[0]
}

export type CardSetId = 'worlds' | 'arcade' | 'care' | 'legend'

export interface CardSetDef {
  id: CardSetId
  name: string
  blurb: string
  cards: CardId[]
  rewardCoins: number
  rewardStars: number
  rewardFuel: number
}

/** MTT2-style album set completion bonuses. */
export const CARD_SETS: CardSetDef[] = [
  {
    id: 'worlds',
    name: 'World Traveler',
    blurb: 'Collect a souvenir from every plane destination.',
    cards: [
      'beach_shell',
      'forest_leaf',
      'candy_swirl',
      'pirate_map',
      'coral_gem',
      'cyber_chip',
      'dragon_scale',
      'alien_orb',
    ],
    rewardCoins: 45,
    rewardStars: 2,
    rewardFuel: 2,
  },
  {
    id: 'arcade',
    name: 'Arcade Ace',
    blurb: 'Clear every offline mini-game card.',
    cards: ['sky_medal', 'dunk_star', 'trail_comet', 'plane_blueprint', 'comet_core'],
    rewardCoins: 35,
    rewardStars: 1,
    rewardFuel: 1,
  },
  {
    id: 'care',
    name: 'Care Champion',
    blurb: 'Home-care keepsakes from rooms and routines.',
    cards: [
      'yard_balloon',
      'photo_flash',
      'brush_sparkle',
      'sofa_cushion',
      'stove_spark',
      'lamp_glow',
      'swing_ticket',
      'fountain_splash',
      'mission_ribbon',
      'cinema_ticket',
      'popcorn_box',
      'sandbox_gem',
      'slide_whistle',
    ],
    rewardCoins: 40,
    rewardStars: 1,
    rewardFuel: 2,
  },
  {
    id: 'legend',
    name: 'Legend Album',
    blurb: 'Gather every epic rarity card.',
    cards: [
      'cyber_chip',
      'dragon_scale',
      'alien_orb',
      'golden_paw',
      'midnight_star',
      'comet_core',
    ],
    rewardCoins: 60,
    rewardStars: 3,
    rewardFuel: 3,
  },
]

export function getCardSet(id: CardSetId): CardSetDef {
  return CARD_SETS.find((s) => s.id === id) ?? CARD_SETS[0]
}

export function setProgress(owned: CardId[], set: CardSetDef): { owned: number; total: number; complete: boolean } {
  const have = set.cards.filter((c) => owned.includes(c)).length
  return { owned: have, total: set.cards.length, complete: have >= set.cards.length }
}

export const WORLD_CARDS: Record<string, CardId> = {
  beach: 'beach_shell',
  forest: 'forest_leaf',
  candy: 'candy_swirl',
  pirate: 'pirate_map',
  underwater: 'coral_gem',
  cyber: 'cyber_chip',
  dragon: 'dragon_scale',
  alien: 'alien_orb',
}

export const MINIGAME_CARDS: Record<string, CardId> = {
  skyDash: 'sky_medal',
  dunkToss: 'dunk_star',
  spaceTrails: 'trail_comet',
  buildPlane: 'plane_blueprint',
}
