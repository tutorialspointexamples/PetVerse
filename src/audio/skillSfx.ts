/** Tiny WebAudio blips for MTT2-style skill performances (drums / hoop / boxing). */

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  try {
    if (!ctx) ctx = new AudioContext()
    return ctx
  } catch {
    return null
  }
}

function tone(
  frequency: number,
  start: number,
  duration: number,
  type: OscillatorType,
  gain = 0.08,
) {
  const ac = getCtx()
  if (!ac) return
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = type
  osc.frequency.value = frequency
  g.gain.value = gain
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + start + duration)
  osc.connect(g)
  g.connect(ac.destination)
  osc.start(ac.currentTime + start)
  osc.stop(ac.currentTime + start + duration)
}

export function playSkillSfx(skill: 'drums' | 'hoop' | 'boxing') {
  const ac = getCtx()
  if (!ac) return
  void ac.resume()
  if (skill === 'drums') {
    tone(180, 0, 0.08, 'triangle', 0.1)
    tone(140, 0.16, 0.08, 'triangle', 0.09)
    tone(200, 0.32, 0.08, 'triangle', 0.1)
    tone(120, 0.48, 0.1, 'square', 0.06)
    tone(180, 0.7, 0.08, 'triangle', 0.09)
    tone(220, 0.95, 0.1, 'triangle', 0.08)
  } else if (skill === 'hoop') {
    tone(520, 0, 0.12, 'sine', 0.07)
    tone(660, 0.35, 0.14, 'sine', 0.08)
    tone(780, 0.75, 0.18, 'triangle', 0.07)
    tone(420, 1.1, 0.1, 'sine', 0.05)
  } else {
    tone(90, 0, 0.06, 'square', 0.07)
    tone(110, 0.22, 0.06, 'square', 0.07)
    tone(80, 0.45, 0.08, 'square', 0.08)
    tone(130, 0.7, 0.05, 'square', 0.06)
    tone(100, 0.95, 0.1, 'sawtooth', 0.05)
  }
}
