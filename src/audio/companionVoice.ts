import type { CompanionId } from '../game/progress'
import { getCompanion } from '../game/progress'

let sharedCtx: AudioContext | null = null

function getCtx(): AudioContext | null {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  if (!sharedCtx) sharedCtx = new AC()
  return sharedCtx
}

/** Short unique chirp / squeak per companion — distinct from pet talk-back. */
export function playCompanionVoice(id: CompanionId): void {
  if (id === 'none') return
  const def = getCompanion(id)
  const ctx = getCtx()
  if (!ctx) return

  void ctx.resume().catch(() => undefined)

  const now = ctx.currentTime
  const master = ctx.createGain()
  master.gain.value = 0.0001
  master.connect(ctx.destination)
  master.gain.setValueAtTime(0.0001, now)
  master.gain.exponentialRampToValueAtTime(0.22, now + 0.02)
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.45)

  const notes = def.voiceNotes
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = freq * 1.2
    filter.Q.value = 4
    osc.type = def.voiceWave
    osc.frequency.setValueAtTime(freq, now + i * 0.09)
    osc.frequency.exponentialRampToValueAtTime(freq * def.voiceSlide, now + i * 0.09 + 0.08)
    gain.gain.setValueAtTime(0.0001, now + i * 0.09)
    gain.gain.exponentialRampToValueAtTime(0.35, now + i * 0.09 + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.09 + 0.12)
    osc.connect(filter)
    filter.connect(gain)
    gain.connect(master)
    osc.start(now + i * 0.09)
    osc.stop(now + i * 0.09 + 0.14)
  })
}
