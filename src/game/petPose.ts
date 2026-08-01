import type { Reaction } from '../state/gameStore'
import { deriveMood, type Needs } from './needs'

export interface PetPoseInput {
  time: number
  reaction: Reaction
  sleeping: boolean
  talking: boolean
  needs: Needs
  stretchT: number
  sneezeT: number
  yawnT: number
  earFlopT: number
}

/** Shared cartoon spine pose — bounce, squash, tilt, limb phase used by all pet layers. */
export interface PetPose {
  bounce: number
  sx: number
  sy: number
  tilt: number
  breath: number
  limbPhase: number
  headBob: number
  armLift: number
  earFlop: number
  mouthOpen: number
}

export function derivePose(input: PetPoseInput): PetPose {
  const { time, reaction, sleeping, talking, needs, stretchT, sneezeT, yawnT, earFlopT } = input
  const mood = deriveMood(needs)
  const reactive =
    reaction === 'laugh' || reaction === 'play' || reaction.startsWith('skill_')

  let bounce = Math.sin(time * 2.2) * 3
  if (sneezeT > 0) bounce = Math.sin(sneezeT * 40) * 6
  else if (stretchT > 0) bounce = -6 + Math.sin(stretchT * 4) * 4
  else if (sleeping) bounce = Math.sin(time * 1.1) * 1.2
  else if (reaction === 'laugh') bounce = Math.sin(time * 20) * 10
  else if (reaction === 'play' || reaction.startsWith('skill_')) bounce = Math.sin(time * 16) * 5
  else if (reaction.startsWith('eat')) bounce = Math.sin(time * 12) * 2
  else if (reaction === 'cure') bounce = Math.sin(time * 8) * 3
  else if (mood === 'sick') bounce = Math.sin(time * 1.2) * 1.2
  else if (mood === 'happy') bounce = Math.sin(time * 3.4) * 5

  const landing = Math.max(0, -bounce)
  const rising = Math.max(0, bounce)
  const sx = 1 + landing * 0.035 - rising * 0.022 + (reactive ? Math.sin(time * 12) * 0.03 : 0)
  const sy = 1 - landing * 0.035 + rising * 0.028 + (reactive ? Math.cos(time * 12) * 0.025 : 0)

  let tilt = Math.sin(time * 1.4) * 0.03
  if (reaction === 'laugh') tilt = Math.sin(time * 12) * 0.14
  else if (reaction === 'play' || reaction.startsWith('skill_')) tilt = Math.sin(time * 8) * 0.1
  else if (reaction === 'annoyed' || reaction === 'eat_spicy') tilt = -0.08
  else if (mood === 'sick') tilt = Math.sin(time * 0.9) * 0.05 - 0.06
  else if (sleeping) tilt = Math.sin(time * 0.8) * 0.02

  const limbPhase =
    reaction === 'play' || reaction.startsWith('skill_')
      ? Math.sin(time * 14) * 14
      : reaction === 'laugh'
        ? Math.sin(time * 16) * 6
        : Math.sin(time * 2.2) * 2

  const armLift =
    stretchT > 0
      ? 28 + Math.sin(stretchT * 5) * 6
      : reaction === 'skill_drums'
        ? 18 + Math.sin(time * 18) * 10
        : reaction === 'skill_boxing'
          ? 22 + Math.sin(time * 14) * 8
          : reaction === 'play'
            ? 12 + Math.sin(time * 10) * 6
            : 0

  const mouthOpen =
    talking || reaction === 'talk'
      ? 0.55 + Math.abs(Math.sin(time * 18)) * 0.45
      : yawnT > 0
        ? Math.min(1, yawnT) * 0.9
        : reaction === 'laugh'
          ? 0.7 + Math.sin(time * 14) * 0.2
          : reaction.startsWith('eat')
            ? 0.35 + Math.abs(Math.sin(time * 10)) * 0.4
            : 0.05

  return {
    bounce,
    sx,
    sy,
    tilt,
    breath: Math.sin(time * 2.1) * 2.5,
    limbPhase,
    headBob: sleeping ? Math.sin(time * 1.2) * 2 : bounce * 0.35,
    armLift,
    earFlop: earFlopT > 0 ? Math.sin(earFlopT * 18) * 12 : Math.sin(time * 2.4) * 2,
    mouthOpen,
  }
}
