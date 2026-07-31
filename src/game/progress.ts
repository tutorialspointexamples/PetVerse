export type CompanionId = 'none' | 'sprout' | 'nibbles' | 'blinky' | 'pebble'

export type CompanionWave = OscillatorType

export interface CompanionDef {
  id: CompanionId
  name: string
  unlockCost: number
  fill: number
  accent: number
  /** Short label shown in Pets panel (unique voice identity). */
  voiceLabel: string
  voiceWave: CompanionWave
  voiceNotes: number[]
  voiceSlide: number
}

export const COMPANIONS: CompanionDef[] = [
  {
    id: 'none',
    name: 'None',
    unlockCost: 0,
    fill: 0,
    accent: 0,
    voiceLabel: '',
    voiceWave: 'sine',
    voiceNotes: [],
    voiceSlide: 1,
  },
  {
    id: 'sprout',
    name: 'Sprout',
    unlockCost: 100,
    fill: 0x7bc9a6,
    accent: 0xffe066,
    voiceLabel: 'Soft chirp',
    voiceWave: 'triangle',
    voiceNotes: [620, 780, 920],
    voiceSlide: 1.18,
  },
  {
    id: 'nibbles',
    name: 'Nibbles',
    unlockCost: 160,
    fill: 0xe8a070,
    accent: 0xff85a1,
    voiceLabel: 'Squeaky giggle',
    voiceWave: 'square',
    voiceNotes: [980, 740, 1100],
    voiceSlide: 0.85,
  },
  {
    id: 'blinky',
    name: 'Blinky',
    unlockCost: 220,
    fill: 0x80ffdb,
    accent: 0x5a189a,
    voiceLabel: 'Neon beep',
    voiceWave: 'sawtooth',
    voiceNotes: [440, 660, 880, 1320],
    voiceSlide: 1.35,
  },
  {
    id: 'pebble',
    name: 'Pebble',
    unlockCost: 180,
    fill: 0x8b5e3c,
    accent: 0xf4d35e,
    voiceLabel: 'Low rumble',
    voiceWave: 'sine',
    voiceNotes: [220, 280, 240],
    voiceSlide: 0.92,
  },
]

export function getCompanion(id: CompanionId): CompanionDef {
  return COMPANIONS.find((c) => c.id === id) ?? COMPANIONS[0]
}

export type SkillId = 'drums' | 'hoop' | 'boxing'

export interface SkillDef {
  id: SkillId
  name: string
  unlockLevel: number
  coinReward: number
  xpReward: number
}

export const SKILLS: SkillDef[] = [
  { id: 'drums', name: 'Beat Box', unlockLevel: 1, coinReward: 8, xpReward: 12 },
  { id: 'hoop', name: 'Hoop Toss', unlockLevel: 2, coinReward: 12, xpReward: 16 },
  { id: 'boxing', name: 'Paw Spar', unlockLevel: 3, coinReward: 16, xpReward: 20 },
]

export function getSkill(id: SkillId): SkillDef {
  return SKILLS.find((s) => s.id === id) ?? SKILLS[0]
}

export function levelFromXp(xp: number): number {
  return Math.max(1, Math.floor(xp / 50) + 1)
}
